"use client";

import {
  useEffect,
  useRef,
  type ReactNode,
  type MouseEvent,
} from "react";

import { cn } from "@/lib/cn";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    const rect = dialog.getBoundingClientRect();
    const isInDialog =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;

    if (!isInDialog) {
      onClose();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={handleBackdropClick}
      className={cn(
        "fixed inset-0 z-50 m-auto max-h-[90vh] w-[min(100%,42rem)] overflow-hidden rounded-sticker brutal-border bg-aviso-light p-0 brutal-shadow backdrop:bg-aviso-dark/60 open:flex open:flex-col dark:bg-aviso-dark",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4 border-b-2 border-aviso-dark px-6 py-4 dark:border-aviso-light">
        <div>
          <h2 className="font-heading text-xl font-bold uppercase">{title}</h2>
          {description && (
            <p className="mt-1 font-body text-sm text-aviso-dark/70 dark:text-aviso-light/70">
              {description}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-chunky brutal-border px-3 py-1 font-heading text-sm font-bold uppercase hover:bg-aviso-coral/30"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>

      {footer && (
        <div className="border-t-2 border-aviso-dark px-6 py-4 dark:border-aviso-light">
          {footer}
        </div>
      )}
    </dialog>
  );
}
