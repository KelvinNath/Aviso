import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/layout/container";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center py-16">
      <Container size="narrow">
        <div className="text-center" id="main-content">
          <p className="font-heading text-8xl font-bold uppercase">404</p>
          <h1 className="mt-4 font-heading text-3xl font-bold uppercase sm:text-4xl">
            This page doesn&apos;t exist.
          </h1>
          <p className="mt-4 font-body text-lg opacity-80">
            Kind of like that admit card you thought was released at midnight.
            It wasn&apos;t.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <ButtonLink href="/" variant="primary" arrow>
              Back to safety
            </ButtonLink>
            <Link
              href="/dashboard"
              className="font-body text-sm underline-offset-4 hover:underline"
            >
              Go to dashboard →
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
