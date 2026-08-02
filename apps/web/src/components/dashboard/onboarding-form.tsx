"use client";

import { EventType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Badge } from "@/components/ui/badge";
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

export function OnboardingForm({ exams, subscribedExamIds }: OnboardingFormProps) {
  const router = useRouter();
  const availableExams = exams.filter(
    (exam) => !subscribedExamIds.includes(exam.id),
  );

  const [selectedExamId, setSelectedExamId] = useState(
    availableExams[0]?.id ?? "",
  );
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

    if (!selectedExamId) {
      setError("Pick an exam first.");
      return;
    }

    if (selectedEventTypes.length === 0) {
      setError("Pick at least one update type.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: selectedExamId,
          eventTypes: selectedEventTypes,
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to create subscription");
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

      <div>
        <Label>Pick an exam</Label>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {availableExams.map((exam) => {
            const isSelected = selectedExamId === exam.id;

            return (
              <button
                key={exam.id}
                type="button"
                onClick={() => setSelectedExamId(exam.id)}
                className={cn(
                  "rounded-sticker brutal-border p-4 text-left transition-transform hover:-translate-y-0.5",
                  isSelected
                    ? "bg-aviso-lime brutal-shadow text-aviso-dark"
                    : "bg-aviso-light brutal-shadow-sm dark:bg-aviso-dark",
                )}
              >
                <p className="font-heading text-lg font-bold uppercase">
                  {exam.name}
                </p>
                {isSelected && (
                  <Badge variant="purple" className="mt-2">
                    Selected
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      </div>

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
