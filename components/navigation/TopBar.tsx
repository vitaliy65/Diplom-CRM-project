"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Command, Search, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface TopBarProps {
  userName: string;
  userRole: string;
  onCommandOpen: () => void;
}

export function TopBar({ userName, userRole, onCommandOpen }: TopBarProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onCommandOpen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCommandOpen]);

  const roleLabels: Record<string, string> = {
    admin: "Адміністратор",
    manager: "Менеджер",
    master: "Майстер",
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed left-0 right-0 top-0 z-40 px-4 py-3 md:py-4 bg-glass/50 border-b border-border backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <motion.div
          className="flex items-center gap-2 md:gap-3"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-xl bg-white">
            <Image
              src={"/logo/logo-big-no-text.png"}
              width={512}
              height={512}
              alt="logo"
              className="h-8 w-8 text-primary"
            />
          </div>
          <div>
            <h1 className="text-base md:text-lg font-semibold text-foreground">
              FixFlo
            </h1>
            <p className="hidden sm:block text-xs text-muted-foreground">
              CRM Система
            </p>
          </div>
        </motion.div>

        <motion.button
          onClick={onCommandOpen}
          className="glass hidden sm:flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-muted-foreground hover:border-primary/30 hover:text-foreground"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Search className="h-4 w-4" />
          <span>Пошук...</span>
          <kbd className="ml-2 flex items-center gap-0.5 rounded-lg bg-secondary/50 px-2 py-0.5 text-xs">
            <Command className="h-3 w-3" />K
          </kbd>
        </motion.button>

        <motion.div
          className="flex items-center gap-2 md:gap-3"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <button
            onClick={onCommandOpen}
            className="sm:hidden flex h-9 w-9 items-center justify-center rounded-xl glass"
          >
            <Search className="h-4 w-4 text-muted-foreground" />
          </button>
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-foreground">{userName}</p>
            <p className="text-xs text-muted-foreground">
              {roleLabels[userRole]}
            </p>
          </div>
          <div className="relative">
            <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-linear-to-br from-primary/30 to-primary/10 text-xs md:text-sm font-semibold text-primary ring-2 ring-primary/20">
              {userName.charAt(0)}
            </div>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-glow-green dot-glow-green ring-2 ring-background" />
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
}
