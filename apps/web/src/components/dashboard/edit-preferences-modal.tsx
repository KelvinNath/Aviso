"use client";

import { EventType } from "@prisma/client";

import { EditPreferencesForm } from "@/components/dashboard/edit-preferences-form";
import { Modal } from "@/components/ui/modal";
import { copy } from "@/lib/copy";

type EditPreferencesModalProps = {
  subscription: {
    id: string;
    examName: string;
    eventTypes: EventType[];
  } | null;
  onClose: () => void;
};

export function EditPreferencesModal({
  subscription,
  onClose,
}: EditPreferencesModalProps) {
  return (
    <Modal
      open={subscription !== null}
      onClose={onClose}
      title={
        subscription
          ? copy.dashboard.editTitle(subscription.examName)
          : copy.dashboard.editPreferences
      }
      description={copy.dashboard.editDescription}
    >
      {subscription && (
        <EditPreferencesForm
          key={subscription.id}
          subscriptionId={subscription.id}
          initialEventTypes={subscription.eventTypes}
          onCancel={onClose}
          onSaved={onClose}
        />
      )}
    </Modal>
  );
}
