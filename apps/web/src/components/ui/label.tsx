import { type LabelHTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
}

export function Label({ className, children, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        "block font-heading text-sm font-bold uppercase tracking-wide text-aviso-dark dark:text-aviso-light",
        className,
      )}
      {...props}
    >
      {children}
    </label>
  );
}
