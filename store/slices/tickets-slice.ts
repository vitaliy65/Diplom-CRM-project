import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import type { RootState } from "@/store";
import type { Ticket, TicketStatus, UserRole } from "@/lib/types";
import { computeSlaViolation } from "@/lib/sla";
import { canTransition, getStatusTransitionError } from "@/lib/ticket-status";
import { commitStockDeltas } from "@/lib/ticket-firestore";
import { enrichUsedParts } from "@/lib/storage-stock";
import {
  countTicketsForClient,
  normalizeTicketFromFirestore,
  resolveTicketSnapshots,
  setClientTicketCount,
} from "@/lib/ticket-sync";
import {
  createTicketSchema,
  updateTicketSchema,
} from "@/lib/validations/schemas";
import { parseWithSchema } from "@/lib/validations/parse";

type TicketsState = {
  items: Ticket[];
  filteredItems: Ticket[];
  filterActive: boolean;
  loading: boolean;
  saving: boolean;
  error: string | null;
  currentPage: number;
  rowsPerPage: number;
};

const DEFAULT_ROWS_PER_PAGE = 10;

function getDisplayList<T>(items: T[], filteredItems: T[]): T[] {
  return filteredItems.length > 0 ? filteredItems : items;
}

const initialState: TicketsState = {
  items: [],
  filteredItems: [],
  filterActive: false,
  loading: true,
  saving: false,
  error: null,
  currentPage: 1,
  rowsPerPage: DEFAULT_ROWS_PER_PAGE,
};

let unsubscribeTickets: (() => void) | null = null;

function canCreateTicket(role?: UserRole) {
  return role === "admin" || role === "manager";
}

function canUpdateTicket(role?: UserRole) {
  return role === "admin" || role === "manager" || role === "master";
}

function canDeleteTicket(role?: UserRole) {
  return role === "admin" || role === "manager";
}

function getTicketContext(state: RootState) {
  return {
    clients: state.clients.items,
    masters: state.users.items.filter((u) => u.role === "master"),
    storage: state.storage.items,
    tickets: state.tickets.items,
  };
}

export const subscribeTickets = createAsyncThunk(
  "tickets/subscribe",
  async (_, { dispatch }) => {
    if (!db || !isFirebaseConfigured) {
      dispatch(ticketsSlice.actions.setTickets([]));
      return;
    }
    if (unsubscribeTickets) {
      return;
    }
    unsubscribeTickets = onSnapshot(collection(db, "tickets"), (snapshot) => {
      const items: Ticket[] = snapshot.docs.map((d) =>
        normalizeTicketFromFirestore(d.id, d.data() as Partial<Ticket>),
      );
      dispatch(ticketsSlice.actions.setTickets(items));
    });
  },
);

export const createTicket = createAsyncThunk(
  "tickets/create",
  async (payload: Partial<Ticket>, { getState, rejectWithValue }) => {
    if (!db || !isFirebaseConfigured) {
      return rejectWithValue("Firebase не налаштований.");
    }
    const state = getState() as RootState;
    const role = state.auth.user?.role;
    if (!canCreateTicket(role)) {
      return rejectWithValue("Недостатньо прав для створення заявки.");
    }

    const ctx = getTicketContext(getState() as RootState);
    const payloadWithParts = {
      ...payload,
      usedParts: enrichUsedParts(
        payload.usedParts as Ticket["usedParts"],
        ctx.storage,
      ),
    };
    const parsed = parseWithSchema(createTicketSchema, payloadWithParts);
    if (!parsed.success) {
      return rejectWithValue(parsed.message);
    }

    const enriched = resolveTicketSnapshots(
      parsed.data as Partial<Ticket>,
      ctx.clients,
      ctx.masters,
    );
    const usedParts = enrichUsedParts(enriched.usedParts, ctx.storage);

    const stockError = await commitStockDeltas(ctx.storage, [], usedParts);
    if (stockError) {
      return rejectWithValue(stockError);
    }

    try {
      await addDoc(collection(db, "tickets"), {
        ...enriched,
        status: "received",
        masterId: null,
        masterName: null,
        createdAt: new Date().toISOString(),
        readyAt: "",
        slaViolation: false,
        comments: [],
      });

      const clientId = enriched.clientId as string;
      if (clientId) {
        const count = countTicketsForClient(ctx.tickets, clientId) + 1;
        await setClientTicketCount(clientId, count);
      }
    } catch {
      await commitStockDeltas(ctx.storage, usedParts, []);
      return rejectWithValue("Не вдалося створити заявку.");
    }
  },
);

