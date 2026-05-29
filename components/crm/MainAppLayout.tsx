"use client";
import { ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { FloatingSidebar } from "./floating-sidebar";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  logout,
  selectAuthInitialized,
  selectCurrentUser,
} from "@/store/slices/auth-slice";
import { Spinner } from "@/components/ui/spinner";
import { LoginScreen } from "./login-screen";
import { RegisterScreen } from "./register-screen";
import { AnimatePresence } from "framer-motion";
import { CommandPalette } from "@/components/navigation/CommandPalette";
import { TopBar } from "@/components/navigation/TopBar";
import { selectActiveView, setActiveView } from "@/store/slices/view-slice";

export default function MainAppLayout({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector(selectCurrentUser);
  const initialized = useAppSelector(selectAuthInitialized);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [commandOpen, setCommandOpen] = useState(false);
  const activeView = useAppSelector(selectActiveView);

  const handleLogout = () => {
    router.push("/");
    dispatch(logout());
  };

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!user) {
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
        onLogout={handleLogout}
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
