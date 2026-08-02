import { OnboardingContent } from "@/components/dashboard/onboarding-content";
import { requireSession } from "@/lib/session";
import { getActiveExams } from "@/services/exam.service";
import { findSubscriptionsByUserId } from "@/services/subscription.service";

export default async function OnboardingPage() {
  const session = await requireSession();
  const [exams, subscriptions] = await Promise.all([
    getActiveExams(),
    findSubscriptionsByUserId(session.user.id),
  ]);

  const subscribedExamIds = subscriptions.map((sub) => sub.exam.id);

  return (
    <OnboardingContent exams={exams} subscribedExamIds={subscribedExamIds} />
  );
}
