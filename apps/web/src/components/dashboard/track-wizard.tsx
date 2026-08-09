"use client";

import { EventType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { EventTypePicker } from "@/components/dashboard/event-type-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { copy } from "@/lib/copy";
import { DEFAULT_EVENT_TYPES } from "@/lib/event-types";
import { cn } from "@/lib/cn";

export type ExamOption = {
  id: string;
  name: string;
  slug: string;
};

export type EndedCycleExam = ExamOption & {
  cycleYear: number;
};

type TrackWizardProps = {
  availableExams: ExamOption[];
  endedCycleExams: EndedCycleExam[];
};

type WizardStep = "exam" | "events" | "done";

async function saveSubscription(
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

  const data = (await response.json()) as { error?: string };

  return {
    ok: false,
    error: data.error ?? "Failed to save preferences",
  };
}

function StepIndicator({ step }: { step: WizardStep }) {
  const steps: Array<{ id: WizardStep; label: string }> = [
    { id: "exam", label: copy.dashboard.trackStepExam },
    { id: "events", label: copy.dashboard.trackStepEvents },
    { id: "done", label: copy.dashboard.trackStepDone },
  ];

  const currentIndex = steps.findIndex((item) => item.id === step);

  return (
    <ol className="flex flex-wrap gap-2">
      {steps.map((item, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = item.id === step;

        return (
          <li
            key={item.id}
            className={cn(
              "rounded-full px-3 py-1 font-heading text-xs font-bold uppercase tracking-wide brutal-border",
              isCurrent
                ? "bg-aviso-purple text-aviso-light"
                : isComplete
                  ? "bg-aviso-lime text-aviso-dark"
                  : "bg-aviso-light text-aviso-dark/60 dark:bg-aviso-dark dark:text-aviso-light/60",
            )}
          >
            {index + 1}. {item.label}
          </li>
        );
      })}
    </ol>
  );
}

function EndedCycleSection({ exams }: { exams: EndedCycleExam[] }) {
  if (exams.length === 0) {
    return null;
  }

  const cycleYear = exams[0]?.cycleYear ?? new Date().getFullYear();

  return (
    <section
      aria-label={copy.dashboard.trackEndedSection(cycleYear)}
      className="space-y-3 rounded-sticker brutal-border border-dashed bg-aviso-dark/5 p-4 dark:bg-aviso-light/5"
    >
      <div>
        <h3 className="font-heading text-sm font-bold uppercase tracking-wide opacity-80">
          {copy.dashboard.trackEndedSection(cycleYear)}
        </h3>
        <p className="mt-1 font-body text-sm opacity-60">
          {copy.dashboard.trackEndedDescription}
        </p>
      </div>
      <ul className="grid grid-cols-2 gap-3">
        {exams.map((exam) => (
          <li key={exam.id}>
            <div
              className="flex flex-col gap-2 rounded-sticker brutal-border bg-aviso-light/50 p-4 opacity-70 dark:bg-aviso-dark/50"
              aria-disabled="true"
            >
              <p className="font-heading text-sm font-bold uppercase sm:text-lg">{exam.name}</p>
              <Badge variant="default">{copy.dashboard.trackEndedBadge(exam.cycleYear)}</Badge>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function TrackWizard({
  availableExams,
  endedCycleExams,
}: TrackWizardProps) {
  const router = useRouter();
  const [exams, setExams] = useState(availableExams);
  const [endedExams] = useState(endedCycleExams);
  const [step, setStep] = useState<WizardStep>("exam");
  const [selectedExam, setSelectedExam] = useState<ExamOption | null>(null);
  const [selectedEventTypes, setSelectedEventTypes] = useState<EventType[]>(
    DEFAULT_EVENT_TYPES,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setExams(availableExams);
  }, [availableExams]);

  function handleExamSelect(exam: ExamOption) {
    setSelectedExam(exam);
    setSelectedEventTypes(DEFAULT_EVENT_TYPES);
    setError(null);
  }

  async function handleSave() {
    if (!selectedExam) {
      return;
    }

    if (selectedEventTypes.length === 0) {
      setError("Pick at least one update type.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await saveSubscription(selectedExam.id, selectedEventTypes);

      if (!result.ok) {
        throw new Error(result.error);
      }

      setStep("done");
      setExams((current) =>
        current.filter((exam) => exam.id !== selectedExam.id),
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleTrackAnother() {
    setStep("exam");
    setSelectedExam(null);
    setSelectedEventTypes(DEFAULT_EVENT_TYPES);
    setError(null);
  }

  const nothingSelectable = exams.length === 0 && step !== "done";

  if (nothingSelectable && endedExams.length === 0) {
    return (
      <Card variant="purple">
        <CardTitle>{copy.dashboard.trackAllCaughtUp}</CardTitle>
        <CardDescription className="text-base">
          {copy.dashboard.trackAllCaughtUpBody}
        </CardDescription>
        <Button
          type="button"
          variant="primary"
          className="mt-4"
          onClick={() => router.push("/dashboard")}
        >
          {copy.dashboard.trackGoDashboard}
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <StepIndicator step={step} />

      {error && (
        <p className="rounded-chunky brutal-border bg-aviso-coral/20 px-4 py-3 font-body text-sm">
          {error}
        </p>
      )}

      {step === "exam" && (
        <div className="space-y-6">
          {exams.length > 0 ? (
            <section aria-label={copy.dashboard.trackAvailableSection} className="space-y-3">
              <div>
                <h3 className="font-heading text-sm font-bold uppercase tracking-wide">
                  {copy.dashboard.trackAvailableSection}
                </h3>
                <p className="mt-1 font-body text-sm text-aviso-dark/70 dark:text-aviso-light/70">
                  {copy.dashboard.trackAvailableHint}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {exams.map((exam) => {
                  const isSelected = selectedExam?.id === exam.id;

                  return (
                    <button
                      key={exam.id}
                      type="button"
                      onClick={() => handleExamSelect(exam)}
                      className={cn(
                        "rounded-sticker brutal-border p-4 text-left transition-transform hover:-translate-y-0.5",
                        isSelected
                          ? "bg-aviso-lime brutal-shadow text-aviso-dark"
                          : "bg-aviso-light brutal-shadow-sm dark:bg-aviso-dark",
                      )}
                    >
                      <p className="font-heading text-sm font-bold uppercase sm:text-lg">
                        {exam.name}
                      </p>
                    </button>
                  );
                })}
              </div>
              <Button
                type="button"
                arrow
                disabled={!selectedExam}
                onClick={() => setStep("events")}
              >
                {copy.dashboard.trackContinue}
              </Button>
            </section>
          ) : (
            <Card variant="sky">
              <CardTitle>{copy.dashboard.trackNothingOpenTitle}</CardTitle>
              <CardDescription className="text-base">
                {copy.dashboard.trackNothingOpenBody}
              </CardDescription>
              <Button
                type="button"
                variant="secondary"
                className="mt-4"
                onClick={() => router.push("/dashboard")}
              >
                {copy.dashboard.trackGoDashboard}
              </Button>
            </Card>
          )}

          <EndedCycleSection exams={endedExams} />
        </div>
      )}

      {step === "events" && selectedExam && (
        <div className="space-y-6">
          <EventTypePicker
            label={copy.dashboard.trackEventsPrompt(selectedExam.name)}
            selectedEventTypes={selectedEventTypes}
            onChange={setSelectedEventTypes}
          />
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStep("exam")}
            >
              {copy.dashboard.trackBack}
            </Button>
            <Button
              type="button"
              arrow
              disabled={isSubmitting}
              onClick={() => void handleSave()}
            >
              {isSubmitting
                ? copy.dashboard.trackSaving
                : copy.dashboard.trackSave}
            </Button>
          </div>
        </div>
      )}

      {step === "done" && selectedExam && (
        <Card variant="lime">
          <CardTitle className="text-2xl">
            {copy.dashboard.trackSuccessTitle(selectedExam.name)}
          </CardTitle>
          <CardDescription className="text-base">
            {copy.dashboard.trackSuccessBody}
          </CardDescription>
          <div className="mt-4 flex flex-wrap gap-3">
            {exams.length > 0 && (
              <Button type="button" variant="secondary" onClick={handleTrackAnother}>
                {copy.dashboard.trackAnother}
              </Button>
            )}
            <Button
              type="button"
              arrow
              onClick={() => router.push("/dashboard")}
            >
              {copy.dashboard.trackGoDashboard}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
