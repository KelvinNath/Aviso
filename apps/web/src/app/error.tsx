"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/error]", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center py-16">
      <Container size="narrow">
        <div className="text-center" id="main-content">
          <p className="font-heading text-6xl font-bold uppercase sm:text-7xl">
            Oops.
          </p>
          <h1 className="mt-4 font-heading text-3xl font-bold uppercase sm:text-4xl">
            Something exploded.
          </h1>
          <p className="mt-4 font-body text-lg opacity-80">
            Not NTA this time — us. Give it another shot?
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button variant="primary" arrow onClick={reset}>
              Try again
            </Button>
            <Link
              href="/"
              className="font-body text-sm underline-offset-4 hover:underline"
            >
              Back to home →
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
