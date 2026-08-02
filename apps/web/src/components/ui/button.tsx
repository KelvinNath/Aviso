"use client";

import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
} from "framer-motion";
import { type ReactNode } from "react";

import { cn } from "@/lib/cn";

const variantStyles = {
  primary:
    "bg-aviso-lime text-aviso-dark hover:bg-aviso-yellow brutal-shadow",
  secondary:
    "bg-aviso-light text-aviso-dark brutal-shadow dark:bg-aviso-dark dark:text-aviso-light",
  dark: "bg-aviso-dark text-aviso-light brutal-shadow",
  coral: "bg-aviso-coral text-aviso-dark brutal-shadow",
  purple: "bg-aviso-purple text-aviso-light brutal-shadow",
  ghost:
    "bg-transparent text-aviso-dark brutal-border hover:bg-aviso-light dark:text-aviso-light",
} as const;

const sizeStyles = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
} as const;

export type ButtonVariant = keyof typeof variantStyles;
export type ButtonSize = keyof typeof sizeStyles;

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  arrow?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  arrow = false,
  className,
  children,
  ...props
}: ButtonProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      whileHover={reduceMotion ? undefined : { scale: 1.04, y: -2 }}
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-chunky brutal-border font-heading font-bold uppercase tracking-wide",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {children}
      {arrow && (
        <motion.span
          aria-hidden="true"
          className="inline-block"
          whileHover={reduceMotion ? undefined : { x: 4 }}
        >
          →
        </motion.span>
      )}
    </motion.button>
  );
}

export interface ButtonLinkProps {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  arrow?: boolean;
  className?: string;
  target?: string;
  rel?: string;
  children: ReactNode;
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  arrow = false,
  className,
  target,
  rel,
  children,
}: ButtonLinkProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.a
      href={href}
      target={target}
      rel={rel}
      whileHover={reduceMotion ? undefined : { scale: 1.04, y: -2 }}
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-chunky brutal-border font-heading font-bold uppercase tracking-wide",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    >
      {children}
      {arrow && (
        <motion.span
          aria-hidden="true"
          className="inline-block"
          whileHover={reduceMotion ? undefined : { x: 4 }}
        >
          →
        </motion.span>
      )}
    </motion.a>
  );
}
