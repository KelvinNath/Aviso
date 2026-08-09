import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Container } from "@/components/layout/container";
import { requireSession } from "@/lib/session";
import { findSubscriptionsByUserId } from "@/services/subscription.service";
import { getUserById } from "@/services/user.service";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireSession().catch(() => null);

  if (!session?.user) {
    redirect("/signin");
  }

  const user = await getUserById(session.user.id);

  if (!user) {
    redirect("/signin");
  }

  const subscriptions = await findSubscriptionsByUserId(user.id);

  return (
    <div className="min-h-screen bg-aviso-light dark:bg-aviso-dark">
      <DashboardHeader
        displayName={user.displayName}
        email={user.email}
        avatarUrl={user.avatarUrl}
        hasSubscriptions={subscriptions.length > 0}
      />
      <Container id="main-content" size="narrow" className="py-8 sm:py-12">
        {children}
      </Container>
    </div>
  );
}
