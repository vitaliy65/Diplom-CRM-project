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
import type { Service, UserRole } from "@/lib/types";

type ServicesState = {
  items: Service[];
  loading: boolean;
  saving: boolean;
  error: string | null;
};

const initialState: ServicesState = {
  items: [],
  loading: true,
  saving: false,
  error: null,
};

let unsubscribeServices: (() => void) | null = null;

function canManageServices(role?: UserRole) {
  return role === "admin" || role === "manager";
}

export const subscribeServices = createAsyncThunk(
  "services/subscribe",
  async (_, { dispatch }) => {
    if (!db || !isFirebaseConfigured) {
      dispatch(servicesSlice.actions.setServices([]));
      return;
    }
    if (unsubscribeServices) {
      return;
    }
    unsubscribeServices = onSnapshot(collection(db, "services"), (snapshot) => {
      const items: Service[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Service, "id">),
      }));
      dispatch(servicesSlice.actions.setServices(items));
    });
  },
);

export const createService = createAsyncThunk(
  "services/create",
  async (payload: Omit<Service, "id">, { getState, rejectWithValue }) => {
    if (!db || !isFirebaseConfigured) {
      return rejectWithValue("Firebase не налаштований.");
    }
    const role = (getState() as RootState).auth.user?.role;
    if (!canManageServices(role)) {
      return rejectWithValue("Недостатньо прав для створення послуги.");
    }
    try {
      await addDoc(collection(db, "services"), {
        ...payload,
        createdAt: serverTimestamp(),
      });
    } catch {
      return rejectWithValue("Не вдалося створити послугу.");
    }
  },
);

export const updateService = createAsyncThunk(
  "services/update",
  async (
    payload: { id: string; data: Partial<Omit<Service, "id">> },
    { getState, rejectWithValue },
  ) => {
    if (!db || !isFirebaseConfigured) {
      return rejectWithValue("Firebase не налаштований.");
    }
    const role = (getState() as RootState).auth.user?.role;
    if (!canManageServices(role)) {
      return rejectWithValue("Недостатньо прав для редагування послуги.");
    }
    console.log(payload.data);
    try {
      await updateDoc(doc(db, "services", payload.id), payload.data);
    } catch {
      return rejectWithValue("Не вдалося оновити послугу.");
    }
  },
);

export const deleteService = createAsyncThunk(
  "services/delete",
  async (id: string, { getState, rejectWithValue }) => {
    if (!db || !isFirebaseConfigured) {
      return rejectWithValue("Firebase не налаштований.");
    }
    const role = (getState() as RootState).auth.user?.role;
    if (!canManageServices(role)) {
      return rejectWithValue("Недостатньо прав для видалення послуги.");
    }
    try {
      await deleteDoc(doc(db, "services", id));
    } catch {
      return rejectWithValue("Не вдалося видалити послугу.");
    }
  },
);

const servicesSlice = createSlice({
  name: "services",
  initialState,
  reducers: {
    setServices: (state, action: { payload: Service[] }) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createService.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createService.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(createService.rejected, (state, action) => {
        state.saving = false;
        state.error =
          (action.payload as string) || "Помилка створення послуги.";
      })
      .addCase(updateService.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateService.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(updateService.rejected, (state, action) => {
        state.saving = false;
        state.error =
          (action.payload as string) || "Помилка оновлення послуги.";
      })
      .addCase(deleteService.rejected, (state, action) => {
        state.error =
          (action.payload as string) || "Помилка видалення послуги.";
      });
  },
});

export const selectServices = (state: RootState) => state.services.items;
export const selectServicesLoading = (state: RootState) =>
  state.services.loading;
export const selectServicesSaving = (state: RootState) => state.services.saving;
export const selectServicesError = (state: RootState) => state.services.error;

export default servicesSlice.reducer;
