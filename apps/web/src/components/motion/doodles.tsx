"use client";

import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/cn";

type ScribbleUnderlineProps = {
  className?: string;
  color?: "lime" | "yellow" | "coral";
};

export function ScribbleUnderline({
  className,
  color = "lime",
}: ScribbleUnderlineProps) {
  const reduceMotion = useReducedMotion();

  const strokeColor =
    color === "lime"
      ? "var(--aviso-lime)"
      : color === "yellow"
        ? "var(--aviso-yellow)"
        : "var(--aviso-coral)";

  return (
    <svg
      viewBox="0 0 200 12"
      fill="none"
      aria-hidden="true"
      className={cn("h-3 w-full max-w-xs", className)}
    >
      <motion.path
        d="M2 8 C 30 2, 60 12, 90 6 S 150 4, 198 8"
        stroke={strokeColor}
        strokeWidth="4"
        strokeLinecap="round"
        initial={reduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </svg>
  );
}

export function StarBurst({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      className={cn("h-10 w-10", className)}
    >
      <path
        d="M24 2 L28 18 L44 18 L31 28 L36 44 L24 34 L12 44 L17 28 L4 18 L20 18 Z"
        fill="var(--aviso-yellow)"
        stroke="var(--border-color)"
        strokeWidth="2"
      />
    </svg>
  );
}

export function BellDoodle({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={cn("h-8 w-8", className)}
    >
      <path
        d="M8 24 H24 V12 C24 7.6 20.4 4 16 4 C11.6 4 8 7.6 8 12 V24 Z"
        fill="var(--aviso-coral)"
        stroke="var(--border-color)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M13 24 C13 26.2 14.8 28 17 28 H15 C17.2 28 19 26.2 19 24"
        stroke="var(--border-color)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function TelegramDoodle({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={cn("h-8 w-8", className)}
    >
      <circle
        cx="16"
        cy="16"
        r="13"
        fill="var(--aviso-sky)"
        stroke="var(--border-color)"
        strokeWidth="2"
      />
      <path
        d="M9 16 L22 10 L19 22 L15 17 L11 19 Z"
        fill="var(--aviso-light)"
        stroke="var(--border-color)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
