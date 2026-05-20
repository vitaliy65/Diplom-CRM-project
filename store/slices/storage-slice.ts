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

type StorageState = {
  items: SpareParts[];
  loading: boolean;
  saving: boolean;
  error: string | null;
};

const initialState: StorageState = {
  items: [],
  loading: true,
  saving: false,
  error: null,
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
    try {
      await addDoc(collection(db, "storage"), {
        ...payload,
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
    try {
      await updateDoc(doc(db, "storage", payload.id), payload.data);
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

const storageSlice = createSlice({
  name: "storage",
  initialState,
  reducers: {
    setStorage: (state, action: { payload: SpareParts[] }) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
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
      });
  },
});

// Selector to get all storage items
export const selectStorage = (state: RootState) => state.storage.items;
export const selectStorageLoading = (state: RootState) => state.storage.loading;
export const selectStorageSaving = (state: RootState) => state.storage.saving;
export const selectStorageError = (state: RootState) => state.storage.error;

// New selector: getPartByID
export const getPartByID = (
  state: RootState,
  id: string,
): SpareParts | undefined => state.storage.items.find((item) => item.id === id);

export default storageSlice.reducer;
