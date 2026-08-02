import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import {
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/components/layout/section";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The rules for using Aviso. Short version: be cool, we do our best.",
};

export default function TermsPage() {
  return (
    <main id="main-content" className="py-16 sm:py-24">
      <Container size="narrow">
        <SectionHeader>
          <SectionTitle>Terms of Service</SectionTitle>
          <SectionDescription>
            Last updated: August 2026. By using Aviso, you agree to these terms.
          </SectionDescription>
        </SectionHeader>

        <div className="space-y-8 font-body">
          <section>
            <h2 className="font-heading text-xl font-bold uppercase">
              What Aviso is
            </h2>
            <p className="mt-3 leading-relaxed opacity-80">
              Aviso monitors official exam websites and sends you notifications
              when important updates are published. We are not affiliated with
              NTA or any exam authority.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold uppercase">
              Accuracy
            </h2>
            <p className="mt-3 leading-relaxed opacity-80">
              We do our best to detect and relay official updates quickly, but
              we can&apos;t guarantee 100% accuracy or zero delay. Always verify
              critical information on official websites.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold uppercase">
              Your account
            </h2>
            <p className="mt-3 leading-relaxed opacity-80">
              You&apos;re responsible for keeping your account secure. Don&apos;t
              share your login or use Aviso for anything illegal or abusive.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold uppercase">
              Changes
            </h2>
            <p className="mt-3 leading-relaxed opacity-80">
              We may update these terms or the service at any time. Continued use
              means you accept the changes. We&apos;ll try to be reasonable about
              it.
            </p>
          </section>
        </div>
      </Container>
    </main>
  );
}
