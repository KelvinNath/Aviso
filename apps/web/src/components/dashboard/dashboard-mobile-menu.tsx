"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { DashboardNavLinks } from "@/components/dashboard/dashboard-nav";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { cn } from "@/lib/cn";

type DashboardMobileMenuProps = {
  open: boolean;
  onClose: () => void;
  hasSubscriptions: boolean;
  displayName: string | null;
  email: string;
  avatarUrl: string | null;
};

export function DashboardMobileMenu({
  open,
  onClose,
  hasSubscriptions,
  displayName,
  email,
  avatarUrl,
}: DashboardMobileMenuProps) {
  const [mounted, setMounted] = useState(false);
  const reduceMotion = useReducedMotion();
  const label = displayName ?? email;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!mounted) {
    return null;
  }

  const slideTransition = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, damping: 32, stiffness: 320 };

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-50 bg-aviso-dark/60 lg:hidden"
            initial={{ opacity: reduceMotion ? 1 : 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: reduceMotion ? 1 : 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            onClick={onClose}
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Dashboard menu"
            className={cn(
              "fixed inset-y-0 right-0 z-50 flex w-[min(100%,20rem)] flex-col border-l-2 border-aviso-dark bg-aviso-light brutal-shadow-lg dark:border-aviso-light dark:bg-aviso-dark lg:hidden",
            )}
            initial={{ x: reduceMotion ? 0 : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: reduceMotion ? 0 : "100%" }}
            transition={slideTransition}
          >
            <div className="flex items-center justify-between border-b-2 border-aviso-dark px-4 py-4 dark:border-aviso-light">
              <p className="font-heading text-sm font-bold uppercase tracking-wide text-aviso-dark dark:text-aviso-light">
                Menu
              </p>
              <button
                type="button"
                onClick={onClose}
                className="rounded-chunky brutal-border px-3 py-1 font-heading text-sm font-bold uppercase text-aviso-dark hover:bg-aviso-coral/30 dark:text-aviso-light"
                aria-label="Close menu"
              >
                ×
              </button>
            </div>

            <div className="flex items-center gap-3 border-b-2 border-aviso-dark px-4 py-4 dark:border-aviso-light">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-10 w-10 shrink-0 rounded-full brutal-border object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-aviso-lime brutal-border font-heading text-sm font-bold text-aviso-dark">
                  {label.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate font-body text-sm font-medium text-aviso-dark dark:text-aviso-light">
                  {label}
                </p>
                <p className="truncate font-body text-xs text-aviso-dark/60 dark:text-aviso-light/60">
                  {email}
                </p>
              </div>
            </div>

            <nav aria-label="Dashboard" className="flex-1 overflow-y-auto px-4 py-4">
              <DashboardNavLinks
                hasSubscriptions={hasSubscriptions}
                onNavigate={onClose}
                linkClassName="w-full text-left"
              />
            </nav>

            <div className="flex items-center justify-between gap-3 border-t-2 border-aviso-dark px-4 py-4 dark:border-aviso-light">
              <ThemeToggle />
              <SignOutButton />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}

type DashboardMenuButtonProps = {
  open: boolean;
  onClick: () => void;
};

export function DashboardMenuButton({ open, onClick }: DashboardMenuButtonProps) {
  return (
    <button
      type="button"
      className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-chunky brutal-border lg:hidden"
      aria-expanded={open}
      aria-label={open ? "Close menu" : "Open menu"}
      onClick={onClick}
    >
      <span
        className={cn(
          "block h-0.5 w-5 bg-aviso-dark transition-transform dark:bg-aviso-light",
          open && "translate-y-2 rotate-45",
        )}
      />
      <span
        className={cn(
          "block h-0.5 w-5 bg-aviso-dark transition-opacity dark:bg-aviso-light",
          open && "opacity-0",
        )}
      />
      <span
        className={cn(
          "block h-0.5 w-5 bg-aviso-dark transition-transform dark:bg-aviso-light",
          open && "-translate-y-2 -rotate-45",
        )}
      />
    </button>
  );
}
