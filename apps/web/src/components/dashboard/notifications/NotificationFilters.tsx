"use client";

import { cn } from "@/lib/cn";
import {
  NOTIFICATION_FILTER_OPTIONS,
} from "@/lib/notification-filters";
import type {
  NotificationFilterId,
  NotificationFilterOption,
} from "@/types/dashboard-notification";

type NotificationFiltersProps = {
  activeFilter: NotificationFilterId;
  onFilterChange: (filterId: NotificationFilterId) => void;
};

export function NotificationFilters({
  activeFilter,
  onFilterChange,
}: NotificationFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {NOTIFICATION_FILTER_OPTIONS.map((option) => (
        <FilterChip
          key={option.id}
          option={option}
          isActive={activeFilter === option.id}
          onSelect={() => onFilterChange(option.id)}
        />
      ))}
    </div>
  );
}

type FilterChipProps = {
  option: NotificationFilterOption;
  isActive: boolean;
  onSelect: () => void;
};

function FilterChip({ option, isActive, onSelect }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "rounded-full brutal-border px-3 py-1.5 font-heading text-xs font-bold uppercase tracking-wide transition-colors",
        isActive
          ? "bg-aviso-lime text-aviso-dark"
          : "bg-aviso-light text-aviso-dark hover:bg-aviso-yellow dark:bg-aviso-dark dark:text-aviso-light dark:hover:bg-aviso-purple dark:hover:text-aviso-light",
      )}
    >
      {option.label}
    </button>
  );
}
