"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { registerWithEmail, selectAuthError, selectIsAuthLoading } from "@/store/slices/auth-slice"
import type { UserRole } from "@/lib/types"

export function RegisterScreen({ onBackToLogin }: { onBackToLogin: () => void }) {
  const dispatch = useAppDispatch()
  const isLoading = useAppSelector(selectIsAuthLoading)
  const authError = useAppSelector(selectAuthError)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState<UserRole>("master")
  const [localError, setLocalError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    if (password.length < 6) {
      setLocalError("Пароль має містити щонайменше 6 символів.")
      return
    }
    if (password !== confirmPassword) {
      setLocalError("Паролі не співпадають.")
      return
    }

    await dispatch(registerWithEmail({ name, email, password, role }))
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background p-4 overflow-hidden">
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
          <div className="flex justify-center mb-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-primary/30 to-primary/10 ring-1 ring-primary/20">
              <Wrench className="h-10 w-10 text-primary" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground">Реєстрація</h1>
            <p className="text-sm text-muted-foreground mt-1">Створіть обліковий запис співробітника</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Ім&apos;я</Label>
              <Input id="name" className="bg-secondary/50 border-border/50 focus:border-primary/50 h-11" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" className="bg-secondary/50 border-border/50 focus:border-primary/50 h-11" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Роль</Label>
              <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                <SelectTrigger className="bg-secondary/50 border-border/50 focus:border-primary/50 h-11">
                  <SelectValue placeholder="Оберіть роль" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Адміністратор</SelectItem>
                  <SelectItem value="manager">Менеджер</SelectItem>
                  <SelectItem value="master">Майстер</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-secondary/50 border-border/50 focus:border-primary/50 h-11"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Підтвердження пароля</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-secondary/50 border-border/50 focus:border-primary/50 h-11"
                required
              />
            </div>

            {(localError || authError) && <p className="text-xs text-glow-red">{localError || authError}</p>}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner className="mr-2" />
                  Створюємо акаунт...
                </>
              ) : (
                "Зареєструватися"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={onBackToLogin}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Уже є акаунт? Увійти
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
