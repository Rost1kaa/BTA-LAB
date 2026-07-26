"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  createFeatureTooltip,
  updateFeatureTooltip,
  deleteFeatureTooltip,
  getFeatureTooltips,
  type FeatureTooltipInput,
} from "@/lib/actions/feature-tooltips";
import { Save, Trash2, Plus, Languages } from "lucide-react";
import toast from "react-hot-toast";

interface TooltipRow {
  id: string;
  name_ka: string;
  name_en: string;
  description_ka: string;
  description_en: string;
}

export default function FeatureTooltipsAdminPage() {
  const [tooltips, setTooltips] = useState<TooltipRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [activeLocale, setActiveLocale] = useState<"ka" | "en">("ka");

  const [form, setForm] = useState({
    name_ka: "",
    name_en: "",
    description_ka: "",
    description_en: "",
  });

  const loadTooltips = useCallback(async () => {
    try {
      const data = await getFeatureTooltips();
      setTooltips(data);
    } catch {
      toast.error("Failed to load tooltips.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadTooltips(), 0);
    return () => window.clearTimeout(timeout);
  }, [loadTooltips]);

  function resetForm() {
    setForm({ name_ka: "", name_en: "", description_ka: "", description_en: "" });
    setEditingId(null);
    setActiveLocale("ka");
  }

  function editTooltip(t: TooltipRow) {
    setForm({
      name_ka: t.name_ka || "",
      name_en: t.name_en || "",
      description_ka: t.description_ka || "",
      description_en: t.description_en || "",
    });
    setEditingId(t.id);
    setActiveLocale("ka");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name_ka.trim() || !form.name_en.trim()) {
      toast.error("Both Georgian and English names are required.");
      return;
    }
    if (!form.description_ka.trim() || !form.description_en.trim()) {
      toast.error("Both Georgian and English descriptions are required.");
      return;
    }

    setSaving(true);
    const payload: FeatureTooltipInput = {
      name_ka: form.name_ka.trim(),
      name_en: form.name_en.trim(),
      description_ka: form.description_ka.trim(),
      description_en: form.description_en.trim(),
    };

    try {
      const result = editingId
        ? await updateFeatureTooltip(editingId, payload)
        : await createFeatureTooltip(payload);

      if ("error" in result && result.error) {
        toast.error(result.error);
      } else {
        toast.success(editingId ? "Tooltip updated!" : "Tooltip created!");
        resetForm();
        await loadTooltips();
      }
    } catch {
      toast.error("An error occurred.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(true);
    try {
      const result = await deleteFeatureTooltip(id);
      if ("error" in result && result.error) toast.error(result.error);
      else {
        toast.success("Tooltip deleted.");
        setDeleteConfirm(null);
        await loadTooltips();
      }
    } catch {
      toast.error("Tooltip could not be deleted.");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin h-6 w-6 border-2 border-[var(--color-fg-tertiary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-fg-primary)]">
          Feature Tooltips
        </h1>
        <p className="mt-1 text-sm text-[var(--color-fg-tertiary)]">
          Explain technical terms that appear in service package features
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] p-6 mb-8 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--color-fg-primary)]">
            {editingId ? "Edit Tooltip" : "Add Tooltip"}
          </h2>
          {editingId && (
            <button type="button" onClick={resetForm} className="text-xs text-[var(--color-fg-tertiary)]/70 hover:text-[var(--color-fg-primary)]">
              Cancel
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 mb-2">
          <Languages size={16} className="text-[var(--color-fg-tertiary)]" />
          <div className="inline-flex rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-overlay)] p-1" role="tablist">
            {(["ka", "en"] as const).map((locale) => (
              <button
                key={locale}
                type="button"
                role="tab"
                aria-selected={activeLocale === locale}
                onClick={() => setActiveLocale(locale)}
                className={`h-9 rounded-lg px-4 text-xs font-semibold transition-colors ${
                  activeLocale === locale
                    ? "bg-[var(--color-bg-surface)] text-[var(--color-fg-primary)] shadow-sm"
                    : "text-[var(--color-fg-tertiary)] hover:text-[var(--color-fg-primary)]"
                }`}
              >
                {locale === "ka" ? "Georgian" : "English"}
              </button>
            ))}
          </div>
        </div>

        {activeLocale === "ka" ? (
          <div className="space-y-4" role="tabpanel">
            <div className="space-y-2">
              <label htmlFor="tooltip-name-ka" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">
                Feature name — Georgian
              </label>
              <p className="text-[11px] text-[var(--color-fg-tertiary)]/50">Must match the feature text exactly (including parentheses for tooltip lookup)</p>
              <input
                id="tooltip-name-ka"
                type="text"
                value={form.name_ka}
                onChange={(e) => setForm((p) => ({ ...p, name_ka: e.target.value }))}
                placeholder="ადმინ პანელი (CMS)"
                className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus:outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="tooltip-desc-ka" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">
                Description — Georgian
              </label>
              <textarea
                id="tooltip-desc-ka"
                value={form.description_ka}
                onChange={(e) => setForm((p) => ({ ...p, description_ka: e.target.value }))}
                rows={4}
                placeholder="სისტემა, რომლის საშუალებითაც შეგიძლიათ თავად მართოთ ვებგვერდის ინფორმაცია — შეცვალოთ ტექსტები, ფოტოები, პროდუქტები ან სხვა მონაცემები პროგრამისტის დახმარების გარეშე."
                className="w-full px-4 py-3 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus:outline-none transition-all resize-none"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4" role="tabpanel">
            <div className="space-y-2">
              <label htmlFor="tooltip-name-en" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">
                Feature name — English
              </label>
              <input
                id="tooltip-name-en"
                type="text"
                value={form.name_en}
                onChange={(e) => setForm((p) => ({ ...p, name_en: e.target.value }))}
                placeholder="Admin Panel (CMS)"
                className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus:outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="tooltip-desc-en" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">
                Description — English
              </label>
              <textarea
                id="tooltip-desc-en"
                value={form.description_en}
                onChange={(e) => setForm((p) => ({ ...p, description_en: e.target.value }))}
                rows={4}
                placeholder="A system that allows you to manage website content — edit texts, photos, products, or other data without developer assistance."
                className="w-full px-4 py-3 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus:outline-none transition-all resize-none"
              />
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 h-11 px-5 bg-[var(--color-accent)] text-[var(--color-accent-foreground)] font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
          >
            <Save size={16} />
            {saving ? "Saving..." : editingId ? "Update Tooltip" : "Create Tooltip"}
          </button>
        </div>
      </form>

      {/* Tooltip List */}
      <div className="space-y-4">
        {tooltips.length === 0 ? (
          <div className="rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] p-8 text-center">
            <p className="text-sm text-[var(--color-fg-tertiary)]">No tooltips yet. Add one above.</p>
          </div>
        ) : (
          tooltips.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-[var(--color-fg-primary)]">{t.name_ka}</span>
                    <span className="text-xs text-[var(--color-fg-tertiary)]/50">|</span>
                    <span className="text-sm text-[var(--color-fg-secondary)]">{t.name_en}</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-[var(--color-fg-tertiary)] leading-relaxed">{t.description_ka}</p>
                    <p className="text-sm text-[var(--color-fg-tertiary)]/70 leading-relaxed">{t.description_en}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => editTooltip(t)}
                    className="h-9 px-3 rounded-xl border border-[var(--color-border-primary)] text-xs font-medium text-[var(--color-fg-tertiary)] hover:text-[var(--color-fg-primary)] hover:bg-[var(--color-overlay)] transition-colors"
                  >
                    Edit
                  </button>
                  {deleteConfirm === t.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={deleting}
                        onClick={() => handleDelete(t.id)}
                        className="h-9 px-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-medium text-red-500 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                      >
                        {deleting ? "..." : "Confirm"}
                      </button>
                      <button
                        type="button"
                        disabled={deleting}
                        onClick={() => setDeleteConfirm(null)}
                        className="h-9 px-3 rounded-xl border border-[var(--color-border-primary)] text-xs font-medium text-[var(--color-fg-tertiary)] hover:text-[var(--color-fg-primary)] transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm(t.id)}
                      className="h-9 w-9 flex items-center justify-center rounded-xl border border-[var(--color-border-primary)] text-[var(--color-fg-tertiary)] hover:text-red-500 hover:border-red-500/30 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
