"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import { Reveal, StaggerItem, StaggerReveal } from "@/components/motion/reveal";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/components/layout/section";
import { copy } from "@/lib/copy";
import { faqItems } from "@/lib/landing-data";
import { cn } from "@/lib/cn";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const reduceMotion = useReducedMotion();

  return (
    <Section id="faq">
      <Reveal>
        <SectionHeader>
          <SectionTitle>{copy.landing.faq.title}</SectionTitle>
          <SectionDescription>{copy.landing.faq.description}</SectionDescription>
        </SectionHeader>
      </Reveal>

      <StaggerReveal className="mx-auto max-w-3xl space-y-3">
        {faqItems.map((item, index) => {
          const isOpen = openIndex === index;

          return (
            <StaggerItem key={item.question}>
              <div className="rounded-sticker brutal-border bg-aviso-light brutal-shadow-sm dark:bg-aviso-dark">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span className="font-heading text-sm font-bold uppercase sm:text-base">
                    {item.question}
                  </span>
                  <motion.span
                    aria-hidden="true"
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: reduceMotion ? 0 : 0.2 }}
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full brutal-border font-heading text-lg",
                      isOpen && "bg-aviso-lime text-aviso-dark",
                    )}
                  >
                    +
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: reduceMotion ? 0 : 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t-2 border-aviso-dark/10 px-5 pb-4 pt-3 dark:border-aviso-light/10">
                        <p className="font-body text-sm leading-relaxed opacity-80 sm:text-base">
                          {item.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </StaggerItem>
          );
        })}
      </StaggerReveal>
    </Section>
  );
}
