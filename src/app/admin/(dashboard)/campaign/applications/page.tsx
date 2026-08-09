"use client";

import { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion, MotionConfig } from "framer-motion";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import {
  updateApplicationStatus,
  deleteCampaignApplication,
} from "@/lib/actions/campaign";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Inbox,
  GripVertical,
  CalendarDays,
  Mail,
  Trash2,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════
// Types & status helpers
// ═══════════════════════════════════════════════════════════════════════════

type ApplicationStatus = "UNOPENED" | "CHECKED";

interface ApplicationRecord {
  id: string;
  application_number: string;
  status: ApplicationStatus;
  first_name_ka: string | null;
  first_name_en: string | null;
  last_name_ka: string | null;
  last_name_en: string | null;
  email: string | null;
  business_name_ka: string | null;
  business_name_en: string | null;
  submitted_at: string;
}

const COLUMNS: { status: ApplicationStatus; label: string; dotClass: string }[] = [
  { status: "UNOPENED", label: "გაუხსნელი", dotClass: "bg-blue-500" },
  { status: "CHECKED", label: "შემოწმებული", dotClass: "bg-green-500" },
];

const STATUS_BADGES: Record<ApplicationStatus, { label: string; className: string }> = {
  UNOPENED: {
    label: "გაუხსნელი",
    className: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  },
  CHECKED: {
    label: "შემოწმებული",
    className: "bg-green-500/10 text-green-500 border-green-500/20",
  },
};

