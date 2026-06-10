"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Wrench,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Briefcase,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  registerWithEmail,
  selectAuthError,
  selectIsAuthLoading,
} from "@/store/slices/auth-slice";
import { roleLabels, type UserRole } from "@/lib/types";

const benefits = [
  "Швидке оформлення нових заявок",
  "Зручний розподіл завдань між майстрами",
  "Повна історія обслуговування клієнтів",
  "Прозора звітність по сервісу",
];

export function RegisterScreen({
  onBackToLogin,
}: {
  onBackToLogin: () => void;
}) {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectIsAuthLoading);
  const authError = useAppSelector(selectAuthError);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("master");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (password.length < 6) {
      setLocalError("Пароль має містити щонайменше 6 символів.");
      return;
    }
    if (password !== confirmPassword) {
      setLocalError("Паролі не співпадають.");
      return;
    }

    await dispatch(registerWithEmail({ name, email, password }));
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
        className="relative z-10 w-full max-w-md glass rounded-3xl shadow-2xl overflow-hidden grid"
      >
        {/* Form panel */}
        <div className="p-8 sm:p-10 flex flex-col justify-center">
          {/* Mobile logo */}
          <div className="flex lg:hidden justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 ring-1 ring-primary/20">
              <Wrench className="h-8 w-8 text-primary" />
            </div>
          </div>

          <div className="text-center lg:text-left mb-8">
            <h1 className="text-2xl font-bold text-foreground">Реєстрація</h1>
            <p className="text-sm text-muted-foreground mt-1 text-pretty">
              Створіть обліковий запис співробітника
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm text-foreground">
                Ім&apos;я
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="name"
                  placeholder="Іван Петренко"
                  className="bg-secondary/50 border-border/50 focus:border-primary/50 h-11 pl-10"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-foreground">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  placeholder="example@service.ua"
                  className="bg-secondary/50 border-border/50 focus:border-primary/50 h-11 pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm text-foreground">
                Роль
              </Label>
              <Select
                value={role}
                onValueChange={(v) => setRole(v as UserRole)}
              >
                <SelectTrigger
                  id="role"
                  className="bg-secondary/50 border-border/50 focus:border-primary/50 h-11 w-full [&>svg]:hidden pl-10 relative"
                >
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <SelectValue placeholder="Оберіть роль" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(roleLabels) as UserRole[]).map((r) => (
                    <SelectItem key={r} value={r}>
                      {roleLabels[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    required
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

              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm text-foreground"
                >
                  Підтвердження
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-secondary/50 border-border/50 focus:border-primary/50 h-11 pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={
                      showConfirm ? "Сховати пароль" : "Показати пароль"
                    }
                  >
                    {showConfirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {(localError || authError) && (
              <p className="text-xs text-glow-red" role="alert">
                {localError || authError}
              </p>
            )}

            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 h-11 text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner className="mr-2" />
                    Створюємо акаунт...
                  </>
                ) : (
                  "Зареєструватися"
                )}
              </Button>
            </motion.div>
          </form>

          <div className="mt-6 text-center lg:text-left">
            <span className="text-sm text-muted-foreground">
              Уже є акаунт?{" "}
            </span>
            <button
              type="button"
              onClick={onBackToLogin}
              className="text-sm font-medium text-primary hover:underline transition-colors"
            >
              Увійти
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
