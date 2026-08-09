"use client";

import { EventType } from "@prisma/client";

import { Label } from "@/components/ui/label";
import {
  EVENT_TYPE_OPTIONS,
  type EventTypeOption,
} from "@/lib/event-types";
import { cn } from "@/lib/cn";

type EventTypePickerProps = {
  selectedEventTypes: EventType[];
  onChange: (eventTypes: EventType[]) => void;
  label?: string;
  description?: string;
};

export function EventTypePicker({
  selectedEventTypes,
  onChange,
  label = "Update types",
  description,
}: EventTypePickerProps) {
  function toggleEventType(eventType: EventType) {
    onChange(
      selectedEventTypes.includes(eventType)
        ? selectedEventTypes.filter((type) => type !== eventType)
        : [...selectedEventTypes, eventType],
    );
  }

  return (
    <div>
      <Label>{label}</Label>
      {description && (
        <p className="mt-1 font-body text-sm text-aviso-dark/70 dark:text-aviso-light/70">
          {description}
        </p>
      )}
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {EVENT_TYPE_OPTIONS.map((option) => (
          <EventTypeToggle
            key={option.value}
            option={option}
            isChecked={selectedEventTypes.includes(option.value)}
            onToggle={() => toggleEventType(option.value)}
          />
        ))}
      </div>
    </div>
  );
}

type EventTypeToggleProps = {
  option: EventTypeOption;
  isChecked: boolean;
  onToggle: () => void;
};

function EventTypeToggle({ option, isChecked, onToggle }: EventTypeToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
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
}
