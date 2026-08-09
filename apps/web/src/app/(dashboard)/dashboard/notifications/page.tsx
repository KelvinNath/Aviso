import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AnimatedSection } from "@/components/motion/dashboard-motion";
import { NotificationSection } from "@/components/dashboard/notifications/NotificationSection";
import {
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/components/layout/section";
import { copy } from "@/lib/copy";
import { requireSession } from "@/lib/session";
import { findSubscriptionsByUserId } from "@/services/subscription.service";

export const metadata: Metadata = {
  title: "Notifications",
};

export default async function NotificationsPage() {
  const session = await requireSession();
  const subscriptions = await findSubscriptionsByUserId(session.user.id);

  if (subscriptions.length === 0) {
    redirect("/dashboard/track");
  }

  return (
    <main className="space-y-8">
      <SectionHeader>
        <SectionTitle>{copy.dashboard.notificationsPageTitle}</SectionTitle>
        <SectionDescription>
          {copy.dashboard.notificationsPageDescription}
        </SectionDescription>
      </SectionHeader>

      <AnimatedSection>
        <NotificationSection
          subscribedExams={subscriptions.map((subscription) => subscription.exam)}
          showPageHeader={false}
        />
      </AnimatedSection>
    </main>
  );
}
