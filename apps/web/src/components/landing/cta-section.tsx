import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/components/layout/section";
import { copy } from "@/lib/copy";

export function CtaSection() {
  return (
    <Section id="get-started" background="purple">
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <SectionHeader className="mb-8">
            <SectionTitle>{copy.landing.finalCta.title}</SectionTitle>
            <SectionDescription className="mx-auto opacity-90">
              {copy.landing.finalCta.description}
            </SectionDescription>
          </SectionHeader>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <ButtonLink href="/signin" size="lg" variant="primary" arrow>
              {copy.cta.primary}
            </ButtonLink>
            <ButtonLink href="#telegram" size="lg" variant="secondary">
              {copy.cta.telegram}
            </ButtonLink>
          </div>

          <p className="mt-8 font-body text-sm opacity-60">
            {copy.dashboard.peaceful}
          </p>
        </div>
      </Reveal>
    </Section>
  );
}
