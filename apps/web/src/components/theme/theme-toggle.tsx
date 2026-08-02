"use client";

import { useTheme } from "@/components/theme/theme-provider";
import { cn } from "@/lib/cn";

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme, mounted } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-chunky brutal-border bg-aviso-light text-lg transition-colors hover:bg-aviso-lime/40 dark:bg-aviso-dark",
        className,
      )}
    >
      {mounted ? (theme === "dark" ? "☀️" : "🌙") : "◐"}
    </button>
  );
}
