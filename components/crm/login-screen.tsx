"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Wrench } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  loginWithEmail,
  selectAuthError,
  selectIsAuthLoading,
} from "@/store/slices/auth-slice";

export function LoginScreen({
  onOpenRegister,
}: {
  onOpenRegister: () => void;
}) {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectIsAuthLoading);
  const authError = useAppSelector(selectAuthError);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(loginWithEmail({ email, password }));
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background p-4 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-linear-to-br from-primary/10 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-linear-to-tl from-glow-purple/10 via-transparent to-transparent rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex justify-center mb-8"
          >
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-primary/30 to-primary/10 ring-1 ring-primary/20">
                <Wrench className="h-10 w-10 text-primary" />
              </div>
              <motion.div
                className="absolute -inset-1 rounded-2xl bg-primary/20 blur-xl -z-10"
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>
          </motion.div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground">FixFlo</h1>
            <p className="text-sm text-muted-foreground mt-1">
              CRM система для сервісного центру
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="text"
                placeholder="example@service.ua"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-secondary/50 border-border/50 focus:border-primary/50 h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-foreground">
                Пароль
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-secondary/50 border-border/50 focus:border-primary/50 h-11"
              />
            </div>

            {authError && <p className="text-xs text-glow-red">{authError}</p>}

            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 h-11 text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner className="mr-2" />
                    Входимо...
                  </>
                ) : (
                  "Увійти в систему"
                )}
              </Button>
            </motion.div>
          </form>

          <div className="mt-6 text-center">
            <button className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Забули пароль?
            </button>
            <div className="mt-2">
              <button
                type="button"
                onClick={onOpenRegister}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Немає акаунта? Зареєструватися
              </button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-3 rounded-xl bg-secondary/30 border border-border/30"
          >
            <p className="text-xs text-center text-muted-foreground">
              Вхід через Firebase Auth (email/password)
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
