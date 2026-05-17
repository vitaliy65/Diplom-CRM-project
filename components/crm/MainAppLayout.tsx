"use client";
import { ReactNode, useState } from "react";
import { FloatingSidebar } from "./floating-sidebar";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  logout,
  selectAuthInitialized,
  selectCurrentUser,
} from "@/store/slices/auth-slice";
import { Spinner } from "../ui/spinner";
import { LoginScreen } from "./login-screen";
import { RegisterScreen } from "./register-screen";
import { AnimatePresence } from "framer-motion";
import { CommandPalette } from "../navigation/CommandPalette";
import { TopBar } from "../navigation/TopBar";
import { selectActiveView, setActiveView } from "@/store/slices/view-slice";

export default function MainAppLayout({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const initialized = useAppSelector(selectAuthInitialized);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [commandOpen, setCommandOpen] = useState(false);
  const activeView = useAppSelector(selectActiveView);

  if (!initialized) {
    console.log("[CRMPage] Waiting for initialization...");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    console.log("[CRMPage] No user, authMode:", authMode);
    return authMode === "login" ? (
      <LoginScreen onOpenRegister={() => setAuthMode("register")} />
    ) : (
      <RegisterScreen onBackToLogin={() => setAuthMode("login")} />
    );
  }

  return (
    <>
      <TopBar
        userName={user.name}
        userRole={user.role}
        onCommandOpen={() => setCommandOpen(true)}
      />

      <FloatingSidebar
        userRole={user.role}
        onLogout={() => dispatch(logout())}
        onChangeView={(view) => dispatch(setActiveView(view))}
        activeView={activeView}
      />

      <CommandPalette
        isOpen={commandOpen}
        onClose={() => setCommandOpen(false)}
        onChangeView={(view) => dispatch(setActiveView(view))}
      />

      <AnimatePresence>{children}</AnimatePresence>
    </>
  );
}
