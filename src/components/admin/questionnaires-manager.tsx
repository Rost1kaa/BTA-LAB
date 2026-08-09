"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import {
  createQuestionnaireInvitation,
  deleteQuestionnaireInvitation,
  setQuestionnaireInvitationViewed,
} from "@/lib/actions/questionnaire-admin";
import { getFieldLabel, getOptionLabel } from "@/data/questionnaire";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import {
  Link2,
  Copy,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  CalendarDays,
  Send,
  Loader2,
  Inbox,
  GripVertical,
  Trash2,
} from "lucide-react";

export interface QuestionnaireInvitationItem {
  id: string;
  full_name: string;
  token: string;
  status: "pending" | "submitted";
  is_viewed: boolean;
  created_at: string;
  submitted_at: string | null;
  answers: Record<string, unknown>;
}

type Category = "unseen" | "seen";

const georgianDateFormatter = new Intl.DateTimeFormat("ka-GE", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatDate(value: string | null) {
  if (!value) return "—";
  try {
    return georgianDateFormatter.format(new Date(value));
  } catch {
    return "—";
  }
}

function stringifyValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map((v) => String(v)).join(", ");
  }
  return JSON.stringify(value, null, 2);
}

export function QuestionnairesManager({ invitations }: { invitations: QuestionnaireInvitationItem[] }) {
  const [unseen, setUnseen] = useState<QuestionnaireInvitationItem[]>(
    invitations.filter((i) => !i.is_viewed)
  );
  const [seen, setSeen] = useState<QuestionnaireInvitationItem[]>(
    invitations.filter((i) => i.is_viewed)
  );

  const [fullName, setFullName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<Category | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<QuestionnaireInvitationItem | null>(null);

  const allItems = useMemo(() => [...unseen, ...seen], [unseen, seen]);

  const handleCreate = async () => {
    const name = fullName.trim();
    if (!name) {
      toast.error("გთხოვთ, შეიყვანოთ სახელი და გვარი.");
      return;
    }
    setCreating(true);
    const result = await createQuestionnaireInvitation(name);
    if (!result.success) {
      toast.error(result.error || "ლინკის შექმნა ვერ მოხერხდა.");
      setCreating(false);
      return;
    }
    const item: QuestionnaireInvitationItem = {
      id: result.invitation.id,
      full_name: result.invitation.full_name,
      token: result.invitation.token,
      status: result.invitation.status,
      is_viewed: result.invitation.is_viewed,
      created_at: result.invitation.created_at,
      submitted_at: result.invitation.submitted_at ?? null,
      answers: {},
    };
    setUnseen((prev) => [item, ...prev]);
    setFullName("");
    setCreatedLink(result.link || null);
    setCopied(false);
    setCreating(false);
    toast.success("ლინკი შეიქმნა.");
  };

  const handleCopy = async () => {
    if (!createdLink) return;
    try {
      await navigator.clipboard.writeText(createdLink);
      setCopied(true);
      toast.success("ლინკი დაკოპირდა.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("კოპირება ვერ მოხერხდა.");
    }
  };

  const moveItem = useCallback(
    async (id: string, toViewed: boolean) => {
      const item = allItems.find((i) => i.id === id);
      if (!item) return;
      if (item.is_viewed === toViewed) return;

      const updated = { ...item, is_viewed: toViewed };
      setMovingId(id);
      // Optimistic move — the DB is the source of truth via the server action.
      setUnseen((prev) => prev.filter((i) => i.id !== id));
      setSeen((prev) => prev.filter((i) => i.id !== id));
      if (toViewed) {
        setSeen((prev) => [updated, ...prev]);
      } else {
        setUnseen((prev) => [updated, ...prev]);
      }

      const result = await setQuestionnaireInvitationViewed(id, toViewed);
      if (!result.success) {
        // Revert on failure.
        setUnseen((prev) => prev.filter((i) => i.id !== id));
        setSeen((prev) => prev.filter((i) => i.id !== id));
        if (toViewed) {
          setUnseen((prev) => [item, ...prev]);
        } else {
          setSeen((prev) => [item, ...prev]);
        }
        toast.error(result.error || "სტატუსის განახლება ვერ მოხერხდა.");
      } else {
        toast.success(toViewed ? "გადატანილია ნანახში." : "გადატანილია უნახავში.");
      }
      setMovingId(null);
    },
    [allItems]
  );

  const handleDrop = (category: Category) => {
    if (dragId) {
      moveItem(dragId, category === "seen");
    }
    setDragId(null);
    setDropTarget(null);
  };

  const handleDelete = async (item: QuestionnaireInvitationItem) => {
    setDeleteTarget(null);
    // Optimistic removal — the DB is the source of truth via the server action.
    setUnseen((prev) => prev.filter((i) => i.id !== item.id));
    setSeen((prev) => prev.filter((i) => i.id !== item.id));

    const result = await deleteQuestionnaireInvitation(item.id);
    if (!result.success) {
      // Revert on failure.
      setUnseen((prev) => (item.is_viewed ? prev : [item, ...prev]));
      setSeen((prev) => (item.is_viewed ? [item, ...prev] : prev));
      toast.error(result.error || "წაშლა ვერ მოხერხდა.");
    } else {
      toast.success("ჩანაწერი წაიშალა.");
    }
  };

  const renderColumn = (category: Category) => {
    const items = category === "unseen" ? unseen : seen;
    const isDropTarget = dropTarget === category;

    return (
      <div
        role="list"
        aria-label={category === "unseen" ? "უნახავი" : "ნანახი"}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          setDropTarget(category);
        }}
        onDragLeave={() => setDropTarget((prev) => (prev === category ? null : prev))}
        onDrop={(e) => {
          e.preventDefault();
          handleDrop(category);
        }}
        className={cn(
          "flex-1 min-w-0 rounded-2xl border transition-all duration-200",
          isDropTarget
            ? "border-[var(--color-accent)]/50 bg-[var(--color-accent)]/5"
            : "border-[var(--color-border-primary)] bg-[var(--color-bg-surface)]"
        )}
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-border-primary)]">
          <span
            className={cn(
              "w-2 h-2 rounded-full",
              category === "unseen" ? "bg-amber-500" : "bg-green-500"
            )}
          />
          <h2 className="text-sm font-semibold text-[var(--color-fg-primary)]">
            {category === "unseen" ? "უნახავი" : "ნანახი"}
          </h2>
          <span className="ml-auto text-xs text-[var(--color-fg-tertiary)]/60">{items.length}</span>
        </div>

        <div className="p-3 space-y-3 min-h-[160px]">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Inbox size={24} className="text-[var(--color-fg-tertiary)]/25 mb-2" />
              <p className="text-xs text-[var(--color-fg-tertiary)]/50">
                {category === "unseen"
                  ? "უნახავი ჩანაწერები არ არის"
                  : "ნანახი ჩანაწერები არ არის"}
              </p>
            </div>
          ) : (
            items.map((item) => {
              const isDragging = dragId === item.id;
              const isMoving = movingId === item.id;
              const isExpanded = expandedId === item.id;
              const completed = item.status === "submitted";

              return (
                <motion.div
                  key={item.id}
                  layout
                  layoutId={`inv-${item.id}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
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
                        // IE fallback not needed
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
                          <p className="text-sm font-semibold text-[var(--color-fg-primary)] truncate">
                            {item.full_name}
                          </p>
                          {isMoving && <Loader2 size={12} className="animate-spin text-[var(--color-fg-tertiary)]/50" />}
                        </div>
                        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border",
                              completed
                                ? "bg-green-500/10 text-green-500 border-green-500/20"
                                : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            )}
                          >
                            {completed ? "შევსებული" : "შექმნილი"}
                          </span>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border",
                              completed
                                ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                : "bg-[var(--color-overlay)] text-[var(--color-fg-tertiary)] border-[var(--color-border-primary)]"
                            )}
                          >
                            {completed ? "გამოყენებული" : "გამოუყენებელი"}
                          </span>
                        </div>
                        <div className="mt-2.5 space-y-1 text-[11px] text-[var(--color-fg-tertiary)]/70">
                          <div className="flex items-center gap-1.5">
                            <CalendarDays size={11} />
                            <span>შექმნილი: {formatDate(item.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Send size={11} />
                            <span>შევსებული: {formatDate(item.submitted_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-[var(--color-border-primary)] flex items-center gap-1">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-[var(--color-fg-tertiary)] hover:text-[var(--color-fg-primary)] hover:bg-[var(--color-overlay)] transition-colors cursor-pointer"
                      >
                        <ChevronDown size={12} className={cn("transition-transform", isExpanded && "rotate-180")} />
                        {isExpanded ? "პასუხების დამალვა" : "პასუხების ნახვა"}
                      </button>
                      <div className="ml-auto flex items-center gap-1">
                        <button
                          onClick={() => moveItem(item.id, !item.is_viewed)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-[var(--color-fg-tertiary)] hover:text-[var(--color-fg-primary)] hover:bg-[var(--color-overlay)] transition-colors cursor-pointer"
                          aria-label={item.is_viewed ? "გადატანა უნახავში" : "გადატანა ნანახში"}
                        >
                          {item.is_viewed ? <EyeOff size={12} /> : <Eye size={12} />}
                          {item.is_viewed ? "უნახავი" : "ნანახი"}
                        </button>
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-red-500/70 hover:text-red-500 hover:bg-red-500/5 transition-colors cursor-pointer"
                          aria-label={`წაშალე ${item.full_name} კითხვარი`}
                        >
                          <Trash2 size={12} />
                          წაშლა
                        </button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 pt-3 border-t border-[var(--color-border-primary)] space-y-2">
                            <AnswersList answers={item.answers} />
                            {completed && (
                              <p className="text-[10px] text-[var(--color-fg-tertiary)]/50">
                                ლინკი გამოყენებულია და ხელახლა ვერ გამოყენდება.
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <MotionConfig reducedMotion="user">
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-fg-primary)]">კითხვარი</h1>
          <p className="mt-1 text-sm text-[var(--color-fg-tertiary)]">
            შექმენით ერთჯერადი ბმულები და მართეთ შევსებული კითხვარები.
          </p>
        </div>
        <div className="text-xs text-[var(--color-fg-tertiary)] bg-[var(--color-overlay)] px-3 py-1.5 rounded-full whitespace-nowrap">
          {allItems.length} სულ
        </div>
      </div>

      {/* Create link */}
      <div className="rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-bg-surface)] p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Link2 size={16} className="text-[var(--color-accent)]" />
          <h2 className="text-sm font-semibold text-[var(--color-fg-primary)]">ლინკის შექმნა</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
            }}
            placeholder="სახელი და გვარი"
            aria-label="სახელი და გვარი"
            className="flex-1 h-10 px-4 rounded-xl bg-[var(--color-overlay)] border border-[var(--color-border-primary)] text-sm text-[var(--color-fg-primary)] placeholder:text-[var(--color-fg-tertiary)]/40 focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 transition-all"
          />
          <button
            onClick={handleCreate}
            disabled={creating}
            className={cn(
              "inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap",
              creating
                ? "bg-[var(--color-overlay)] text-[var(--color-fg-tertiary)]/50 cursor-not-allowed"
                : "bg-[var(--color-accent)] text-[var(--color-accent-foreground)] hover:opacity-90"
            )}
          >
            {creating ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                იქმნება...
              </>
            ) : (
              "ლინკის შექმნა"
            )}
          </button>
        </div>

        {createdLink && (
          <div className="mt-4 rounded-xl bg-[var(--color-overlay)] border border-green-500/20 p-3 flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-fg-tertiary)]/60 mb-1">
                შექმნილი ლინკი
              </p>
              <p className="text-xs text-[var(--color-accent)] break-all">{createdLink}</p>
            </div>
            <button
              onClick={handleCopy}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-medium border transition-all duration-200 cursor-pointer shrink-0",
                copied
                  ? "bg-green-500/10 text-green-500 border-green-500/20"
                  : "bg-[var(--color-bg-surface)] text-[var(--color-fg-primary)] border-[var(--color-border-primary)] hover:border-[var(--color-fg-tertiary)]/30"
              )}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "დაკოპირდა" : "ლინკის კოპირება"}
            </button>
          </div>
        )}
      </div>

      {/* Drag & drop hint */}
      <div className="flex items-center gap-2 text-xs text-[var(--color-fg-tertiary)]/60 mb-4">
        <GripVertical size={14} />
        <span>გადაიტანეთ ბარათები უნახავსა და ნანახს შორის</span>
      </div>

      {/* Columns */}
      <div className="flex flex-col lg:flex-row gap-4">
        {renderColumn("unseen")}
        {renderColumn("seen")}
      </div>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="კითხვარის წაშლა"
        message="ნამდვილად გსურთ ამ ჩანაწერის წაშლა?"
        detail={deleteTarget ? deleteTarget.full_name : undefined}
        confirmLabel="წაშლა"
        cancelLabel="გაუქმება"
        onConfirm={() => (deleteTarget ? handleDelete(deleteTarget) : undefined)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
    </MotionConfig>
  );
}

function AnswersList({ answers }: { answers: Record<string, unknown> }) {
  const entries = Object.entries(answers).filter(([, value]) => {
    if (value === null || value === undefined || value === "") return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  });

  if (entries.length === 0) {
    return (
      <p className="text-xs text-[var(--color-fg-tertiary)]/60">
        {answers && Object.keys(answers).length > 0
          ? "პასუხები ვერ იკითხება."
          : "კითხვარი ჯერ არ არის შევსებული."}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map(([key, value]) => {
        const isOptionText = key.includes("__");
        const label = isOptionText ? key.split("__")[0] : key;
        const questionLabel = getFieldLabel(label);
        const displayLabel = isOptionText
          ? `${questionLabel || label}`
          : questionLabel || label;

        let displayValue: string;
        if (isOptionText) {
          displayValue = stringifyValue(value);
        } else if (typeof value === "string") {
          displayValue = getOptionLabel(label, value) || value;
        } else if (Array.isArray(value)) {
          displayValue = (value as string[])
            .map((v) => getOptionLabel(label, v) || v)
            .join(", ");
        } else {
          displayValue = stringifyValue(value);
        }

        return (
          <div key={key} className="rounded-lg bg-[var(--color-overlay)] p-2.5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-fg-tertiary)]/60">
              {displayLabel}
            </p>
            <p className="mt-0.5 text-xs text-[var(--color-fg-primary)] whitespace-pre-wrap break-words">
              {displayValue || "—"}
            </p>
          </div>
        );
      })}
    </div>
  );
}
