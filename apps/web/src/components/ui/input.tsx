import { type InputHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full rounded-chunky brutal-border bg-aviso-light px-4 py-3 font-body text-base text-aviso-dark placeholder:text-aviso-dark/50 brutal-shadow-sm outline-none transition-shadow focus:brutal-shadow dark:bg-aviso-dark dark:text-aviso-light dark:placeholder:text-aviso-light/50",
        className,
      )}
      {...props}
    />
  );
}
