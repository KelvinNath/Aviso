import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { HoverLift } from "@/components/motion/hover-lift";
import { Reveal, StaggerItem, StaggerReveal } from "@/components/motion/reveal";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/components/layout/section";
import { copy } from "@/lib/copy";
import { features } from "@/lib/landing-data";

export function FeaturesSection() {
  return (
    <Section id="features">
      <Reveal>
        <SectionHeader>
          <SectionTitle>{copy.landing.features.title}</SectionTitle>
          <SectionDescription>
            {copy.landing.features.description}
          </SectionDescription>
        </SectionHeader>
      </Reveal>

      <StaggerReveal className="grid auto-rows-fr gap-6 sm:grid-cols-2">
        {features.map((feature) => (
          <StaggerItem key={feature.title} className="min-h-[168px]">
            <HoverLift className="h-full">
              <Card
                variant={feature.variant}
                tilt={feature.tilt}
                shadow="lg"
                className="relative flex h-full min-h-[168px] flex-col overflow-hidden"
              >
                <span
                  aria-hidden="true"
                  className="absolute -right-2 -top-2 text-4xl opacity-30"
                >
                  {feature.emoji}
                </span>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription className="text-base opacity-90">
                  {feature.description}
                </CardDescription>
              </Card>
            </HoverLift>
          </StaggerItem>
        ))}
      </StaggerReveal>
    </Section>
  );
}
