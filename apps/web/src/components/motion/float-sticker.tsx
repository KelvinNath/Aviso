"use client";

import { motion, useReducedMotion } from "framer-motion";
import { type ReactNode } from "react";

import { floatAnimation } from "@/lib/motion";
import { cn } from "@/lib/cn";

type FloatStickerProps = {
  children: ReactNode;
  className?: string;
  duration?: number;
};

export function FloatSticker({
  children,
  className,
  duration = 5,
}: FloatStickerProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      animate={floatAnimation}
      transition={{ ...floatAnimation.transition, duration }}
      className={cn("pointer-events-none", className)}
    >
      {children}
    </motion.div>
  );
}

type WiggleProps = {
  children: ReactNode;
  className?: string;
  onHover?: boolean;
};

export function Wiggle({ children, className, onHover = true }: WiggleProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <span className={className}>{children}</span>;
  }

  return (
    <motion.span
      className={className}
      whileHover={onHover ? { rotate: [0, -10, 10, -6, 0] } : undefined}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.span>
  );
}
