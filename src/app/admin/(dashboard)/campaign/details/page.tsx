"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updateCampaignDetails } from "@/lib/actions/campaign-details";
import Link from "next/link";
import { ArrowLeft, Save, CheckCircle2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function EditCampaignDetailsPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        const { data, error } = await (supabase.from("campaign_details") as any)
          .select("*")
          .eq("id", 1)
          .single();
        if (error) throw error;
        if (data) {
          setTitle(data.title || "");
          setContent(data.content || "");
        }
      } catch (err) {
        toast.error("Failed to load campaign details.");
      } finally {
        setLoading(false);
      }
    }
    void fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      await updateCampaignDetails(title, content);

      setSuccess(true);
      router.refresh();
      toast.success("დეტალები წარმატებით შენახულია!");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      toast.error("შეცდომა შენახვისას: " + (err?.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={24} className="animate-spin text-[var(--color-fg-tertiary)]" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/campaign" className="p-2 rounded-lg hover:bg-[var(--color-overlay)] transition-colors">
          <ArrowLeft size={18} className="text-[var(--color-fg-tertiary)]" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-fg-primary)]">
            დეტალების რედაქტირება
          </h1>
          <p className="mt-1 text-sm text-[var(--color-fg-tertiary)]">
            Edit full text content for /entrepreneur-support/details
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] p-6 space-y-6">
        {/* Title Field */}
        <div className="space-y-2">
          <label htmlFor="details-title" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">
            სათაური (Title)
          </label>
          <input
            id="details-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 transition-all"
            required
          />
        </div>

        {/* Content Field */}
        <div className="space-y-2">
          <label htmlFor="details-content" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">
            სრული ტექსტი (Content)
          </label>
          <textarea
            id="details-content"
            rows={16}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] leading-relaxed font-sans focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 transition-all resize-y"
            placeholder="ჩასვით დეტალური ტექსტი აქ..."
            required
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border-primary)]">
          {success ? (
            <span className="inline-flex items-center gap-2 text-emerald-500 font-medium text-sm">
              <CheckCircle2 size={16} /> წარმატებით შენახულია!
            </span>
          ) : (
            <div />
          )}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 h-11 px-6 bg-[var(--color-accent)] text-[var(--color-accent-foreground)] font-medium rounded-xl hover:opacity-90 transition-opacity text-sm disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? "ინახება..." : "შენახვა"}
          </button>
        </div>
      </form>
    </div>
  );
}
