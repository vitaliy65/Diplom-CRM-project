import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import type { RootState } from "@/store";
import type { UserProfile } from "@/lib/types";

type UsersState = {
  items: UserProfile[];
  loading: boolean;
  saving: boolean;
  error: string | null;
};

const initialState: UsersState = {
  items: [],
  loading: true,
  saving: false,
  error: null,
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

export const selectUsers = (state: RootState) => state.users.items;
export const selectUsersLoading = (state: RootState) => state.users.loading;
export const selectUsersError = (state: RootState) => state.users.error;
export const selectMasters = (state: RootState) =>
  state.users.items.filter((u) => u.role === "master");

export default usersSlice.reducer;
