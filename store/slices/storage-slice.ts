import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import type { RootState } from "@/store";
import type { SpareParts, UserRole } from "@/lib/types";
import { sparePartSchema } from "@/lib/validations/schemas";
import { parseWithSchema } from "@/lib/validations/parse";

// --- Пагинация и фильтрация ---
type StorageState = {
  items: SpareParts[];
  filteredItems: SpareParts[];
  filterActive: boolean;
  loading: boolean;
  saving: boolean;
  error: string | null;
  currentPage: number;
  rowsPerPage: number;
};

const DEFAULT_ROWS_PER_PAGE = 10;

const initialState: StorageState = {
  items: [],
  filteredItems: [],
  filterActive: false,
  loading: true,
  saving: false,
  error: null,
  currentPage: 1,
  rowsPerPage: DEFAULT_ROWS_PER_PAGE,
};

let unsubscribeStorage: (() => void) | null = null;

function canManageStorage(role?: UserRole) {
  return role === "admin" || role === "manager";
}

// Реєстрація підписки на запчастини
export const subscribeStorage = createAsyncThunk(
  "storage/subscribe",
  async (_, { dispatch }) => {
    if (!db || !isFirebaseConfigured) {
      dispatch(storageSlice.actions.setStorage([]));
      return;
    }
    if (unsubscribeStorage) {
      return;
    }
    unsubscribeStorage = onSnapshot(collection(db, "storage"), (snapshot) => {
      const items: SpareParts[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<SpareParts, "id">),
      }));
      dispatch(storageSlice.actions.setStorage(items));
    });
  },
);

export const createSparePart = createAsyncThunk(
  "storage/create",
  async (payload: Omit<SpareParts, "id">, { getState, rejectWithValue }) => {
    if (!db || !isFirebaseConfigured) {
      return rejectWithValue("Firebase не налаштований.");
    }
    const role = (getState() as RootState).auth.user?.role;
    if (!canManageStorage(role)) {
      return rejectWithValue("Недостатньо прав для додавання запчастини.");
    }
    const parsed = parseWithSchema(sparePartSchema, payload);
    if (!parsed.success) {
      return rejectWithValue(parsed.message);
    }

    try {
      await addDoc(collection(db, "storage"), {
        ...parsed.data,
        createdAt: serverTimestamp(),
      });
    } catch {
      return rejectWithValue("Не вдалося створити запчастину.");
    }
  },
);

export const updateSparePart = createAsyncThunk(
  "storage/update",
  async (
    payload: { id: string; data: Partial<Omit<SpareParts, "id">> },
    { getState, rejectWithValue },
  ) => {
    if (!db || !isFirebaseConfigured) {
      return rejectWithValue("Firebase не налаштований.");
    }
    const role = (getState() as RootState).auth.user?.role;
    if (!canManageStorage(role)) {
      return rejectWithValue("Недостатньо прав для редагування запчастини.");
    }
    const parsed = parseWithSchema(sparePartSchema.partial(), payload.data);
    if (!parsed.success) {
      return rejectWithValue(parsed.message);
    }

    try {
      await updateDoc(doc(db, "storage", payload.id), parsed.data);
    } catch {
      return rejectWithValue("Не вдалося оновити запчастину.");
    }
  },
);

export const deleteSparePart = createAsyncThunk(
  "storage/delete",
  async (id: string, { getState, rejectWithValue }) => {
    if (!db || !isFirebaseConfigured) {
      return rejectWithValue("Firebase не налаштований.");
    }
    const role = (getState() as RootState).auth.user?.role;
    if (!canManageStorage(role)) {
      return rejectWithValue("Недостатньо прав для видалення запчастини.");
    }
    try {
      await deleteDoc(doc(db, "storage", id));
    } catch {
      return rejectWithValue("Не вдалося видалити запчастину.");
    }
  },
);

