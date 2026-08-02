"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

import { FloatSticker, Wiggle } from "@/components/motion/float-sticker";
import {
  BellDoodle,
  ScribbleUnderline,
  StarBurst,
  TelegramDoodle,
} from "@/components/motion/doodles";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { copy } from "@/lib/copy";
import { staggerContainer, fadeUp } from "@/lib/motion";

export function HeroContent() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
      <FloatSticker
        duration={6}
        className="absolute -right-8 top-12 h-16 w-16 rotate-12 rounded-sticker bg-aviso-yellow brutal-border brutal-shadow-sm sm:h-24 sm:w-24"
      >
        <span />
      </FloatSticker>

      <FloatSticker
        duration={4.5}
        className="absolute bottom-20 left-4 sm:left-12"
      >
        <div className="h-10 w-10 rounded-full bg-aviso-coral brutal-border sm:h-14 sm:w-14" />
      </FloatSticker>

      <FloatSticker
        duration={5.5}
        className="absolute right-1/4 top-1/3 hidden sm:block"
      >
        <StarBurst />
      </FloatSticker>

      <FloatSticker duration={4} className="absolute left-8 top-1/4 hidden lg:block">
        <Wiggle onHover={false}>
          <BellDoodle />
        </Wiggle>
      </FloatSticker>

      <FloatSticker
        duration={3.8}
        className="absolute bottom-32 right-12 hidden lg:block"
      >
        <TelegramDoodle />
      </FloatSticker>

      <Container size="narrow">
        <motion.div
          initial={reduceMotion ? "visible" : "hidden"}
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp}>
            <Badge variant="lime" className="mb-6">
              {copy.brand.promise}
            </Badge>
          </motion.div>

          <h1 className="font-heading text-4xl font-bold uppercase leading-[0.95] sm:text-5xl lg:text-6xl">
            {copy.hero.headline.map((line, i) => (
              <motion.span
                key={line}
                variants={fadeUp}
                className={
                  i === 1
                    ? "block text-transparent [-webkit-text-stroke:2px_var(--foreground)] sm:[-webkit-text-stroke:3px_var(--foreground)]"
                    : "block"
                }
              >
                {line}
              </motion.span>
            ))}
          </h1>

          <motion.div variants={fadeUp} className="mt-4">
            <ScribbleUnderline color="lime" />
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-lg font-body text-lg leading-relaxed opacity-80"
          >
            {copy.hero.subtext}
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center"
          >
            <ButtonLink href="/signin" size="lg" arrow>
              {copy.cta.primary}
            </ButtonLink>
            <Link
              href="#how-it-works"
              className="font-body text-sm font-medium underline-offset-4 hover:underline"
            >
              {copy.cta.secondary} →
            </Link>
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="mt-10 font-body text-sm opacity-60"
          >
            {copy.brand.tagline}
          </motion.p>
        </motion.div>
      </Container>
    </section>
  );
}
