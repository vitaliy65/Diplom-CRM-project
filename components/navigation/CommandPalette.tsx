"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { menuItems } from "@/static/MenuItems";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onChangeView: (view: string) => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onChangeView,
}: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const filteredCommands = menuItems.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 bg-background/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed left-4 right-4 top-[20%] z-101 sm:left-1/2 sm:right-auto sm:w-full sm:max-w-lg sm:-translate-x-1/2"
          >
            <div className="glass rounded-2xl overflow-hidden shadow-2xl">
              <div className="flex items-center gap-3 border-b border-border/50 px-4 py-3">
                <Search className="h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Введіть команду або пошук..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  autoFocus
                />
                <kbd className="hidden sm:flex items-center gap-1 rounded-lg bg-secondary/50 px-2 py-1 text-xs text-muted-foreground">
                  ESC
                </kbd>
              </div>
              <div className="max-h-80 overflow-y-auto p-2">
                {filteredCommands.map((item) => {
                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => {
                        onChangeView(item.id);
                        onClose();
                        router.push(item.url);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-secondary/50"
                      whileHover={{ x: 4 }}
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span>{item.label}</span>
                      <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
