"use client";

import { motion, useReducedMotion } from "framer-motion";
import { type ReactNode } from "react";

import { cn } from "@/lib/cn";

type HoverLiftProps = {
  children: ReactNode;
  className?: string;
};

export function HoverLift({ children, className }: HoverLiftProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={reduceMotion ? undefined : { y: -6, rotate: -1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
