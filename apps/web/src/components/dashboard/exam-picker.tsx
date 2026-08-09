"use client";

import { useMemo, useState, type Dispatch, type SetStateAction } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/cn";

export type ExamOption = {
  id: string;
  name: string;
  slug: string;
};

type ExamPickerProps = {
  availableExams: ExamOption[];
  subscribedExams: ExamOption[];
  selectedExamIds: string[];
  onSelectedExamIdsChange: Dispatch<SetStateAction<string[]>>;
};

export function ExamPicker({
  availableExams,
  subscribedExams,
  selectedExamIds,
  onSelectedExamIdsChange,
}: ExamPickerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const selectedExams = useMemo(
    () =>
      availableExams.filter((exam) => selectedExamIds.includes(exam.id)),
    [availableExams, selectedExamIds],
  );

  function toggleExam(examId: string) {
    onSelectedExamIdsChange((current) =>
      current.includes(examId)
        ? current.filter((id) => id !== examId)
        : [...current, examId],
    );
  }

  function removeExam(examId: string) {
    onSelectedExamIdsChange((current) =>
      current.filter((id) => id !== examId),
    );
  }

  function selectAll() {
    onSelectedExamIdsChange(availableExams.map((exam) => exam.id));
  }

  function clearAll() {
    onSelectedExamIdsChange([]);
  }

  const selectionLabel =
    selectedExamIds.length === 0
      ? "Choose exams"
      : `Edit selection (${selectedExamIds.length})`;

  return (
    <div>
      <Label>Pick exams</Label>

      {subscribedExams.length > 0 && (
        <div className="mt-3">
          <p className="mb-2 font-body text-xs font-medium uppercase tracking-wide text-aviso-dark/60 dark:text-aviso-light/60">
            Already tracking
          </p>
          <div className="flex flex-wrap gap-2">
            {subscribedExams.map((exam) => (
              <Badge key={exam.id} variant="sky">
                {exam.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 min-h-[3rem] rounded-chunky brutal-border bg-aviso-light/80 p-3 dark:bg-aviso-dark/80">
        {selectedExams.length === 0 ? (
          <p className="font-body text-sm text-aviso-dark/60 dark:text-aviso-light/60">
            No exams selected yet.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedExams.map((exam) => (
              <span
                key={exam.id}
                className="inline-flex items-center gap-1 rounded-full brutal-border bg-aviso-lime px-3 py-1 font-heading text-xs font-bold uppercase tracking-wide text-aviso-dark"
              >
                {exam.name}
                <button
                  type="button"
                  onClick={() => removeExam(exam.id)}
                  className="ml-0.5 rounded-full px-1 hover:bg-aviso-dark/10"
                  aria-label={`Remove ${exam.name}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="mt-3"
        onClick={() => setIsModalOpen(true)}
      >
        {selectionLabel}
      </Button>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Choose exams"
        description="Select every exam you want to track. You can change this later."
        footer={
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={selectAll}>
                Select all
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={clearAll}>
                Clear
              </Button>
            </div>
            <Button type="button" size="sm" onClick={() => setIsModalOpen(false)}>
              Done ({selectedExamIds.length})
            </Button>
          </div>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {availableExams.map((exam) => {
            const isSelected = selectedExamIds.includes(exam.id);

            return (
              <button
                key={exam.id}
                type="button"
                onClick={() => toggleExam(exam.id)}
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
      </Modal>
    </div>
  );
}
