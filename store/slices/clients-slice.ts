import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import type { Client, UserRole } from "@/lib/types";
import type { RootState } from "@/store";

// --- добавляем только функционал страничек (pagination)

type ClientsState = {
  items: Client[];
  loading: boolean;
  saving: boolean;
  error: string | null;

  currentPage: number;
  rowsPerPage: number;
};

const DEFAULT_ROWS_PER_PAGE = 10;

const initialState: ClientsState = {
  items: [],
  loading: true,
  saving: false,
  error: null,
  currentPage: 1,
  rowsPerPage: DEFAULT_ROWS_PER_PAGE,
};

let unsubscribeClients: (() => void) | null = null;

function canManageClients(role?: UserRole) {
  return role === "admin" || role === "manager";
}

export const subscribeClients = createAsyncThunk(
  "clients/subscribe",
  async (_, { dispatch }) => {
    if (!db || !isFirebaseConfigured) {
      dispatch(clientsSlice.actions.setClients([]));
      return;
    }
    if (unsubscribeClients) {
      return;
    }
    const ref = collection(db, "clients");
    unsubscribeClients = onSnapshot(ref, (snapshot) => {
      const payload: Client[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Client, "id">),
      }));
      dispatch(clientsSlice.actions.setClients(payload));
    });
  },
);

export const createClient = createAsyncThunk(
  "clients/create",
  async (
    payload: Omit<Client, "id" | "ticketCount">,
    { getState, rejectWithValue },
  ) => {
    if (!db || !isFirebaseConfigured) {
      return rejectWithValue("Firebase не налаштований.");
    }
    const role = (getState() as RootState).auth.user?.role;
    if (!canManageClients(role)) {
      return rejectWithValue("Недостатньо прав для створення клієнта.");
    }
    try {
      await addDoc(collection(db, "clients"), {
        ...payload,
        ticketCount: 0,
        createdAt: serverTimestamp(),
      });
    } catch {
      return rejectWithValue("Не вдалося створити клієнта.");
    }
  },
);

export const updateClient = createAsyncThunk(
  "clients/update",
  async (
    payload: { id: string; data: Partial<Omit<Client, "id">> },
    { getState, rejectWithValue },
  ) => {
    if (!db || !isFirebaseConfigured) {
      return rejectWithValue("Firebase не налаштований.");
    }
    const role = (getState() as RootState).auth.user?.role;
    if (!canManageClients(role)) {
      return rejectWithValue("Недостатньо прав для редагування клієнта.");
    }
    try {
      await updateDoc(doc(db, "clients", payload.id), payload.data);
    } catch {
      return rejectWithValue("Не вдалося оновити клієнта.");
    }
  },
);

export const deleteClient = createAsyncThunk(
  "clients/delete",
  async (id: string, { getState, rejectWithValue }) => {
    if (!db || !isFirebaseConfigured) {
      return rejectWithValue("Firebase не налаштований.");
    }
    const role = (getState() as RootState).auth.user?.role;
    if (!canManageClients(role)) {
      return rejectWithValue("Недостатньо прав для видалення клієнта.");
    }
    try {
      await deleteDoc(doc(db, "clients", id));
    } catch {
      return rejectWithValue("Не вдалося видалити клієнта.");
    }
  },
);

const clientsSlice = createSlice({
  name: "clients",
  initialState,
  reducers: {
    setClients: (state, action: { payload: Client[] }) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    setCurrentPage: (state, action: { payload: number }) => {
      state.currentPage = action.payload;
    },
    setRowsPerPage: (state, action: { payload: number }) => {
      state.rowsPerPage = action.payload;
      state.currentPage = 1; // сбрасываем страницу на первую при смене rowsPerPage
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createClient.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createClient.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(createClient.rejected, (state, action) => {
        state.saving = false;
        state.error =
          (action.payload as string) || "Помилка збереження клієнта.";
      })
      .addCase(updateClient.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateClient.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(updateClient.rejected, (state, action) => {
        state.saving = false;
        state.error =
          (action.payload as string) || "Помилка оновлення клієнта.";
      })
      .addCase(deleteClient.rejected, (state, action) => {
        state.error =
          (action.payload as string) || "Помилка видалення клієнта.";
      });
  },
});

// Селекторы для пагинации клиентов:

export const selectClients = (state: RootState) => state.clients.items;
export const selectClientsLoading = (state: RootState) => state.clients.loading;
export const selectClientsSaving = (state: RootState) => state.clients.saving;
export const selectClientsError = (state: RootState) => state.clients.error;

// Пагинированный список клиентов для текущей страницы
export const selectPaginatedClients = (state: RootState) => {
  const { items, currentPage, rowsPerPage } = state.clients;
  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = startIdx + rowsPerPage;
  return items.slice(startIdx, endIdx);
};
export const selectClientsTotalRows = (state: RootState) =>
  state.clients.items.length;
export const selectClientsCurrentPage = (state: RootState) =>
  state.clients.currentPage;
export const selectClientsRowsPerPage = (state: RootState) =>
  state.clients.rowsPerPage;

// Экспортируем actions пагинации
export const { setCurrentPage, setRowsPerPage } = clientsSlice.actions;

export default clientsSlice.reducer;
