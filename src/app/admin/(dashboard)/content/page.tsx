"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { upsertContentBatch, type ContentUpdateInput } from "@/lib/actions/content";
import { getContentDictionaryKey } from "@/lib/content-dictionary-keys";
import kaDict from "@/locales/ka.json";
import enDict from "@/locales/en.json";
import { Save, CheckCircle2, FileText } from "lucide-react";
import toast from "react-hot-toast";

interface PageSection {
  page: string;
  section: string;
  label: string;
  fields: { key: string; label: string; type: string }[];
}

const PAGE_DEFINITIONS: PageSection[] = [
  // Home
  { page: "home", section: "hero", label: "Hero Section", fields: [
    { key: "eyebrow", label: "Badge Text", type: "text" },
    { key: "heading", label: "Heading", type: "text" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "primaryCta", label: "Primary CTA Label", type: "text" },
    { key: "secondaryCta", label: "Secondary CTA Label", type: "text" },
  ]},
  { page: "home", section: "featured", label: "Featured Projects Section", fields: [
    { key: "sectionTitle", label: "Section Title", type: "text" },
    { key: "sectionDescription", label: "Description", type: "textarea" },
  ]},
  { page: "home", section: "cta", label: "CTA Section", fields: [
    { key: "heading", label: "Heading", type: "text" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "buttonLabel", label: "Button Label", type: "text" },
    { key: "learnMoreLabel", label: "Learn More Label", type: "text" },
  ]},
  // About
  { page: "about", section: "hero", label: "About Hero", fields: [
    { key: "badge", label: "Badge", type: "text" },
    { key: "heading", label: "Heading", type: "text" },
    { key: "description", label: "Description", type: "textarea" },
  ]},
  { page: "about", section: "mission", label: "Mission", fields: [
    { key: "title", label: "Title", type: "text" },
    { key: "description", label: "Description", type: "textarea" },
  ]},
  { page: "about", section: "vision", label: "Vision", fields: [
    { key: "title", label: "Title", type: "text" },
    { key: "description", label: "Description", type: "textarea" },
  ]},
  { page: "about", section: "cta", label: "CTA Section", fields: [
    { key: "heading", label: "Heading", type: "text" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "getInTouch", label: "Get in Touch Label", type: "text" },
    { key: "exploreServices", label: "Explore Services Label", type: "text" },
  ]},
  // Services
  { page: "services", section: "hero", label: "Services Hero", fields: [
    { key: "badge", label: "Badge", type: "text" },
    { key: "heading", label: "Heading", type: "text" },
    { key: "description", label: "Description", type: "textarea" },
  ]},
  { page: "services", section: "cta", label: "Services CTA", fields: [
    { key: "heading", label: "Heading", type: "text" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "button", label: "Button Label", type: "text" },
  ]},
  { page: "services", section: "addons", label: "Service Add-ons", fields: [
    { key: "title", label: "Title", type: "text" },
    { key: "description", label: "Description", type: "textarea" },
  ]},
  // Portfolio
  { page: "portfolio", section: "hero", label: "Portfolio Hero", fields: [
    { key: "badge", label: "Badge", type: "text" },
    { key: "heading", label: "Heading", type: "text" },
    { key: "description", label: "Description", type: "textarea" },
  ]},
  // Team
  { page: "team", section: "hero", label: "Team Hero", fields: [
    { key: "badge", label: "Badge", type: "text" },
    { key: "heading", label: "Heading", type: "text" },
    { key: "description", label: "Description", type: "textarea" },
  ]},
  { page: "team", section: "join", label: "Join CTA", fields: [
    { key: "heading", label: "Heading", type: "text" },
    { key: "description", label: "Description", type: "textarea" },
  ]},
  // Contact
  { page: "contact", section: "hero", label: "Contact Hero", fields: [
    { key: "badge", label: "Badge", type: "text" },
    { key: "heading", label: "Heading", type: "text" },
    { key: "description", label: "Description", type: "textarea" },
  ]},
  { page: "contact", section: "info", label: "Contact Information", fields: [
    { key: "email", label: "Email Label", type: "text" },
    { key: "phone", label: "Phone Label", type: "text" },
    { key: "address", label: "Address Label", type: "text" },
  ]},
  // Footer
  { page: "footer", section: "brand", label: "Footer Brand", fields: [
    { key: "description", label: "Description", type: "textarea" },
  ]},
  { page: "footer", section: "terms", label: "Footer Terms", fields: [
    { key: "about", label: "About Label", type: "text" },
    { key: "terms", label: "Terms Label", type: "text" },
    { key: "privacy", label: "Privacy Label", type: "text" },
  ]},
  { page: "footer", section: "contact", label: "Footer Contact", fields: [
    { key: "location", label: "Location", type: "text" },
    { key: "availability", label: "Availability", type: "text" },
  ]},
  { page: "footer", section: "copyright", label: "Footer Copyright", fields: [
    { key: "text", label: "Copyright Text", type: "text" },
  ]},
];

const KA_DICT = kaDict as Record<string, string>;
const EN_DICT = enDict as Record<string, string>;

function getContentFieldId(page: string, section: string, key: string) {
  return `${page}.${section}.${key}`;
}

function getDictionaryValue(
  dictionary: Record<string, string>,
  page: string,
  section: string,
  key: string
) {
  return dictionary[getContentDictionaryKey(page, section, key)] || "";
}