const georgianDateFormatter = new Intl.DateTimeFormat("ka-GE", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  try {
    return georgianDateFormatter.format(new Date(value));
  } catch {
    return "—";
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Page
// ═══════════════════════════════════════════════════════════════════════════

export default function CampaignApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<ApplicationStatus | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApplicationRecord | null>(null);

  const loadApplications = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/campaign/applications");
      if (!response.ok) throw new Error("Failed to fetch applications");
      const data = await response.json();
      setApplications(data.applications || []);
    } catch {
      setError("განაცხადების ჩატვირთვა ვერ მოხერხდა.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load — the await runs before any setState, so no synchronous
  // state update happens inside the effect itself.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await fetch("/api/admin/campaign/applications");
        if (!active) return;
        if (!response.ok) throw new Error("Failed to fetch applications");
        const data = await response.json();
        if (active) setApplications(data.applications || []);
      } catch {
        if (active) setError("განაცხადების ჩატვირთვა ვერ მოხერხდა.");
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleRetry = () => {
    setIsLoading(true);
    setError("");
    void loadApplications();
  };

  const byStatus = useMemo(() => {
    const map: Record<ApplicationStatus, ApplicationRecord[]> = {
      UNOPENED: [],
      CHECKED: [],
    };
    for (const app of applications) {
      if (app.status === "UNOPENED" || app.status === "CHECKED") {
        map[app.status].push(app);
      } else {
        // Defensive: unknown statuses land in "unopened" for review.
        map.UNOPENED.push(app);
      }
    }
    return map;
  }, [applications]);

  const total = applications.length;

  const moveApplication = useCallback(
    async (id: string, newStatus: ApplicationStatus) => {
      const item = applications.find((a) => a.id === id);
      if (!item || item.status === newStatus) return;

      const updated = { ...item, status: newStatus };
      setMovingId(id);
      // Optimistic move — the DB is the source of truth via the server action.
      setApplications((prev) => prev.map((a) => (a.id === id ? updated : a)));

      try {
        await updateApplicationStatus(id, newStatus);
        toast.success(
          newStatus === "CHECKED"
            ? "გადატანილია შემოწმებულში."
            : "გადატანილია გაუხსნელში."
        );
      } catch (err) {
        // Revert on failure.
        setApplications((prev) => prev.map((a) => (a.id === id ? item : a)));
        const message = err instanceof Error ? err.message : "";
        toast.error(message || "სტატუსის განახლება ვერ მოხერხდა.");
      } finally {
        setMovingId(null);
      }
    },
    [applications]
  );

  const handleDrop = (status: ApplicationStatus) => {
    if (dragId) {
      moveApplication(dragId, status);
    }
    setDragId(null);
    setDropTarget(null);
  };

  const handleDelete = async (item: ApplicationRecord) => {
    setDeleteTarget(null);
    // Optimistic removal.
    setApplications((prev) => prev.filter((a) => a.id !== item.id));
    try {
      await deleteCampaignApplication(item.id);
      toast.success("განაცხადი წაიშალა.");
    } catch (err) {
      // Revert on failure.
      setApplications((prev) => [item, ...prev]);
      const message = err instanceof Error ? err.message : "";
      toast.error(message || "წაშლა ვერ მოხერხდა.");
    }
  };

  const renderColumn = (status: ApplicationStatus) => {
    const column = COLUMNS.find((c) => c.status === status)!;
    const items = byStatus[status];
    const isDropTarget = dropTarget === status;

    return (
      <div
        role="list"
        aria-label={column.label}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          setDropTarget(status);
        }}
        onDragLeave={() => setDropTarget((prev) => (prev === status ? null : prev))}
        onDrop={(e) => {
          e.preventDefault();
          handleDrop(status);
        }}
        className={cn(
          "flex-1 min-w-0 rounded-2xl border transition-all duration-200",
          isDropTarget
            ? "border-[var(--color-accent)]/50 bg-[var(--color-accent)]/5"
            : "border-[var(--color-border-primary)] bg-[var(--color-bg-surface)]"
        )}
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-border-primary)]">
          <span className={cn("w-2 h-2 rounded-full", column.dotClass)} />
          <h2 className="text-sm font-semibold text-[var(--color-fg-primary)]">{column.label}</h2>
          <span className="ml-auto text-xs text-[var(--color-fg-tertiary)]/60">{items.length}</span>
        </div>

        <div className="p-3 space-y-3 min-h-[160px]">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Inbox size={24} className="text-[var(--color-fg-tertiary)]/25 mb-2" />
              <p className="text-xs text-[var(--color-fg-tertiary)]/50">
                {status === "UNOPENED" ? "გაუხსნელი განაცხადები არ არის" : "შემოწმებული განაცხადები არ არის"}
              </p>
            </div>
          ) : (
            items.map((item) => {
              const isDragging = dragId === item.id;
              const isMoving = movingId === item.id;
              const name = item.first_name_ka || item.first_name_en || "—";
              const lastName = item.last_name_ka || item.last_name_en || "";
              const business = item.business_name_ka || item.business_name_en || null;
              const badge = STATUS_BADGES[item.status];

              return (
                <motion.div
                  key={item.id}
                  layout
                  layoutId={`app-${item.id}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                  role="listitem"
                >
                  <div
                    draggable
                    onDragStart={(e) => {
                      setDragId(item.id);
                      e.dataTransfer.effectAllowed = "move";
                      try {
                        e.dataTransfer.setData("text/plain", item.id);
                      } catch {
                        // fallback not needed
                      }
                    }}
                    onDragEnd={() => {
                      setDragId(null);
                      setDropTarget(null);
                    }}
                    className={cn(
                      "rounded-xl border bg-[var(--color-bg-primary)] p-4 transition-all duration-200 select-none",
                      isDragging
                        ? "border-[var(--color-accent)]/50 shadow-lg opacity-60"
                        : "border-[var(--color-border-primary)] hover:border-[var(--color-fg-tertiary)]/25"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical
                        size={16}
                        className="mt-0.5 shrink-0 text-[var(--color-fg-tertiary)]/30 cursor-grab"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/admin/campaign/applications/${item.id}`}
                            className="text-sm font-semibold text-[var(--color-fg-primary)] truncate hover:text-[var(--color-accent)] transition-colors"
                          >
                            {item.application_number}
                          </Link>
                          {isMoving && (
                            <Loader2 size={12} className="animate-spin text-[var(--color-fg-tertiary)]/50" />
                          )}
                        </div>
                        <p className="mt-1 text-sm text-[var(--color-fg-secondary)] truncate">
                          {name} {lastName}
                        </p>
                        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border",
                              badge.className
                            )}
                          >
                            {badge.label}
                          </span>
                        </div>
                        <div className="mt-2.5 space-y-1 text-[11px] text-[var(--color-fg-tertiary)]/70">
                          {item.email && (
                            <div className="flex items-center gap-1.5 truncate">
                              <Mail size={11} className="shrink-0" />
                              <span className="truncate">{item.email}</span>
                            </div>
                          )}
                          {business && (
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="shrink-0 font-medium">ბიზნესი:</span>
                              <span className="truncate">{business}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <CalendarDays size={11} />
                            <span>გაგზავნილი: {formatDate(item.submitted_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-[var(--color-border-primary)] flex items-center gap-1">
                      <Link
                        href={`/admin/campaign/applications/${item.id}`}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-[var(--color-fg-tertiary)] hover:text-[var(--color-fg-primary)] hover:bg-[var(--color-overlay)] transition-colors"
                      >
                        <ExternalLink size={12} />
                        ვრცლად
                      </Link>
                      <div className="ml-auto flex items-center gap-1">
                        <button
                          onClick={() => moveApplication(item.id, item.status === "CHECKED" ? "UNOPENED" : "CHECKED")}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-[var(--color-fg-tertiary)] hover:text-[var(--color-fg-primary)] hover:bg-[var(--color-overlay)] transition-colors cursor-pointer"
                          aria-label={
                            item.status === "CHECKED" ? "გადატანა გაუხსნელში" : "გადატანა შემოწმებულში"
                          }
                        >
                          <ChevronRight size={12} className={cn("transition-transform", item.status === "CHECKED" && "rotate-180")} />
                          {item.status === "CHECKED" ? "გაუხსნელი" : "შემოწმებული"}
                        </button>
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-red-500/70 hover:text-red-500 hover:bg-red-500/5 transition-colors cursor-pointer"
                          aria-label={`წაშალე განაცხადი ${item.application_number}`}
                        >
                          <Trash2 size={12} />
                          წაშლა
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3">
          <Loader2 size={20} className="animate-spin text-[var(--color-fg-tertiary)]" />
          <p className="text-sm text-[var(--color-fg-tertiary)]">განაცხადები იტვირთება...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 rounded-2xl bg-red-500/10 border border-red-500/20 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <AlertCircle size={18} className="text-red-500" />
          <p className="text-sm font-medium text-red-600">განაცხადების ჩატვირთვა ვერ მოხერხდა</p>
        </div>
        <p className="text-xs text-red-500/80 mb-4">{error}</p>
        <button
          onClick={handleRetry}
          className="px-4 py-2 text-xs font-medium rounded-lg bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500/20 transition-colors cursor-pointer"
        >
          ხელახლა ცდა
        </button>
      </div>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/campaign"
          className="p-2 rounded-lg hover:bg-[var(--color-overlay)] transition-colors"
          aria-label="უკან კამპანიაზე"
        >
          <ArrowLeft size={18} className="text-[var(--color-fg-tertiary)]" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-fg-primary)]">
            განაცხადები
          </h1>
          <p className="mt-1 text-sm text-[var(--color-fg-tertiary)]">
            მართეთ მეწარმეთა მხარდაჭერის კამპანიის განაცხადები — გადაიტანეთ ბარათები სტატუსებს შორის.
          </p>
        </div>
        <div className="text-xs text-[var(--color-fg-tertiary)] bg-[var(--color-overlay)] px-3 py-1.5 rounded-full whitespace-nowrap">
          {total} სულ
        </div>
      </div>

      {/* Drag & drop hint */}
      <div className="flex items-center gap-2 text-xs text-[var(--color-fg-tertiary)]/60 mb-4">
        <GripVertical size={14} />
        <span>გადაიტანეთ ბარათები გაუხსნელსა და შემოწმებულს შორის</span>
      </div>

      {/* Columns */}
      <div className="flex flex-col lg:flex-row gap-4">
        {COLUMNS.map((c) => (
          <Fragment key={c.status}>{renderColumn(c.status)}</Fragment>
        ))}
      </div>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="განაცხადის წაშლა"
        message="ნამდვილად გსურთ ამ ჩანაწერის წაშლა?"
        detail={deleteTarget ? `${deleteTarget.application_number} — ${deleteTarget.first_name_ka || ""} ${deleteTarget.last_name_ka || ""}`.trim() : undefined}
        confirmLabel="წაშლა"
        cancelLabel="გაუქმება"
        onConfirm={() => (deleteTarget ? handleDelete(deleteTarget) : undefined)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
    </MotionConfig>
  );
}
