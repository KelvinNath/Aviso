"use client";

import { EventType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";

import { ExamPicker } from "@/components/dashboard/exam-picker";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { copy } from "@/lib/copy";
import {
  DEFAULT_EVENT_TYPES,
  EVENT_TYPE_OPTIONS,
} from "@/lib/event-types";
import { cn } from "@/lib/cn";

type ExamOption = {
  id: string;
  name: string;
  slug: string;
};

type OnboardingFormProps = {
  exams: ExamOption[];
  subscribedExamIds: string[];
};

async function createSubscription(
  examId: string,
  eventTypes: EventType[],
): Promise<{ ok: true } | { ok: false; error: string }> {
  const response = await fetch("/api/subscriptions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ examId, eventTypes }),
  });

  if (response.ok) {
    return { ok: true };
  }

  if (response.status === 409) {
    return { ok: true };
  }

  const data = (await response.json()) as { error?: string };

  return {
    ok: false,
    error: data.error ?? "Failed to create subscription",
  };
}

export function OnboardingForm({ exams, subscribedExamIds }: OnboardingFormProps) {
  const router = useRouter();
  const availableExams = useMemo(
    () => exams.filter((exam) => !subscribedExamIds.includes(exam.id)),
    [exams, subscribedExamIds],
  );
  const subscribedExams = useMemo(
    () => exams.filter((exam) => subscribedExamIds.includes(exam.id)),
    [exams, subscribedExamIds],
  );

  const [selectedExamIds, setSelectedExamIds] = useState<string[]>([]);
  const [selectedEventTypes, setSelectedEventTypes] = useState<EventType[]>(
    DEFAULT_EVENT_TYPES,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleEventType(eventType: EventType) {
    setSelectedEventTypes((current) =>
      current.includes(eventType)
        ? current.filter((type) => type !== eventType)
        : [...current, eventType],
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (selectedExamIds.length === 0) {
      setError("Pick at least one exam.");
      return;
    }

    if (selectedEventTypes.length === 0) {
      setError("Pick at least one update type.");
      return;
    }

    setIsSubmitting(true);

    try {
      for (const examId of selectedExamIds) {
        const result = await createSubscription(examId, selectedEventTypes);

        if (!result.ok) {
          throw new Error(result.error);
        }
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (availableExams.length === 0) {
    return (
      <Card variant="purple">
        <CardTitle>All caught up</CardTitle>
        <CardDescription className="text-base">
          You&apos;re already tracking every available exam. Nice.
        </CardDescription>
        <Button
          type="button"
          variant="primary"
          className="mt-4"
          onClick={() => router.push("/dashboard")}
        >
          Back to dashboard
        </Button>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <p className="rounded-chunky brutal-border bg-aviso-coral/20 px-4 py-3 font-body text-sm">
          {error}
        </p>
      )}

      <ExamPicker
        availableExams={availableExams}
        subscribedExams={subscribedExams}
        selectedExamIds={selectedExamIds}
        onSelectedExamIdsChange={setSelectedExamIds}
      />

      <div>
        <Label>What do you want to hear about?</Label>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {EVENT_TYPE_OPTIONS.map((option) => {
            const isChecked = selectedEventTypes.includes(option.value);

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleEventType(option.value)}
                className={cn(
                  "flex items-center gap-3 rounded-chunky brutal-border px-4 py-3 text-left text-sm transition-colors",
                  isChecked
                    ? "bg-aviso-purple text-aviso-light brutal-shadow-sm"
                    : "bg-aviso-light hover:bg-aviso-sky/30 dark:bg-aviso-dark",
                )}
              >
                <span aria-hidden="true">{option.emoji}</span>
                <span className="font-body font-medium">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Button type="submit" size="lg" arrow disabled={isSubmitting}>
        {isSubmitting ? "Setting up..." : copy.dashboard.onboardingSubmit}
      </Button>
    </form>
  );
}
