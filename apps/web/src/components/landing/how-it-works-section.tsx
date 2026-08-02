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
import { howItWorksSteps } from "@/lib/landing-data";

export function HowItWorksSection() {
  return (
    <Section id="how-it-works" background="lime">
      <Reveal>
        <SectionHeader>
          <SectionTitle>{copy.landing.howItWorks.title}</SectionTitle>
          <SectionDescription>
            {copy.landing.howItWorks.description}
          </SectionDescription>
        </SectionHeader>
      </Reveal>

      <StaggerReveal className="grid gap-6 sm:grid-cols-3">
        {howItWorksSteps.map((item, index) => (
          <StaggerItem key={item.step}>
            <HoverLift>
              <Card
                variant={item.variant}
                tilt={index % 2 === 0 ? "left" : "right"}
                className="relative h-full"
              >
                <span className="font-heading text-5xl font-bold opacity-20">
                  {item.step}
                </span>
                <CardTitle className="mt-2">{item.title}</CardTitle>
                <CardDescription className="text-base opacity-90">
                  {item.description}
                </CardDescription>
              </Card>
            </HoverLift>
          </StaggerItem>
        ))}
      </StaggerReveal>
    </Section>
  );
}
