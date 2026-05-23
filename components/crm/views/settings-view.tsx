"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, User, Mail, Key } from "lucide-react";
import { itemVariants } from "@/components/crm/views/dashboard-view";
import { useSettingsForm } from "@/hooks/use-settings";
import { containerVariants } from "@/static/Animations";

export default function SettingsView() {
  const {
    name,
    setName,
    email,
    // setEmail, убрали setEmail, нельзя редактировать
    password,
    setPassword,
    passwordRepeat,
    setPasswordRepeat,
    saving,
    currentUser,
    handleSave,
  } = useSettingsForm();

  return (
    <motion.div
      className="general-view-settings"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="view-container">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <User className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">
              Налаштування акаунту
            </h1>
          </div>
          <p className="text-muted-foreground">
            Керування особистою інформацією, email та паролем
          </p>
        </motion.div>

        {/* Settings Form */}
        <motion.form
          variants={itemVariants}
          className="bento-card p-6 space-y-6"
          onSubmit={handleSave}
        >
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-muted-foreground mb-1"
              >
                Імʼя та прізвище
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  className="pl-9 bg-background/50 border-border/50"
                  placeholder="Ваше імʼя"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  disabled={!currentUser}
                />
              </div>
            </div>

            {/* Email (Только для чтения, без возможности редактирования) */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-muted-foreground mb-1"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  className="pl-9 bg-background/50 border-border/50"
                  type="email"
                  placeholder="Ваш email"
                  value={email}
                  readOnly
                  disabled
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-muted-foreground mb-1"
              >
                Новий пароль
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  className="pl-9 bg-background/50 border-border/50"
                  type="password"
                  placeholder="Новий пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  disabled={!currentUser}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="password-repeat"
                className="block text-sm font-medium text-muted-foreground mb-1"
              >
                Повторіть новий пароль
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password-repeat"
                  className="pl-9 bg-background/50 border-border/50"
                  type="password"
                  placeholder="Повторіть новий пароль"
                  value={passwordRepeat}
                  onChange={(e) => setPasswordRepeat(e.target.value)}
                  autoComplete="new-password"
                  disabled={!currentUser}
                />
              </div>
            </div>
          </div>
          <Button
            type="submit"
            className="bg-primary hover:bg-primary/90 gap-2 w-full"
            disabled={saving || !currentUser}
          >
            <Save className="h-4 w-4" />
            {saving ? "Збереження..." : "Зберегти зміни"}
          </Button>
        </motion.form>
      </div>
    </motion.div>
  );
}
