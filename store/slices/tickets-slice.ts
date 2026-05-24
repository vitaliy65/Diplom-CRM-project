import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import type { RootState } from "@/store";
import type { Ticket, TicketStatus, UserRole } from "@/lib/types";

// New pagination state
type TicketsState = {
  items: Ticket[];
  filteredItems: Ticket[];
  loading: boolean;
  saving: boolean;
  error: string | null;

  // Пагинация
  currentPage: number;
  rowsPerPage: number;
};

const DEFAULT_ROWS_PER_PAGE = 10;

const initialState: TicketsState = {
  items: [],
  filteredItems: [],
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
      const items: Ticket[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Ticket, "id">),
      }));
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
    const role = (getState() as RootState).auth.user?.role;
    if (!canCreateTicket(role)) {
      return rejectWithValue("Недостатньо прав для створення заявки.");
    }
    try {
      await addDoc(collection(db, "tickets"), {
        ...payload,
        status: "received",
        masterId: null,
        masterName: null,
        createdAt: new Date().toISOString(),
        slaViolation: false,
        comments: [],
      });

      const clientId = payload.clientId as string;
      if (clientId) {
        const existing = (getState() as RootState).clients.items.find(
          (c) => c.id === clientId,
        );
        await updateDoc(doc(collection(db, "clients"), clientId), {
          ticketCount: (existing?.ticketCount || 0) + 1,
        });
      }
    } catch {
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
    const role = (getState() as RootState).auth.user?.role;
    if (!canUpdateTicket(role)) {
      return rejectWithValue("Недостатньо прав для редагування заявки.");
    }
    try {
      await updateDoc(doc(db, "tickets", payload.id), payload.data);
    } catch {
      return rejectWithValue("Не вдалося оновити заявку.");
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
    try {
      // Если статус меняется на "ready" — сохраняем readyAt, иначе не трогаем
      const updateData: any = {
        status: payload.newStatus,
      };
      if (payload.newStatus === "ready") {
        updateData.readyAt = new Date().toISOString();
      }
      await updateDoc(doc(db, "tickets", payload.id), updateData);
      await addDoc(collection(db, "logs"), {
        ticketId: payload.id,
        oldStatus: payload.oldStatus,
        newStatus: payload.newStatus,
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
    // Добавляем reducers для пагинации и фильтрации
    setCurrentPage: (state, action: { payload: number }) => {
      state.currentPage = action.payload;
    },
    setRowsPerPage: (state, action: { payload: number }) => {
      state.rowsPerPage = action.payload;
      state.currentPage = 1;
    },
    setFilteredItems: (state, action: { payload: Ticket[] }) => {
      state.filteredItems = action.payload;
      state.currentPage = 1; // Сброс страницы при установке нового фильтра
    },
    clearFilteredItems: (state) => {
      state.filteredItems = [];
      state.currentPage = 1; // Сброс страницы при сбросе фильтра
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
      .addCase(changeTicketStatus.rejected, (state, action) => {
        state.error = (action.payload as string) || "Помилка зміни статусу.";
      });
  },
});

// Селекторы для получения данных
export const selectTickets = (state: RootState) => state.tickets.items;
export const selectFilteredTickets = (state: RootState) =>
  state.tickets.filteredItems;
export const selectTicketsLoading = (state: RootState) => state.tickets.loading;
export const selectTicketsSaving = (state: RootState) => state.tickets.saving;
export const selectTicketsError = (state: RootState) => state.tickets.error;

// Селектор для пагинированных данных с учетом фильтрации
export const selectPaginatedTickets = (state: RootState) => {
  const { items, filteredItems, currentPage, rowsPerPage } = state.tickets;
  const data = filteredItems.length > 0 ? filteredItems : items;
  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = startIdx + rowsPerPage;
  return data.slice(startIdx, endIdx);
};

export const selectTicketsTotalRows = (state: RootState) => {
  const { items, filteredItems } = state.tickets;
  return filteredItems.length > 0 ? filteredItems.length : items.length;
};
export const selectTicketsCurrentPage = (state: RootState) =>
  state.tickets.currentPage;
export const selectTicketsRowsPerPage = (state: RootState) =>
  state.tickets.rowsPerPage;

// Экспортируем actions для управления пагинацией и фильтрацией
export const {
  setCurrentPage,
  setRowsPerPage,
  setTickets,
  setFilteredItems,
  clearFilteredItems,
} = ticketsSlice.actions;

export default ticketsSlice.reducer;
