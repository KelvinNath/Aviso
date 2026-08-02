"use client";

import { Reveal } from "@/components/motion/reveal";
import { OnboardingForm } from "@/components/dashboard/onboarding-form";
import {
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/components/layout/section";
import { copy } from "@/lib/copy";

type ExamOption = {
  id: string;
  name: string;
  slug: string;
};

type OnboardingContentProps = {
  exams: ExamOption[];
  subscribedExamIds: string[];
};

export function OnboardingContent({
  exams,
  subscribedExamIds,
}: OnboardingContentProps) {
  return (
    <main className="mx-auto max-w-2xl">
      <Reveal>
        <SectionHeader className="mb-8">
          <SectionTitle>{copy.dashboard.onboardingTitle}</SectionTitle>
          <SectionDescription>
            {copy.dashboard.onboardingDescription}
          </SectionDescription>
        </SectionHeader>
      </Reveal>

      <Reveal delay={0.1}>
        <OnboardingForm exams={exams} subscribedExamIds={subscribedExamIds} />
      </Reveal>
    </main>
  );
}
