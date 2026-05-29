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
import { clientSchema } from "@/lib/validations/schemas";
import { parseWithSchema } from "@/lib/validations/parse";
import { syncTicketsForClient } from "@/lib/ticket-sync";

// --- добавляем функционал страничек (pagination) и фильтрации (filtered) ---

type ClientsState = {
  items: Client[];
  filteredItems: Client[];
  filterActive: boolean;
  loading: boolean;
  saving: boolean;
  error: string | null;
  currentPage: number;
  rowsPerPage: number;
};

const DEFAULT_ROWS_PER_PAGE = 10;

const initialState: ClientsState = {
  items: [],
  filteredItems: [],
  filterActive: false,
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
  async (payload: Omit<Client, "id">, { getState, rejectWithValue }) => {
    if (!db || !isFirebaseConfigured) {
      return rejectWithValue("Firebase не налаштований.");
    }
    const role = (getState() as RootState).auth.user?.role;
    if (!canManageClients(role)) {
      return rejectWithValue("Недостатньо прав для створення клієнта.");
    }
    const parsed = parseWithSchema(clientSchema, payload);
    if (!parsed.success) {
      return rejectWithValue(parsed.message);
    }

    try {
      await addDoc(collection(db, "clients"), {
        ...parsed.data,
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
    const parsed = parseWithSchema(clientSchema.partial(), payload.data);
    if (!parsed.success) {
      return rejectWithValue(parsed.message);
    }

    try {
      await updateDoc(doc(db, "clients", payload.id), parsed.data);
      const patch: { clientName?: string; clientPhone?: string } = {};
      if (parsed.data.name) patch.clientName = parsed.data.name;
      if (parsed.data.phone) patch.clientPhone = parsed.data.phone;
      if (Object.keys(patch).length > 0) {
        await syncTicketsForClient(payload.id, patch);
      }
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
    // New reducers for filter functionality
    setFilteredClients: (
      state,
      action: { payload: { items: Client[]; filterActive: boolean } },
    ) => {
      const { items, filterActive } = action.payload;
      const filterJustActivated = filterActive && !state.filterActive;
      state.filteredItems = items;
      state.filterActive = filterActive;
      if (filterJustActivated) {
        state.currentPage = 1;
      }
    },
    clearFilteredClients: (state) => {
      state.filteredItems = [];
      state.filterActive = false;
      state.currentPage = 1;
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

// Селекторы для пагинации и фильтрации клиентов:

export const selectClients = (state: RootState) => state.clients.items;
export const selectFilteredClients = (state: RootState) =>
  state.clients.filteredItems;
export const selectClientsLoading = (state: RootState) => state.clients.loading;
export const selectClientsSaving = (state: RootState) => state.clients.saving;
export const selectClientsError = (state: RootState) => state.clients.error;

function getDisplayList<T>(items: T[], filteredItems: T[]): T[] {
  return filteredItems.length > 0 ? filteredItems : items;
}

// Пагинированный список клиентов для текущей страницы с учетом фильтрации
export const selectPaginatedClients = (state: RootState) => {
  const { items, filteredItems, currentPage, rowsPerPage } = state.clients;
  const data = getDisplayList(items, filteredItems);
  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = startIdx + rowsPerPage;
  return data.slice(startIdx, endIdx);
};
export const selectClientsTotalRows = (state: RootState) => {
  const { items, filteredItems } = state.clients;
  return getDisplayList(items, filteredItems).length;
};
export const selectClientsCurrentPage = (state: RootState) =>
  state.clients.currentPage;
export const selectClientsRowsPerPage = (state: RootState) =>
  state.clients.rowsPerPage;

// Экспортируем actions пагинации и фильтрации
export const {
  setCurrentPage,
  setRowsPerPage,
  setClients,
  setFilteredClients,
  clearFilteredClients,
} = clientsSlice.actions;

export default clientsSlice.reducer;
