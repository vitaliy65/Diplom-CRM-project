"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  Wrench,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Clock,
  BarChart3,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  loginWithEmail,
  selectAuthError,
  selectIsAuthLoading,
} from "@/store/slices/auth-slice";

const features = [
  {
    icon: Clock,
    title: "Облік заявок у реальному часі",
    description: "Відстежуйте статуси ремонту від прийому до видачі.",
  },
  {
    icon: BarChart3,
    title: "Аналітика та звіти",
    description: "Контролюйте навантаження майстрів і прибуток сервісу.",
  },
  {
    icon: ShieldCheck,
    title: "Безпечний доступ",
    description: "Розмежування прав для адміністраторів і майстрів.",
  },
];

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
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(loginWithEmail({ email, password }));
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background p-4 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/4 w-[60rem] h-[60rem] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/4 w-[60rem] h-[60rem] bg-glow-purple/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-5xl"
      >
        <div className="glass rounded-3xl shadow-2xl overflow-hidden grid lg:grid-cols-2">
          {/* Branding panel */}
          <div className="relative hidden lg:flex flex-col justify-between p-10 bg-primary/5 border-r border-border">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/20">
                  <Wrench className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground leading-none">
                    FixFlo
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    CRM для сервісного центру
                  </p>
                </div>
              </div>

              <h3 className="mt-10 text-2xl font-bold text-foreground text-balance leading-snug">
                Керуйте сервісом ефективно й без хаосу
              </h3>
              <p className="mt-2 text-sm text-muted-foreground text-pretty">
                Усі заявки, клієнти та майстри в одному місці.
              </p>
            </div>

            <ul className="mt-10 space-y-5">
              {features.map((feature) => (
                <li key={feature.title} className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/15">
                    <feature.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {feature.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 text-pretty">
                      {feature.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Form panel */}
          <div className="p-8 sm:p-10 flex flex-col justify-center">
            {/* Mobile logo */}
            <div className="flex lg:hidden justify-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 ring-1 ring-primary/20">
                <Wrench className="h-8 w-8 text-primary" />
              </div>
            </div>

            <div className="text-center lg:text-left mb-8">
              <h1 className="text-2xl font-bold text-foreground">
                Вхід у систему
              </h1>
              <p className="text-sm text-muted-foreground mt-1 text-pretty">
                Введіть свої дані, щоб продовжити роботу
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-foreground">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="email"
                    type="text"
                    placeholder="example@service.ua"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-secondary/50 border-border/50 focus:border-primary/50 h-11 pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-foreground">
                  Пароль
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-secondary/50 border-border/50 focus:border-primary/50 h-11 pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={
                      showPassword ? "Сховати пароль" : "Показати пароль"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {authError && (
                <p className="text-xs text-glow-red" role="alert">
                  {authError}
                </p>
              )}

              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
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

            <div className="mt-6 text-center lg:text-left">
              <span className="text-sm text-muted-foreground">
                Немає акаунта?{" "}
              </span>
              <button
                type="button"
                onClick={onOpenRegister}
                className="text-sm font-medium text-primary hover:underline transition-colors"
              >
                Зареєструватися
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
