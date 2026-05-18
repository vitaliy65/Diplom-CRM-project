import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  updatePassword,
  updateEmail,
  fetchSignInMethodsForEmail,
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
    } catch (error: any) {
      // Handle common Firebase errors for login
      let message = "Не вдалося увійти. Перевірте email та пароль.";
      if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        message = "Неправильний email або пароль.";
      } else if (error.code === "auth/too-many-requests") {
        message = "Забагато невдалих спроб входу. Спробуйте пізніше.";
      }
      return rejectWithValue(message);
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
      // Проверяем, существует ли email в базе Firebase Auth
      const methods = await fetchSignInMethodsForEmail(auth, payload.email);
      if (methods && methods.length > 0) {
        return rejectWithValue("Користувач з таким email вже існує.");
      }

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
    } catch (error: any) {
      let message = "Не вдалося створити акаунт. Перевірте введені дані.";
      // Детализация некоторых ошибок из Firebase
      if (error.code === "auth/invalid-email") {
        message = "Невірний формат email.";
      } else if (error.code === "auth/email-already-in-use") {
        message = "Користувач з таким email вже існує.";
      } else if (error.code === "auth/weak-password") {
        message = "Пароль занадто простий.";
      }
      return rejectWithValue(message);
    }
  },
);

// Thunk для смены пароля текущим пользователем с более подробной обработкой ошибок
export const changeOwnPassword = createAsyncThunk(
  "auth/changeOwnPassword",
  async (payload: { newPassword: string }, { rejectWithValue }) => {
    if (!auth || !auth.currentUser) {
      return rejectWithValue("Ви не авторизовані.");
    }
    try {
      await updatePassword(auth.currentUser, payload.newPassword);
      return { success: true };
    } catch (error: any) {
      let message = "Не вдалося змінити пароль.";
      // Подробности ошибки Firebase
      if (error.code === "auth/weak-password") {
        message = "Пароль занадто простий.";
      } else if (error.code === "auth/requires-recent-login") {
        message = "Для зміни пароля потрібно повторно увійти в акаунт.";
      }
      return rejectWithValue(message);
    }
  },
);

// Thunk для смены email текущим пользователем с проверками и подробным выводом ошибок
export const changeOwnEmail = createAsyncThunk(
  "auth/changeOwnEmail",
  async (payload: { newEmail: string }, { rejectWithValue }) => {
    if (!auth || !auth.currentUser) {
      return rejectWithValue("Ви не авторизовані.");
    }
    try {
      // Проверяем, совпадает ли новый email с текущим
      if (payload.newEmail === auth.currentUser.email) {
        return rejectWithValue("Новий email співпадає з поточним.");
      }

      // Firebase требование: email должен быть верифицирован перед сменой (реальных препятствий нет, но такие ошибки бывают)
      // Проверяем, существует ли такой email уже в системе Firebase Auth
      let methods = [];
      try {
        methods = await fetchSignInMethodsForEmail(auth, payload.newEmail);
      } catch (e: any) {
        if (e.code === "auth/invalid-email") {
          return rejectWithValue("Невірний формат email.");
        }
        // Возможные ограничения квоты или проблемы соединения (раскроем их)
        return rejectWithValue(
          "Помилка при перевірці email: " +
            (e.message || e.code || JSON.stringify(e)),
        );
      }
      if (methods && methods.length > 0) {
        return rejectWithValue("Користувач з таким email вже існує.");
      }

      try {
        await updateEmail(auth.currentUser, payload.newEmail);

        // Обновляем email также и в базе Firestore
        if (db && auth.currentUser.uid) {
          const userDocRef = doc(db, "users", auth.currentUser.uid);
          await setDoc(
            userDocRef,
            { email: payload.newEmail },
            { merge: true },
          );
        }
        return { email: payload.newEmail };
      } catch (firebaseError: any) {
        let message = "Не вдалося змінити email.";
        let debugInfo = "";

        // Подробный разбор известных ошибок
        if (firebaseError.code === "auth/invalid-email") {
          message = "Невірний формат email.";
        } else if (firebaseError.code === "auth/email-already-in-use") {
          message = "Користувач з таким email вже існує.";
        } else if (firebaseError.code === "auth/requires-recent-login") {
          message = "Для зміни email потрібно повторно увійти в акаунт.";
        } else if (firebaseError.code === "auth/user-mismatch") {
          message =
            "Має бути підтвердження email через листа. Спробуйте перевірити пошту.";
        } else {
          // для любой другой ошибки выводим code и message (это часто проясняет причину)
          debugInfo =
            "\n[Firebase error]: " +
            (firebaseError.code || "") +
            " " +
            (firebaseError.message || "");
        }

        return rejectWithValue(message + debugInfo);
      }
    } catch (error: any) {
      // Здесь ошибка вне updateEmail или fetchSignInMethodsForEmail: максимально раскрываем details
      return rejectWithValue(
        "Не вдалося змінити email. Деталі: " +
          (error.message || error.code || JSON.stringify(error)),
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
      .addCase(changeOwnPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changeOwnPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        // Пароль изменён, ничего обновлять в профиле не нужно
      })
      .addCase(changeOwnPassword.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Не вдалося змінити пароль.";
      })
      .addCase(changeOwnEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changeOwnEmail.fulfilled, (state, action) => {
        if (state.user && action.payload && "email" in action.payload) {
          state.user.email = action.payload.email;
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(changeOwnEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Не вдалося змінити email.";
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
