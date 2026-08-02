import { type HTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/cn";
import { Container } from "@/components/layout/container";

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  containerSize?: "default" | "narrow" | "wide";
  background?: "default" | "lime" | "dark" | "purple";
}

const backgroundStyles = {
  default: "",
  lime: "bg-aviso-lime text-aviso-dark",
  dark: "bg-aviso-dark text-aviso-light",
  purple: "bg-aviso-purple text-aviso-light",
} as const;

export function Section({
  containerSize = "default",
  background = "default",
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn("py-12 sm:py-16 lg:py-24", backgroundStyles[background], className)}
      {...props}
    >
      <Container size={containerSize}>{children}</Container>
    </section>
  );
}

export function SectionHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-8 sm:mb-12", className)} {...props}>
      {children}
    </div>
  );
}

export function SectionTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        "font-heading text-3xl font-bold uppercase leading-tight sm:text-4xl lg:text-5xl",
        className,
      )}
      {...props}
    >
      {children}
    </h2>
  );
}

export function SectionDescription({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "mt-4 max-w-2xl font-body text-base leading-relaxed sm:text-lg",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}
