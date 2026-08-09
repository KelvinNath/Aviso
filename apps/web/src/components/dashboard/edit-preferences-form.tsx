"use client";

import { EventType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { EventTypePicker } from "@/components/dashboard/event-type-picker";
import { Button } from "@/components/ui/button";
import { copy } from "@/lib/copy";

type EditPreferencesFormProps = {
  subscriptionId: string;
  initialEventTypes: EventType[];
  onCancel?: () => void;
  onSaved?: () => void;
};

async function updateSubscription(
  subscriptionId: string,
  eventTypes: EventType[],
): Promise<{ ok: true } | { ok: false; error: string }> {
  const response = await fetch(`/api/subscriptions/${subscriptionId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventTypes }),
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

export function EditPreferencesForm({
  subscriptionId,
  initialEventTypes,
  onCancel,
  onSaved,
}: EditPreferencesFormProps) {
  const router = useRouter();
  const [selectedEventTypes, setSelectedEventTypes] =
    useState<EventType[]>(initialEventTypes);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleCancel() {
    if (onCancel) {
      onCancel();
      return;
    }

    router.push("/dashboard");
  }

  async function handleSubmit() {
    if (selectedEventTypes.length === 0) {
      setError("Pick at least one update type.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await updateSubscription(
        subscriptionId,
        selectedEventTypes,
      );

      if (!result.ok) {
        throw new Error(result.error);
      }

      router.refresh();

      if (onSaved) {
        onSaved();
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-chunky brutal-border bg-aviso-coral/20 px-4 py-3 font-body text-sm">
          {error}
        </p>
      )}

      <EventTypePicker
        label={copy.dashboard.editDescription}
        selectedEventTypes={selectedEventTypes}
        onChange={setSelectedEventTypes}
      />

      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="secondary" onClick={handleCancel}>
          {copy.dashboard.editCancel}
        </Button>
        <Button
          type="button"
          arrow
          disabled={isSubmitting}
          onClick={() => void handleSubmit()}
        >
          {isSubmitting ? copy.dashboard.editSaving : copy.dashboard.editSave}
        </Button>
      </div>
    </div>
  );
}
