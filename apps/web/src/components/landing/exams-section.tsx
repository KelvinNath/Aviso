import { Badge } from "@/components/ui/badge";
import { HoverLift } from "@/components/motion/hover-lift";
import { Reveal, StaggerItem, StaggerReveal } from "@/components/motion/reveal";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/components/layout/section";
import { copy } from "@/lib/copy";
import { supportedExams } from "@/lib/landing-data";

export function ExamsSection() {
  return (
    <Section id="exams">
      <Reveal>
        <SectionHeader>
          <SectionTitle>{copy.landing.exams.title}</SectionTitle>
          <SectionDescription>{copy.landing.exams.description}</SectionDescription>
        </SectionHeader>
      </Reveal>

      <StaggerReveal className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {supportedExams.map((exam) => (
          <StaggerItem key={exam.slug}>
            <HoverLift>
              <div className="flex flex-col items-center gap-3 rounded-sticker brutal-border bg-aviso-light p-4 brutal-shadow-sm dark:bg-aviso-dark sm:p-6">
                <span className="font-heading text-lg font-bold uppercase sm:text-xl">
                  {exam.name}
                </span>
                <Badge variant={exam.status === "live" ? "lime" : "default"}>
                  {exam.status === "live" ? "Live" : "Soon"}
                </Badge>
              </div>
            </HoverLift>
          </StaggerItem>
        ))}
      </StaggerReveal>
    </Section>
  );
}
