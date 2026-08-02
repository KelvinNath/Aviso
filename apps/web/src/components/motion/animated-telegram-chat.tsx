"use client";

import { motion, useReducedMotion } from "framer-motion";

import { telegramMessages } from "@/lib/landing-data";
import { slideInRight } from "@/lib/motion";
import { cn } from "@/lib/cn";

export function AnimatedTelegramChat() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="mx-auto w-full max-w-sm">
      <motion.div
        initial={reduceMotion ? "visible" : "hidden"}
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
        }}
        className="rounded-sticker brutal-border bg-[#17212b] brutal-shadow-lg"
      >
        <div className="flex items-center gap-3 border-b-2 border-aviso-dark/30 px-4 py-3">
          <motion.div
            variants={slideInRight}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-aviso-lime font-heading text-sm font-bold text-aviso-dark"
          >
            A
          </motion.div>
          <div>
            <p className="font-body text-sm font-semibold text-aviso-light">
              Aviso Bot
            </p>
            <p className="font-body text-xs text-aviso-light/50">online</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 p-4">
          {telegramMessages.map((msg, i) => (
            <motion.div
              key={i}
              variants={slideInRight}
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2.5 font-body text-sm leading-relaxed",
                msg.type === "bot"
                  ? "self-start rounded-bl-sm bg-[#242f3d] text-aviso-light"
                  : "self-end rounded-br-sm bg-aviso-purple text-aviso-light",
              )}
            >
              {msg.text}
            </motion.div>
          ))}
        </div>

        <div className="border-t-2 border-aviso-dark/30 px-4 py-3">
          <div className="rounded-full bg-[#242f3d] px-4 py-2 font-body text-xs text-aviso-light/40">
            Message...
          </div>
        </div>
      </motion.div>
    </div>
  );
}
