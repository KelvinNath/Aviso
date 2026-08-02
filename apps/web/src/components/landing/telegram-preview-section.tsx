import { AnimatedTelegramChat } from "@/components/motion/animated-telegram-chat";
import { FloatSticker } from "@/components/motion/float-sticker";
import { TelegramDoodle } from "@/components/motion/doodles";
import { Reveal } from "@/components/motion/reveal";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/components/layout/section";
import { copy } from "@/lib/copy";

export function TelegramPreviewSection() {
  return (
    <Section id="telegram" background="dark">
      <div className="relative grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <FloatSticker
          duration={3.5}
          className="absolute -right-4 -top-4 hidden lg:block"
        >
          <TelegramDoodle className="h-12 w-12" />
        </FloatSticker>

        <Reveal>
          <SectionHeader className="mb-0">
            <SectionTitle>{copy.landing.telegram.title}</SectionTitle>
            <SectionDescription className="opacity-80">
              {copy.landing.telegram.description}
            </SectionDescription>
          </SectionHeader>
        </Reveal>

        <Reveal delay={0.15}>
          <AnimatedTelegramChat />
        </Reveal>
      </div>
    </Section>
  );
}
