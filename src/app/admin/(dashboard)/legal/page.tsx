"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Scale, Save, Loader2, Eye, Edit3 } from "lucide-react";

type LegalPolicyType = "PRIVACY_POLICY" | "COOKIE_POLICY";

interface PolicyData {
  id: string;
  type: LegalPolicyType;
  title_ka: string;
  title_en: string;
  description_ka: string;
  description_en: string;
  content_ka: string;
  content_en: string;
  updated_at: string;
  created_at: string;
}

interface TabDefinition {
  id: LegalPolicyType;
  label: string;
}

const TABS: TabDefinition[] = [
  { id: "PRIVACY_POLICY", label: "კონფიდენციალურობის პოლიტიკა" },
  { id: "COOKIE_POLICY", label: "ქუქიების პოლიტიკა" },
];

function AdminLegalForm() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<LegalPolicyType>("PRIVACY_POLICY");
  const [policies, setPolicies] = useState<Record<LegalPolicyType, PolicyData | null>>({
    PRIVACY_POLICY: null,
    COOKIE_POLICY: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locale, setLocale] = useState<"ka" | "en">("ka");

  // Form state for the active policy
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [preview, setPreview] = useState(false);

  // Track if current form has been modified
  const [dirty, setDirty] = useState(false);

  // Fetch both policies on mount
  const fetchPolicies = useCallback(async () => {
    setLoading(true);
    try {
      const [privacyRes, cookieRes] = await Promise.all([
        fetch("/api/legal?type=PRIVACY_POLICY"),
        fetch("/api/legal?type=COOKIE_POLICY"),
      ]);

      const [privacy, cookie] = await Promise.all([
        privacyRes.json(),
        cookieRes.json(),
      ]);

      const policiesData: Record<LegalPolicyType, PolicyData | null> = {
        PRIVACY_POLICY: privacy.data || null,
        COOKIE_POLICY: cookie.data || null,
      };

      setPolicies(policiesData);
    } catch {
      toast.error("ვერ მოხერხდა მონაცემების ჩატვირთვა.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  // Sync form fields when active tab or locale changes
  useEffect(() => {
    const policy = policies[activeTab];
    if (policy) {
      setTitle(locale === "ka" ? policy.title_ka : policy.title_en);
      setDescription(locale === "ka" ? policy.description_ka : policy.description_en);
      setContent(locale === "ka" ? policy.content_ka : policy.content_en);
    } else {
      setTitle("");
      setDescription("");
      setContent("");
    }
    setDirty(false);
    setPreview(false);
  }, [activeTab, policies, locale]);

  // Handle form submission
  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Record<string, string> = {
        type: activeTab,
      };

      // Send both locales so the server always has the latest values
      const privacyPolicy = policies.PRIVACY_POLICY;
      const cookiePolicy = policies.COOKIE_POLICY;
      const existing = activeTab === "PRIVACY_POLICY" ? privacyPolicy : cookiePolicy;

      if (locale === "ka") {
        payload.title_ka = title;
        payload.description_ka = description;
        payload.content_ka = content;
        payload.title_en = existing?.title_en || "";
        payload.description_en = existing?.description_en || "";
        payload.content_en = existing?.content_en || "";
      } else {
        payload.title_en = title;
        payload.description_en = description;
        payload.content_en = content;
        payload.title_ka = existing?.title_ka || "";
        payload.description_ka = existing?.description_ka || "";
        payload.content_ka = existing?.content_ka || "";
      }

      const res = await fetch("/api/legal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("წარმატებით განახლდა");
      setDirty(false);
      router.refresh();
      await fetchPolicies();
    } catch {
      toast.error("შეცდომა შენახვისას.");
    } finally {
      setSaving(false);
    }
  };

  const activePolicy = policies[activeTab];
  const lastUpdated = activePolicy?.updated_at
    ? new Date(activePolicy.updated_at).toLocaleDateString(locale === "ka" ? "ka-GE" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[var(--color-overlay)] flex items-center justify-center">
          <Scale size={20} className="text-[var(--color-fg-tertiary)]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-fg-primary)]">
            იურიდიული
          </h1>
          <p className="mt-1 text-sm text-[var(--color-fg-tertiary)]">
            მართეთ კონფიდენციალურობისა და ქუქიების პოლიტიკის გვერდები
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-[var(--color-border-primary)] mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-5 py-3 text-sm font-medium transition-colors duration-200 ${
              activeTab === tab.id
                ? "text-[var(--color-fg-primary)]"
                : "text-[var(--color-fg-tertiary)] hover:text-[var(--color-fg-secondary)]"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-accent)] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Locale toggle */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xs text-[var(--color-fg-tertiary)]">ენა:</span>
        <button
          onClick={() => setLocale("ka")}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            locale === "ka"
              ? "bg-[var(--color-accent)] text-[var(--color-accent-foreground)]"
              : "bg-[var(--color-overlay)] text-[var(--color-fg-tertiary)] hover:text-[var(--color-fg-primary)]"
          }`}
        >
          ქართული
        </button>
        <button
          onClick={() => setLocale("en")}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            locale === "en"
              ? "bg-[var(--color-accent)] text-[var(--color-accent-foreground)]"
              : "bg-[var(--color-overlay)] text-[var(--color-fg-tertiary)] hover:text-[var(--color-fg-primary)]"
          }`}
        >
          English
        </button>
      </div>

      {/* Form */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-[var(--color-fg-tertiary)]" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-fg-primary)] mb-1.5">
              სათაური / Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setDirty(true); }}
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] text-[var(--color-fg-primary)] placeholder-[var(--color-fg-tertiary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] transition-all duration-200"
              placeholder={locale === "ka" ? "შეიყვანეთ სათაური" : "Enter title"}
            />
          </div>

          {/* Description / Subtitle */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-fg-primary)] mb-1.5">
              აღწერა / Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => { setDescription(e.target.value); setDirty(true); }}
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] text-[var(--color-fg-primary)] placeholder-[var(--color-fg-tertiary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] transition-all duration-200"
              placeholder={locale === "ka" ? "მოკლე აღწერა" : "Short description"}
            />
          </div>

          {/* Content with Preview toggle */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-[var(--color-fg-primary)]">
                კონტენტი / Content
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--color-fg-tertiary)]">
                  {content.length} სიმბოლო
                </span>
                <button
                  onClick={() => setPreview(!preview)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                    preview
                      ? "bg-[var(--color-accent)] text-[var(--color-accent-foreground)]"
                      : "bg-[var(--color-overlay)] text-[var(--color-fg-tertiary)] hover:text-[var(--color-fg-primary)]"
                  }`}
                >
                  {preview ? <Edit3 size={12} /> : <Eye size={12} />}
                  {preview
                    ? (locale === "ka" ? "რედაქტირება" : "Edit")
                    : (locale === "ka" ? "პრევიუ" : "Preview")}
                </button>
              </div>
            </div>

            {preview ? (
              <div className="w-full min-h-[300px] p-5 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] prose prose-sm max-w-none text-[var(--color-fg-primary)] whitespace-pre-wrap">
                {content || (locale === "ka" ? "კონტენტი ცარიელია" : "Content is empty")}
              </div>
            ) : (
              <textarea
                value={content}
                onChange={(e) => {
                  if (e.target.value.length <= 100000) {
                    setContent(e.target.value);
                    setDirty(true);
                  }
                }}
                className="w-full min-h-[300px] px-4 py-3 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] text-[var(--color-fg-primary)] placeholder-[var(--color-fg-tertiary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] transition-all duration-200 font-mono text-sm leading-relaxed resize-y"
                placeholder={locale === "ka" ? "შეიყვანეთ კონტენტი..." : "Enter content..."}
              />
            )}
          </div>

          {/* Footer info */}
          <div className="flex items-center justify-between pt-2">
            {lastUpdated && (
              <p className="text-xs text-[var(--color-fg-tertiary)]">
                ბოლო განახლება: {lastUpdated}
              </p>
            )}
            <div className="flex-1" />
            <button
              onClick={handleSave}
              disabled={saving || !dirty}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                saving || !dirty
                  ? "bg-[var(--color-overlay)] text-[var(--color-fg-tertiary)]/50 cursor-not-allowed"
                  : "bg-[var(--color-accent)] text-[var(--color-accent-foreground)] hover:opacity-90 active:scale-[0.98]"
              }`}
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {saving
                ? (locale === "ka" ? "ინახება..." : "Saving...")
                : (locale === "ka" ? "შენახვა" : "Save")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminLegalPage() {
  return <AdminLegalForm />;
}
