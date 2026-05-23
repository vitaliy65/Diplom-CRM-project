import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import type { RootState } from "@/store";
import type { UserProfile } from "@/lib/types";

// ---
// Добавляем систему страничек как в tickets-slice.ts

type UsersState = {
  items: UserProfile[];
  loading: boolean;
  saving: boolean;
  error: string | null;

  // странички (pagination)
  currentPage: number;
  rowsPerPage: number;
};

const DEFAULT_ROWS_PER_PAGE = 10;

const initialState: UsersState = {
  items: [],
  loading: true,
  saving: false,
  error: null,
  currentPage: 1,
  rowsPerPage: DEFAULT_ROWS_PER_PAGE,
};

let unsubscribeUsers: (() => void) | null = null;

export const subscribeUsers = createAsyncThunk(
  "users/subscribe",
  async (_, { dispatch }) => {
    if (!db || !isFirebaseConfigured) {
      dispatch(usersSlice.actions.setUsers([]));
      return;
    }
    if (unsubscribeUsers) {
      return;
    }
    unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const items: UserProfile[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<UserProfile, "id">),
      }));
      dispatch(usersSlice.actions.setUsers(items));
    });
  },
);

export const updateUser = createAsyncThunk(
  "users/update",
  async (
    payload: { id: string; data: Partial<Omit<UserProfile, "id">> },
    { getState, rejectWithValue },
  ) => {
    if (!db || !isFirebaseConfigured) {
      return rejectWithValue("Firebase не налаштований.");
    }
    const role = (getState() as RootState).auth.user?.role;
    if (role !== "admin") {
      return rejectWithValue("Лише адміністратор може змінювати користувачів.");
    }
    try {
      await updateDoc(doc(db, "users", payload.id), payload.data);
    } catch {
      return rejectWithValue("Не вдалося оновити користувача.");
    }
  },
);

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setUsers: (state, action: { payload: UserProfile[] }) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    setCurrentPage: (state, action: { payload: number }) => {
      state.currentPage = action.payload;
    },
    setRowsPerPage: (state, action: { payload: number }) => {
      state.rowsPerPage = action.payload;
      state.currentPage = 1; // сброс на первую страницу при смене rowsPerPage
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateUser.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.saving = false;
        state.error =
          (action.payload as string) || "Помилка оновлення користувача.";
      });
  },
});

// ---
// Селекторы для пагинации пользователей

export const selectUsers = (state: RootState) => state.users.items;
export const selectUsersLoading = (state: RootState) => state.users.loading;
export const selectUsersSaving = (state: RootState) => state.users.saving;
export const selectUsersError = (state: RootState) => state.users.error;

// Новый селектор для пользователей на текущей странице
export const selectPaginatedUsers = (state: RootState) => {
  const { items, currentPage, rowsPerPage } = state.users;
  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = startIdx + rowsPerPage;
  return items.slice(startIdx, endIdx);
};
export const selectUsersTotalRows = (state: RootState) =>
  state.users.items.length;
export const selectUsersCurrentPage = (state: RootState) =>
  state.users.currentPage;
export const selectUsersRowsPerPage = (state: RootState) =>
  state.users.rowsPerPage;

// Быстрый фильтр для мастеров (на ВСЕХ стр.), отдельно для пагинации не нужен
export const selectMasters = (state: RootState) =>
  state.users.items.filter((u) => u.role === "master");

// Экспортируем actions для управления пагинацией
export const { setCurrentPage, setRowsPerPage } = usersSlice.actions;

export default usersSlice.reducer;