export const updateTicket = createAsyncThunk(
  "tickets/update",
  async (
    payload: { id: string; data: Partial<Omit<Ticket, "id">> },
    { getState, rejectWithValue },
  ) => {
    if (!db || !isFirebaseConfigured) {
      return rejectWithValue("Firebase не налаштований.");
    }
    const state = getState() as RootState;
    const role = state.auth.user?.role;
    if (!canUpdateTicket(role)) {
      return rejectWithValue("Недостатньо прав для редагування заявки.");
    }

    const existing = state.tickets.items.find((t) => t.id === payload.id);
    if (!existing) {
      return rejectWithValue("Заявку не знайдено.");
    }

    const ctx = getTicketContext(state);
    const dataToValidate = {
      ...payload.data,
      ...(payload.data.usedParts !== undefined
        ? {
            usedParts: enrichUsedParts(payload.data.usedParts, ctx.storage),
          }
        : {}),
    };
    const parsed = parseWithSchema(updateTicketSchema, dataToValidate);
    if (!parsed.success) {
      return rejectWithValue(parsed.message);
    }
    const { slaViolation: _ignoredSla, ...safeData } = parsed.data as Partial<
      Ticket & { slaViolation?: boolean }
    >;
    const merged = { ...existing, ...safeData };
    const enriched = resolveTicketSnapshots(merged, ctx.clients, ctx.masters);

    if (
      enriched.status &&
      enriched.status !== existing.status &&
      !canTransition(existing.status, enriched.status)
    ) {
      return rejectWithValue(
        getStatusTransitionError(existing.status, enriched.status) ??
          "Недопустима зміна статусу.",
      );
    }

    if (role === "master") {
      const allowed =
        enriched.status === existing.status ||
        ((existing.status === "received" ||
          existing.status === "in-progress") &&
          enriched.status === "in-progress") ||
        (existing.status === "in-progress" && enriched.status === "ready");
      if (!allowed) {
        return rejectWithValue("Майстер не може встановити цей статус.");
      }
    }

    const oldParts = existing.usedParts ?? [];
    const newParts = enriched.usedParts ?? oldParts;
    const stockError = await commitStockDeltas(ctx.storage, oldParts, newParts);
    if (stockError) {
      return rejectWithValue(stockError);
    }

    const updateData: Partial<Ticket> = { ...enriched };
    delete (updateData as { id?: string }).id;

    if (enriched.status === "ready" && existing.status !== "ready") {
      updateData.readyAt = new Date().toISOString();
    }

    updateData.slaViolation = computeSlaViolation({
      ...existing,
      ...updateData,
      readyAt: updateData.readyAt ?? existing.readyAt,
    } as Ticket);

    try {
      await updateDoc(doc(db, "tickets", payload.id), updateData);

      if (enriched.clientId && enriched.clientId !== existing.clientId) {
        if (existing.clientId) {
          const oldCount = countTicketsForClient(
            ctx.tickets.filter((t) => t.id !== payload.id),
            existing.clientId,
          );
          await setClientTicketCount(existing.clientId, oldCount);
        }
        const newCount =
          countTicketsForClient(
            ctx.tickets.filter((t) => t.id !== payload.id),
            enriched.clientId,
          ) + 1;
        await setClientTicketCount(enriched.clientId, newCount);
      }
    } catch {
      await commitStockDeltas(ctx.storage, newParts, oldParts);
      return rejectWithValue("Не вдалося оновити заявку.");
    }
  },
);

export const deleteTicket = createAsyncThunk(
  "tickets/delete",
  async (ticketId: string, { getState, rejectWithValue }) => {
    if (!db || !isFirebaseConfigured) {
      return rejectWithValue("Firebase не налаштований.");
    }
    const state = getState() as RootState;
    const role = state.auth.user?.role;
    if (!canDeleteTicket(role)) {
      return rejectWithValue("Недостатньо прав для видалення заявки.");
    }

    const existing = state.tickets.items.find((t) => t.id === ticketId);
    if (!existing) {
      return rejectWithValue("Заявку не знайдено.");
    }

    const ctx = getTicketContext(state);
    const stockError = await commitStockDeltas(
      ctx.storage,
      existing.usedParts ?? [],
      [],
    );
    if (stockError) {
      return rejectWithValue(stockError);
    }

    try {
      await deleteDoc(doc(db, "tickets", ticketId));
      if (existing.clientId) {
        const count = countTicketsForClient(
          ctx.tickets.filter((t) => t.id !== ticketId),
          existing.clientId,
        );
        await setClientTicketCount(existing.clientId, count);
      }
    } catch {
      await commitStockDeltas(ctx.storage, [], existing.usedParts ?? []);
      return rejectWithValue("Не вдалося видалити заявку.");
    }
  },
);

