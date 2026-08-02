import { type HTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/cn";

const variantStyles = {
  default: "bg-aviso-light text-aviso-dark dark:bg-aviso-dark dark:text-aviso-light",
  lime: "bg-aviso-lime text-aviso-dark",
  purple: "bg-aviso-purple text-aviso-light",
  sky: "bg-aviso-sky text-aviso-dark",
  yellow: "bg-aviso-yellow text-aviso-dark",
  coral: "bg-aviso-coral text-aviso-dark",
} as const;

export type BadgeVariant = keyof typeof variantStyles;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: ReactNode;
}

export function Badge({
  variant = "default",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full brutal-border px-3 py-1 font-heading text-xs font-bold uppercase tracking-wide",
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
