import type { Metadata } from "next";
import Link from "next/link";

import { SignInButton } from "@/components/auth/sign-in-button";
import { Reveal } from "@/components/motion/reveal";
import { ScribbleUnderline } from "@/components/motion/doodles";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/layout/container";
import { copy } from "@/lib/copy";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function SignInPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center py-12">
      <Container size="narrow">
        <Reveal className="mx-auto max-w-md text-center">
          <Badge variant="lime" className="mb-6">
            {copy.brand.promise}
          </Badge>

          <h1 className="font-heading text-3xl font-bold uppercase leading-tight sm:text-4xl">
            Almost there.
          </h1>

          <div className="mx-auto mt-4 flex justify-center">
            <ScribbleUnderline color="yellow" className="max-w-[180px]" />
          </div>

          <p className="mt-4 font-body text-base leading-relaxed opacity-80">
            Sign in to pick your exams and stop refreshing NTA like it&apos;s a
            hobby.
          </p>

          <div className="mt-8">
            <SignInButton />
          </div>

          <p className="mt-6 font-body text-sm opacity-60">
            {copy.brand.tagline}
          </p>

          <Link
            href="/"
            className="mt-8 inline-block font-body text-sm underline-offset-4 hover:underline"
          >
            ← Back to home
          </Link>
        </Reveal>
      </Container>
    </main>
  );
}
