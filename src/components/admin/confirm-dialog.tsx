"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Optional detail line shown below the message. */
  detail?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

/**
 * Accessible confirmation dialog used by the admin panel for destructive
 * actions (e.g. deleting questionnaire entries / campaign applications).
 * Keyboard accessible: Escape closes, focus moves into the dialog, and the
 * confirm button is auto-focused.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "წაშლა",
  cancelLabel = "გაუქმება",
  detail,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [pending, setPending] = useState(false);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  // Keep callbacks in refs so the focus/escape effect only re-runs when the
  // dialog opens or closes — never on every parent re-render.
  const onCancelRef = useRef(onCancel);
  const pendingRef = useRef(pending);
  useEffect(() => {
    onCancelRef.current = onCancel;
  }, [onCancel]);
  useEffect(() => {
    pendingRef.current = pending;
  }, [pending]);

  // Focus management + Escape handling.
  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const id = window.setTimeout(() => confirmRef.current?.focus(), 30);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pendingRef.current) {
        e.stopPropagation();
        onCancelRef.current();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener("keydown", onKeyDown);
      previousFocusRef.current?.focus?.();
    };
  }, [open]);

  const handleConfirm = async () => {
    if (pending) return;
    setPending(true);
    try {
      await onConfirm();
    } catch {
      // The caller surfaces the error (toast). Keep the dialog open so the
      // admin can retry or cancel.
    } finally {
      setPending(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/50"
            onClick={() => !pending && onCancel()}
          />

          {/* Dialog */}
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-message"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="relative w-full max-w-sm rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-bg-surface)] p-6 shadow-xl"
          >
            <button
              onClick={onCancel}
              disabled={pending}
              aria-label="დახურვა"
              className="absolute top-3.5 right-3.5 p-1.5 rounded-lg text-[var(--color-fg-tertiary)]/60 hover:text-[var(--color-fg-primary)] hover:bg-[var(--color-overlay)] transition-colors cursor-pointer disabled:opacity-40"
            >
              <X size={16} />
            </button>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} className="text-red-500" />
              </div>
              <div className="min-w-0">
                <h2
                  id="confirm-dialog-title"
                  className="text-base font-semibold text-[var(--color-fg-primary)]"
                >
                  {title}
                </h2>
                <p
                  id="confirm-dialog-message"
                  className="mt-1.5 text-sm text-[var(--color-fg-tertiary)] leading-relaxed"
                >
                  {message}
                </p>
                {detail && (
                  <p className="mt-1 text-xs text-[var(--color-fg-tertiary)]/70 leading-relaxed break-words">
                    {detail}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={onCancel}
                disabled={pending}
                className="inline-flex items-center gap-1.5 px-4 h-9 rounded-xl text-sm font-medium text-[var(--color-fg-tertiary)] hover:text-[var(--color-fg-primary)] hover:bg-[var(--color-overlay)] transition-colors cursor-pointer disabled:opacity-40"
              >
                {cancelLabel}
              </button>
              <button
                ref={confirmRef}
                onClick={handleConfirm}
                disabled={pending}
                className={cn(
                  "inline-flex items-center gap-1.5 px-4 h-9 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-500 transition-colors cursor-pointer",
                  "disabled:opacity-50 disabled:cursor-wait"
                )}
              >
                {pending && <Loader2 size={14} className="animate-spin" />}
                {pending ? "იშლება..." : confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
