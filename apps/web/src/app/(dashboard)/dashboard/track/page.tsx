import type { Metadata } from "next";

import { Reveal } from "@/components/motion/reveal";
import { TrackWizard } from "@/components/dashboard/track-wizard";
import {
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/components/layout/section";
import { copy } from "@/lib/copy";
import { requireSession } from "@/lib/session";
import { getActiveExams } from "@/services/exam.service";
import { findSubscriptionsByUserId } from "@/services/subscription.service";

export const metadata: Metadata = {
  title: "Track an exam",
};

export default async function TrackExamPage() {
  const session = await requireSession();
  const [exams, subscriptions] = await Promise.all([
    getActiveExams(),
    findSubscriptionsByUserId(session.user.id),
  ]);

  const subscribedExamIds = new Set(
    subscriptions.map((subscription) => subscription.exam.id),
  );
  const availableExams = exams
    .filter((exam) => !subscribedExamIds.has(exam.id))
    .map((exam) => ({
      id: exam.id,
      name: exam.name,
      slug: exam.slug,
    }));

  return (
    <main className="mx-auto max-w-2xl">
      <Reveal>
        <SectionHeader className="mb-8">
          <SectionTitle>{copy.dashboard.trackTitle}</SectionTitle>
          <SectionDescription>{copy.dashboard.trackDescription}</SectionDescription>
        </SectionHeader>
      </Reveal>

      <Reveal delay={0.1}>
        <TrackWizard availableExams={availableExams} />
      </Reveal>
    </main>
  );
}
