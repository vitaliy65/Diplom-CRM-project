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

type TicketsState = {
  items: Ticket[];
  loading: boolean;
  saving: boolean;
  error: string | null;
};

const initialState: TicketsState = {
  items: [],
  loading: true,
  saving: false,
  error: null,
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
  async (
    payload: Pick<
      Ticket,
      "clientId" | "clientName" | "clientPhone" | "device" | "problem"
    >,
    { getState, rejectWithValue },
  ) => {
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
      const existing = (getState() as RootState).clients.items.find(
        (c) => c.id === payload.clientId,
      );
      await updateDoc(doc(db, "clients", payload.clientId), {
        ticketCount: (existing?.ticketCount || 0) + 1,
      });
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
      await updateDoc(doc(db, "tickets", payload.id), {
        status: payload.newStatus,
      });
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

export const selectTickets = (state: RootState) => state.tickets.items;
export const selectTicketsLoading = (state: RootState) => state.tickets.loading;
export const selectTicketsSaving = (state: RootState) => state.tickets.saving;
export const selectTicketsError = (state: RootState) => state.tickets.error;

export default ticketsSlice.reducer;