function getInitialContentValues(): Record<string, { ka: string; en: string }> {
  const initialValues: Record<string, { ka: string; en: string }> = {};

  PAGE_DEFINITIONS.forEach((section) => {
    section.fields.forEach((field) => {
      initialValues[getContentFieldId(section.page, section.section, field.key)] = {
        ka: getDictionaryValue(KA_DICT, section.page, section.section, field.key),
        en: getDictionaryValue(EN_DICT, section.page, section.section, field.key),
      };
    });
  });

  return initialValues;
}

export default function ContentEditorPage() {
  const [values, setValues] = useState<Record<string, { ka: string; en: string }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadContent = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("site_content")
        .select("*")
        .in("page", ["home", "about", "services", "portfolio", "team", "contact", "footer"]);

      const map = getInitialContentValues();
      if (data) {
        data.forEach((item: { page: string; section: string; content_key: string; content_value_ka?: string; content_value_en?: string }) => {
          map[getContentFieldId(item.page, item.section, item.content_key)] = {
            ka: item.content_value_ka || getDictionaryValue(KA_DICT, item.page, item.section, item.content_key),
            en: item.content_value_en || getDictionaryValue(EN_DICT, item.page, item.section, item.content_key),
          };
        });
      }
      setValues(map);
    } catch (err) {
      console.error("Failed to load content:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadContent();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [loadContent]);

  function getValue(page: string, section: string, key: string, locale: "ka" | "en"): string {
    return values[getContentFieldId(page, section, key)]?.[locale] ?? "";
  }

  function setValue(page: string, section: string, key: string, locale: "ka" | "en", value: string) {
    setValues((prev) => ({
      ...prev,
      [getContentFieldId(page, section, key)]: {
        ka: getValue(page, section, key, "ka"),
        en: getValue(page, section, key, "en"),
        [locale]: value,
      },
    }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const entries: ContentUpdateInput[] = [];

    for (const section of PAGE_DEFINITIONS) {
      for (const field of section.fields) {
        entries.push({
          page: section.page,
          section: section.section,
          content_key: field.key,
          content_value_ka: getValue(section.page, section.section, field.key, "ka"),
          content_value_en: getValue(section.page, section.section, field.key, "en"),
          content_type: field.type === "textarea" ? "textarea" : "text",
        });
      }
    }

    try {
      const result = await upsertContentBatch(entries);
      if (result.error) {
        toast.error(result.error);
      } else if (result.results) {
        const errors = result.results.filter((r) => !r.success);
        if (errors.length > 0) {
          toast.error(`Failed to save ${errors.length} fields.`);
        } else {
          toast.success("All content saved successfully!");
        }
      }
    } catch {
      toast.error("Failed to save content.");
    } finally {
      setSaving(false);
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-fg-primary)]">
            Website Content
          </h1>
          <p className="mt-1 text-sm text-[var(--color-fg-tertiary)]">
            Edit the content of your public website pages
          </p>
        </div>
        <button
          type="submit"
          form="content-editor-form"
          disabled={saving}
          className="inline-flex items-center gap-2 h-11 px-5 bg-[var(--color-accent)] text-[var(--color-accent-foreground)] font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
        >
          {saving ? (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <Save size={16} />
          )}
          {saving ? "Saving..." : "Save All Changes"}
        </button>
      </div>

      <form id="content-editor-form" onSubmit={handleSave} className="space-y-6">
        {PAGE_DEFINITIONS.map((section) => (
          <div
            key={`${section.page}-${section.section}`}
            className="rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-[var(--color-border-primary)] bg-[var(--color-overlay)]">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-[var(--color-fg-tertiary)]" />
                <h2 className="text-sm font-semibold text-[var(--color-fg-primary)] capitalize">
                  {section.page} — {section.label}
                </h2>
              </div>
            </div>
            <div className="p-6 space-y-5">
              {section.fields.map((field) => (
                <div key={field.key} className="space-y-3">
                  <label htmlFor={`${section.page}-${section.section}-${field.key}`} className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">
                    {field.label}
                  </label>
                  {(["ka", "en"] as const).map((locale) => (
                    <div key={locale} className="space-y-1">
                      <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--color-fg-tertiary)]/50">
                        {locale === "ka" ? "Georgian" : "English"}
                      </span>
                      {field.type === "textarea" ? (
                        <textarea
                          id={`${section.page}-${section.section}-${field.key}-${locale}`}
                          name={`${section.page}.${section.section}.${field.key}.${locale}`}
                          value={getValue(section.page, section.section, field.key, locale)}
                          onChange={(e) => setValue(section.page, section.section, field.key, locale, e.target.value)}
                          rows={3}
                          className="w-full px-4 py-3 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] placeholder:text-[var(--color-fg-tertiary)]/30 focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 focus:bg-[var(--color-overlay)] transition-all resize-none"
                        />
                      ) : (
                        <input
                          id={`${section.page}-${section.section}-${field.key}-${locale}`}
                          name={`${section.page}.${section.section}.${field.key}.${locale}`}
                          type="text"
                          value={getValue(section.page, section.section, field.key, locale)}
                          onChange={(e) => setValue(section.page, section.section, field.key, locale, e.target.value)}
                          className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] placeholder:text-[var(--color-fg-tertiary)]/30 focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 focus:bg-[var(--color-overlay)] transition-all"
                        />
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 h-12 px-6 bg-[var(--color-accent)] text-[var(--color-accent-foreground)] font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <CheckCircle2 size={18} />
            )}
            {saving ? "Saving..." : "Save All Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
