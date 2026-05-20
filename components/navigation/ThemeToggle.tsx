"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);

    if (newIsDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  if (!mounted) {
    return (
      <div className="relative flex h-10 w-20 items-center rounded-full bg-secondary p-1">
        <div className="flex w-full justify-between px-2">
          <Sun className="h-4 w-4 text-muted-foreground" />
          <Moon className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative flex h-10 w-20 items-center rounded-full bg-secondary p-1 transition-colors hover:bg-secondary/80"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {/* Icons container */}
      <div className="flex w-full justify-between px-2">
        <Sun
          className={`h-4 w-4 transition-colors ${!isDark ? "text-amber-500" : "text-muted-foreground"}`}
        />
        <Moon
          className={`h-4 w-4 transition-colors ${isDark ? "text-blue-400" : "text-muted-foreground"}`}
        />
      </div>

      {/* Sliding circle indicator */}
      <div
        className={`absolute h-8 w-8 rounded-full bg-background shadow-md transition-all duration-300 ease-in-out ${
          isDark ? "left-[calc(100%-2.25rem)]" : "left-1"
        }`}
      />
    </button>
  );
}