export const changeTicketStatus = createAsyncThunk(
  "tickets/changeStatus",
  async (
    payload: { id: string; oldStatus: TicketStatus; newStatus: TicketStatus },
    { getState, rejectWithValue },
  ) => {
    if (!db || !isFirebaseConfigured) {
      return rejectWithValue("Firebase не налаштований.");
    }
    const state = getState() as RootState;
    const currentUser = state.auth.user;
    if (!canUpdateTicket(currentUser?.role)) {
      return rejectWithValue("Недостатньо прав для зміни статусу.");
    }

    const existing = state.tickets.items.find((t) => t.id === payload.id);
    if (!existing) {
      return rejectWithValue("Заявку не знайдено.");
    }

    const from = existing.status;
    const to = payload.newStatus;

    const transitionError = getStatusTransitionError(from, to);
    if (transitionError) {
      return rejectWithValue(transitionError);
    }

    if (currentUser?.role === "master") {
      const masterAllowed =
        (from === "received" && to === "in-progress") ||
        (from === "in-progress" && to === "ready") ||
        from === to;
      if (!masterAllowed) {
        return rejectWithValue("Майстер не може встановити цей статус.");
      }
    }

    try {
      const updateData: Partial<Ticket> = { status: to };
      if (to === "ready" && from !== "ready") {
        updateData.readyAt = new Date().toISOString();
      }
      const merged = { ...existing, ...updateData };
      updateData.slaViolation = computeSlaViolation(merged);

      await updateDoc(doc(db, "tickets", payload.id), updateData);
      await addDoc(collection(db, "logs"), {
        ticketId: payload.id,
        oldStatus: from,
        newStatus: to,
        changedBy: currentUser?.id || "unknown",
        changedByName: currentUser?.name || "Невідомо",
        createdAt: new Date().toISOString(),
      });
    } catch {
      return rejectWithValue("Не вдалося змінити статус заявки.");
    }
  },
);

const ticketsSlice = createSlice({
  name: "tickets",
  initialState,
  reducers: {
    setTickets: (state, action: { payload: Ticket[] }) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    setCurrentPage: (state, action: { payload: number }) => {
      state.currentPage = action.payload;
    },
    setRowsPerPage: (state, action: { payload: number }) => {
      state.rowsPerPage = action.payload;
      state.currentPage = 1;
    },
    setFilteredItems: (
      state,
      action: { payload: { items: Ticket[]; filterActive: boolean } },
    ) => {
      const { items, filterActive } = action.payload;
      const filterJustActivated = filterActive && !state.filterActive;
      state.filteredItems = items;
      state.filterActive = filterActive;
      if (filterJustActivated) {
        state.currentPage = 1;
      }
    },
    clearFilteredItems: (state) => {
      state.filteredItems = [];
      state.filterActive = false;
      state.currentPage = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createTicket.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createTicket.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(createTicket.rejected, (state, action) => {
        state.saving = false;
        state.error = (action.payload as string) || "Помилка створення заявки.";
      })
      .addCase(updateTicket.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateTicket.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(updateTicket.rejected, (state, action) => {
        state.saving = false;
        state.error = (action.payload as string) || "Помилка оновлення заявки.";
      })
      .addCase(deleteTicket.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(deleteTicket.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(deleteTicket.rejected, (state, action) => {
        state.saving = false;
        state.error = (action.payload as string) || "Помилка видалення заявки.";
      })
      .addCase(changeTicketStatus.rejected, (state, action) => {
        state.error = (action.payload as string) || "Помилка зміни статусу.";
      });
  },
});

export const selectTickets = (state: RootState) => state.tickets.items;
export const selectFilteredTickets = (state: RootState) =>
  state.tickets.filteredItems;
export const selectTicketsLoading = (state: RootState) => state.tickets.loading;
export const selectTicketsSaving = (state: RootState) => state.tickets.saving;
export const selectTicketsError = (state: RootState) => state.tickets.error;

export const selectPaginatedTickets = (state: RootState) => {
  const { items, filteredItems, currentPage, rowsPerPage } = state.tickets;
  const data = getDisplayList(items, filteredItems);
  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = startIdx + rowsPerPage;
  return data.slice(startIdx, endIdx);
};

export const selectTicketsTotalRows = (state: RootState) => {
  const { items, filteredItems } = state.tickets;
  return getDisplayList(items, filteredItems).length;
};

export const selectTicketsCurrentPage = (state: RootState) =>
  state.tickets.currentPage;
export const selectTicketsRowsPerPage = (state: RootState) =>
  state.tickets.rowsPerPage;

export const {
  setCurrentPage,
  setRowsPerPage,
  setTickets,
  setFilteredItems,
  clearFilteredItems,
} = ticketsSlice.actions;

export default ticketsSlice.reducer;
