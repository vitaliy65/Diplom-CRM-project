import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "@/lib/firebase";
import type { UserProfile } from "@/lib/types";
import type { RootState } from "@/store";

type AuthState = {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
};

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  initialized: false,
};

let authUnsubscribe: (() => void) | null = null;

async function resolveUserProfile(firebaseUser: User): Promise<UserProfile> {
  if (!db) {
    throw new Error("Firebase not configured");
  }
  const userRef = doc(db, "users", firebaseUser.uid);
  const userDoc = await getDoc(userRef);
  const fallbackName =
    firebaseUser.displayName ||
    firebaseUser.email?.split("@")[0] ||
    "Користувач";
  const data = userDoc.data();
  return {
    id: firebaseUser.uid,
    name: data?.name || fallbackName,
    email: firebaseUser.email || "",
    role: (data?.role || "master") as UserProfile["role"],
    active: data?.active ?? true,
  };
}

export const subscribeAuth = createAsyncThunk(
  "auth/subscribe",
  async (_, { dispatch }) => {
    if (!auth || !isFirebaseConfigured) {
      dispatch(authSlice.actions.setLoggedOut());
      return;
    }
    if (authUnsubscribe) {
      return;
    }
    authUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        dispatch(authSlice.actions.setLoggedOut());
        return;
      }
      const profile = await resolveUserProfile(firebaseUser);
      dispatch(authSlice.actions.setLoggedIn({ profile }));
    });
  },
);

export const loginWithEmail = createAsyncThunk(
  "auth/loginWithEmail",
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    if (!auth || !isFirebaseConfigured) {
      return rejectWithValue(
        "Firebase не налаштований. Заповніть змінні середовища.",
      );
    }
    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        payload.email,
        payload.password,
      );
      const profile = await resolveUserProfile(credential.user);
      return { profile };
    } catch (error) {
      return rejectWithValue("Не вдалося увійти. Перевірте email та пароль.");
    }
  },
);

export const registerWithEmail = createAsyncThunk(
  "auth/registerWithEmail",
  async (
    payload: {
      email: string;
      password: string;
      name: string;
      role: UserProfile["role"];
    },
    { rejectWithValue },
  ) => {
    if (!auth || !db || !isFirebaseConfigured) {
      return rejectWithValue(
        "Firebase не налаштований. Заповніть змінні середовища.",
      );
    }
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        payload.email,
        payload.password,
      );
      await updateProfile(credential.user, { displayName: payload.name });
      await setDoc(doc(db, "users", credential.user.uid), {
        name: payload.name,
        email: payload.email,
        role: payload.role,
        active: true,
        createdAt: new Date().toISOString(),
      });
      const profile = await resolveUserProfile(credential.user);
      return { profile };
    } catch {
      return rejectWithValue(
        "Не вдалося створити акаунт. Перевірте введені дані.",
      );
    }
  },
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch {
      return rejectWithValue("Не вдалося завершити сесію.");
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoggedIn: (state, action: { payload: { profile: UserProfile } }) => {
      state.user = action.payload.profile;
      state.loading = false;
      state.error = null;
      state.initialized = true;
    },
    setLoggedOut: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
      state.initialized = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginWithEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithEmail.fulfilled, (state, action) => {
        state.user = action.payload.profile;
        state.loading = false;
        state.error = null;
        state.initialized = true;
      })
      .addCase(loginWithEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Помилка авторизації.";
      })
      .addCase(registerWithEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerWithEmail.fulfilled, (state, action) => {
        state.user = action.payload.profile;
        state.loading = false;
        state.error = null;
        state.initialized = true;
      })
      .addCase(registerWithEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Помилка реєстрації.";
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.loading = false;
      });
  },
});

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectAuthInitialized = (state: RootState) =>
  state.auth.initialized;

export default authSlice.reducer;
