import Link from "next/link";
import { redirect } from "next/navigation";

import {
  AnimatedGreeting,
  AnimatedSection,
} from "@/components/motion/dashboard-motion";
import { TelegramConnectCard } from "@/components/dashboard/telegram-connect-card";
import { SubscriptionList } from "@/components/dashboard/subscription-list";
import { ButtonLink } from "@/components/ui/button";
import { copy } from "@/lib/copy";
import { getGreetingName, getTimeGreeting } from "@/lib/dashboard-utils";
import { getTelegramHandle } from "@/lib/telegram-display";
import { requireSession } from "@/lib/session";
import { findSubscriptionsByUserId } from "@/services/subscription.service";
import { getUserById } from "@/services/user.service";

export default async function DashboardPage() {
  const session = await requireSession();
  const user = await getUserById(session.user.id);

  if (!user) {
    redirect("/signin");
  }

  const subscriptions = await findSubscriptionsByUserId(user.id);

  if (subscriptions.length === 0) {
    redirect("/dashboard/track");
  }

  const firstName = getGreetingName(user.displayName, user.email);
  const greeting = copy.dashboard.timeGreeting(firstName, getTimeGreeting());

  return (
    <main className="space-y-8">
      <AnimatedGreeting greeting={greeting} subtitle={copy.dashboard.safe} />

      <AnimatedSection delay={0.1}>
        <TelegramConnectCard
          isConnected={Boolean(user.telegramChatId)}
          telegramHandle={getTelegramHandle(user.telegramUsername, user.displayName)}
        />
      </AnimatedSection>

      <AnimatedSection delay={0.15}>
        <div className="flex flex-col gap-3 rounded-chunky brutal-border bg-aviso-sky/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-body text-sm">
            Tracking {subscriptions.length}{" "}
            {subscriptions.length === 1 ? "exam" : "exams"}. Read updates on the
            notifications page.
          </p>
          <ButtonLink
            href="/dashboard/notifications"
            variant="secondary"
            size="sm"
            arrow
            className="self-start sm:self-center"
          >
            {copy.dashboard.viewNotifications}
          </ButtonLink>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.2} className="space-y-4">
        <div className="flex flex-col gap-3 border-b-2 border-aviso-dark/10 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-aviso-light/10">
          <div>
            <h2 className="font-heading text-xl font-bold uppercase">
              {copy.dashboard.subscriptionsTitle}
            </h2>
            <p className="mt-1 font-body text-sm opacity-70">
              {copy.dashboard.subscriptionsDescription}
            </p>
          </div>
          <ButtonLink
            href="/dashboard/track"
            variant="secondary"
            size="sm"
            arrow
            className="self-start sm:self-center"
          >
            {copy.dashboard.addExam}
          </ButtonLink>
        </div>

        <SubscriptionList subscriptions={subscriptions} />
      </AnimatedSection>

      <AnimatedSection delay={0.25}>
        <p className="font-body text-sm opacity-60">
          {copy.dashboard.peaceful}{" "}
          <Link href="/" className="underline-offset-4 hover:underline">
            Back to home
          </Link>
        </p>
      </AnimatedSection>
    </main>
  );
}
