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
import { testimonials } from "@/lib/landing-data";

export function TestimonialsSection() {
  return (
    <Section id="testimonials" background="default">
      <Reveal>
        <SectionHeader>
          <SectionTitle>{copy.landing.testimonials.title}</SectionTitle>
          <SectionDescription>
            {copy.landing.testimonials.description}
          </SectionDescription>
        </SectionHeader>
      </Reveal>

      <StaggerReveal className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((item, index) => (
          <StaggerItem key={item.name}>
            <HoverLift>
              <Card
                variant={item.variant}
                tilt={index === 1 ? "right" : index === 0 ? "left" : "none"}
                className="h-full"
              >
                <span
                  aria-hidden="true"
                  className="font-heading text-4xl leading-none opacity-30"
                >
                  &ldquo;
                </span>
                <CardDescription className="mt-2 text-base font-medium leading-relaxed">
                  {item.quote}
                </CardDescription>
                <div className="mt-4 border-t-2 border-aviso-dark/10 pt-4 dark:border-aviso-light/10">
                  <CardTitle className="text-sm">{item.name}</CardTitle>
                  <p className="mt-0.5 font-body text-xs opacity-70">{item.detail}</p>
                </div>
              </Card>
            </HoverLift>
          </StaggerItem>
        ))}
      </StaggerReveal>
    </Section>
  );
}
