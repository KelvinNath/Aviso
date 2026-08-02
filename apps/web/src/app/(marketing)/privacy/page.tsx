import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import {
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/components/layout/section";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Aviso handles your data. Spoiler: we don't sell it.",
};

export default function PrivacyPage() {
  return (
    <main id="main-content" className="py-16 sm:py-24">
      <Container size="narrow">
        <SectionHeader>
          <SectionTitle>Privacy Policy</SectionTitle>
          <SectionDescription>
            Last updated: August 2026. Plain English. No law-degree required.
          </SectionDescription>
        </SectionHeader>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 font-body">
          <section>
            <h2 className="font-heading text-xl font-bold uppercase">
              What we collect
            </h2>
            <p className="mt-3 leading-relaxed opacity-80">
              When you sign in with Google, we store your email, display name,
              and profile picture. If you connect Telegram, we store your chat ID
              to deliver notifications. We also store which exams you subscribe to
              and your notification preferences.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold uppercase">
              What we don&apos;t do
            </h2>
            <p className="mt-3 leading-relaxed opacity-80">
              We don&apos;t sell your data. We don&apos;t show ads. We don&apos;t
              share your info with coaching institutes. We&apos;re not that kind
              of app.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold uppercase">
              How we use your data
            </h2>
            <p className="mt-3 leading-relaxed opacity-80">
              To send you exam updates you asked for, manage your subscriptions,
              and keep your account working. That&apos;s basically it.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold uppercase">
              Contact
            </h2>
            <p className="mt-3 leading-relaxed opacity-80">
              Questions? Reach out via our Telegram bot or email us at
              privacy@aviso.app.
            </p>
          </section>
        </div>
      </Container>
    </main>
  );
}