// New thunk: deletePart (by analogy to deleteSparePart)
export const deletePart = createAsyncThunk(
  "storage/deletePart",
  async (id: string, { getState, rejectWithValue }) => {
    if (!db || !isFirebaseConfigured) {
      return rejectWithValue("Firebase не налаштований.");
    }
    const role = (getState() as RootState).auth.user?.role;
    if (!canManageStorage(role)) {
      return rejectWithValue("Недостатньо прав для видалення запчастини.");
    }
    try {
      await deleteDoc(doc(db, "storage", id));
    } catch {
      return rejectWithValue("Не вдалося видалити запчастину.");
    }
  },
);

const storageSlice = createSlice({
  name: "storage",
  initialState,
  reducers: {
    setStorage: (state, action: { payload: SpareParts[] }) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    setStorageCurrentPage: (state, action: { payload: number }) => {
      state.currentPage = action.payload;
    },
    setStorageRowsPerPage: (state, action: { payload: number }) => {
      state.rowsPerPage = action.payload;
      state.currentPage = 1; // сброс на первую страницу при смене rowsPerPage
    },
    setFilteredStorage: (
      state,
      action: { payload: { items: SpareParts[]; filterActive: boolean } },
    ) => {
      const { items, filterActive } = action.payload;
      const filterJustActivated = filterActive && !state.filterActive;
      state.filteredItems = items;
      state.filterActive = filterActive;
      if (filterJustActivated) {
        state.currentPage = 1;
      }
    },
    clearFilteredStorage: (state) => {
      state.filteredItems = [];
      state.filterActive = false;
      state.currentPage = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createSparePart.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createSparePart.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(createSparePart.rejected, (state, action) => {
        state.saving = false;
        state.error =
          (action.payload as string) || "Помилка створення запчастини.";
      })
      .addCase(updateSparePart.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateSparePart.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(updateSparePart.rejected, (state, action) => {
        state.saving = false;
        state.error =
          (action.payload as string) || "Помилка оновлення запчастини.";
      })
      .addCase(deleteSparePart.rejected, (state, action) => {
        state.error =
          (action.payload as string) || "Помилка видалення запчастини.";
      })
      .addCase(deletePart.rejected, (state, action) => {
        state.error =
          (action.payload as string) || "Помилка видалення запчастини.";
      });
  },
});

// Селекторы для пагинации, фильтрации и получения данных
export const selectStorage = (state: RootState) => state.storage.items;
export const selectFilteredStorage = (state: RootState) =>
  state.storage.filteredItems;
export const selectStorageLoading = (state: RootState) => state.storage.loading;
export const selectStorageSaving = (state: RootState) => state.storage.saving;
export const selectStorageError = (state: RootState) => state.storage.error;

// Новый селектор для пагинированных данных с учетом фильтрации (аналог tickets-slice)
function getDisplayList<T>(items: T[], filteredItems: T[]): T[] {
  return filteredItems.length > 0 ? filteredItems : items;
}

export const selectPaginatedStorage = (state: RootState) => {
  const { items, filteredItems, currentPage, rowsPerPage } = state.storage;
  const data = getDisplayList(items, filteredItems);
  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = startIdx + rowsPerPage;
  return data.slice(startIdx, endIdx);
};

export const selectStorageTotalRows = (state: RootState) => {
  const { items, filteredItems } = state.storage;
  return getDisplayList(items, filteredItems).length;
};

export const selectStorageCurrentPage = (state: RootState) =>
  state.storage.currentPage;
export const selectStorageRowsPerPage = (state: RootState) =>
  state.storage.rowsPerPage;

// New selector: getPartByID
export const getPartByID = (
  state: RootState,
  id: string,
): SpareParts | undefined => {
  const data = getDisplayList(
    state.storage.items,
    state.storage.filteredItems,
  );
  return data.find((item) => item.id === id);
};

// Экспортируем actions для пагинации и фильтрации
export const {
  setStorageCurrentPage,
  setStorageRowsPerPage,
  setFilteredStorage,
  clearFilteredStorage,
} = storageSlice.actions;

export default storageSlice.reducer;
