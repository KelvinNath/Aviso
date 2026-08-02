import { type HTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/cn";

const variantStyles = {
  default: "bg-aviso-light dark:bg-aviso-dark",
  lime: "bg-aviso-lime text-aviso-dark",
  purple: "bg-aviso-purple text-aviso-light",
  sky: "bg-aviso-sky text-aviso-dark",
  yellow: "bg-aviso-yellow text-aviso-dark",
  coral: "bg-aviso-coral text-aviso-dark",
} as const;

const tiltStyles = {
  none: "",
  left: "tilt-left",
  right: "tilt-right",
} as const;

export type CardVariant = keyof typeof variantStyles;
export type CardTilt = keyof typeof tiltStyles;

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  tilt?: CardTilt;
  shadow?: "sm" | "md" | "lg" | "none";
  children: ReactNode;
}

export function Card({
  variant = "default",
  tilt = "none",
  shadow = "md",
  className,
  children,
  ...props
}: CardProps) {
  const shadowClass =
    shadow === "none"
      ? ""
      : shadow === "sm"
        ? "brutal-shadow-sm"
        : shadow === "lg"
          ? "brutal-shadow-lg"
          : "brutal-shadow";

  return (
    <div
      className={cn(
        "rounded-sticker brutal-border p-6",
        variantStyles[variant],
        tiltStyles[tilt],
        shadowClass,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("font-heading text-xl font-bold uppercase", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("mt-2 font-body text-sm leading-relaxed", className)} {...props}>
      {children}
    </p>
  );
}
