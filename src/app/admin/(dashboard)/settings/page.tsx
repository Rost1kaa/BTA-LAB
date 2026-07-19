"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getAutomaticSettingsStats, upsertSettings, type SettingInput } from "@/lib/actions/settings";
import { Save } from "lucide-react";
import toast from "react-hot-toast";

type SettingField = {
  key: string;
  label: string;
  type: "text" | "textarea" | "url" | "number";
  section: string;
  localized?: boolean;
};

const SETTINGS_FIELDS: SettingField[] = [
  { key: "site_name", label: "Site Name", type: "text", section: "General", localized: false },
  { key: "site_description", label: "Site Description", type: "textarea", section: "General", localized: true },
  { key: "contact_email", label: "Contact Email", type: "text", section: "Contact" },
  { key: "contact_phone", label: "Contact Phone", type: "text", section: "Contact" },
  { key: "contact_address", label: "Contact Address", type: "text", section: "Contact", localized: true },
  { key: "contact_location", label: "Location", type: "text", section: "Contact", localized: true },
  { key: "contact_availability", label: "Availability Text", type: "text", section: "Contact", localized: true },
  { key: "social_facebook", label: "Facebook URL", type: "url", section: "Social" },
  { key: "social_instagram", label: "Instagram URL", type: "url", section: "Social" },
  { key: "nav_links", label: "Navigation Links (JSON)", type: "textarea", section: "Navigation" },
  { key: "stat_team_members", label: "Stat: Team Members Value", type: "number", section: "Statistics" },
  { key: "stat_completed_projects", label: "Stat: Completed Projects Value", type: "number", section: "Statistics" },
  { key: "stat_services", label: "Stat: Services Value", type: "number", section: "Statistics" },
  { key: "stat_technologies", label: "Stat: Technologies Value", type: "number", section: "Statistics" },
];

const AUTOMATIC_STAT_KEYS = new Set(["stat_team_members", "stat_services"]);

export default function SettingsPage() {
  const [values, setValues] = useState<Record<string, { ka: string; en: string }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      const supabase = createClient();
      const [{ data }, automaticStats] = await Promise.all([
        supabase.from("site_settings").select("*"),
        getAutomaticSettingsStats(),
      ]);
      const map: Record<string, { ka: string; en: string }> = {};
      if (data) (data as Array<{ setting_key: string; setting_value: string; value_ka?: string; value_en?: string }>).forEach((s) => {
        map[s.setting_key] = {
          ka: s.value_ka || "",
          en: s.value_en || s.setting_value,
        };
      });
      map.stat_team_members = { ka: "", en: String(automaticStats.teamMembers) };
      map.stat_services = { ka: "", en: String(automaticStats.services) };
      setValues(map);
    } catch {
      toast.error("Failed to load settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadSettings();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [loadSettings]);

  function getValue(key: string, locale: "ka" | "en") {
    return values[key]?.[locale] ?? "";
  }

  function updateValue(key: string, locale: "ka" | "en", value: string) {
    setValues((prev) => ({
      ...prev,
      [key]: {
        ka: getValue(key, "ka"),
        en: getValue(key, "en"),
        [locale]: value,
      },
    }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const entries: SettingInput[] = SETTINGS_FIELDS
      .filter((field) => !AUTOMATIC_STAT_KEYS.has(field.key))
      .map((field) => ({
        setting_key: field.key,
        setting_value: getValue(field.key, "en"),
        value_ka: field.localized ? getValue(field.key, "ka") : "",
        value_en: getValue(field.key, "en"),
        setting_type: field.key === "nav_links" ? "json" : field.type === "url" ? "url" : field.type === "textarea" ? "textarea" : "text",
      }));

    try {
      const result = await upsertSettings(entries);
      if (result.error) toast.error(result.error);
      else toast.success("Settings saved!");
    } catch {
      toast.error("Settings could not be saved. Please try again.");
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

  const sections = SETTINGS_FIELDS.reduce<Record<string, typeof SETTINGS_FIELDS>>((acc, field) => {
    if (!acc[field.section]) acc[field.section] = [];
    acc[field.section].push(field);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-fg-primary)]">
            Settings
          </h1>
          <p className="mt-1 text-sm text-[var(--color-fg-tertiary)]">
            Global site configuration
          </p>
        </div>
        <button
          type="submit"
          form="settings-form"
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
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      <form id="settings-form" onSubmit={handleSave} className="space-y-6">
        {Object.entries(sections).map(([section, fields]) => (
          <div
            key={section}
            className="rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-[var(--color-border-primary)] bg-[var(--color-overlay)]">
              <h2 className="text-sm font-semibold text-[var(--color-fg-primary)]">{section}</h2>
            </div>
            <div className="p-6 space-y-5">
              {fields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label htmlFor={`setting-${field.key}`} className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">
                      {field.label}
                    </label>
                    {AUTOMATIC_STAT_KEYS.has(field.key) ? (
                      <span className="text-[11px] font-medium text-[var(--color-fg-tertiary)]/60">
                        ავტომატურად ითვლება
                      </span>
                    ) : null}
                  </div>
                  {field.localized ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(["ka", "en"] as const).map((locale) => (
                        <div key={locale} className="space-y-1">
                          <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--color-fg-tertiary)]/50">
                            {locale === "ka" ? "Georgian" : "English"}
                          </span>
                          {field.type === "textarea" ? (
                            <textarea
                              id={`setting-${field.key}-${locale}`}
                              name={`${field.key}_${locale}`}
                              value={getValue(field.key, locale)}
                              onChange={(e) => updateValue(field.key, locale, e.target.value)}
                              rows={3}
                              className="w-full px-4 py-3 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 transition-all resize-none"
                            />
                          ) : (
                            <input
                              id={`setting-${field.key}-${locale}`}
                              name={`${field.key}_${locale}`}
                              type="text"
                              value={getValue(field.key, locale)}
                              onChange={(e) => updateValue(field.key, locale, e.target.value)}
                              className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 transition-all"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : field.type === "textarea" ? (
                    <textarea
                      id={`setting-${field.key}`}
                      name={field.key}
                      value={getValue(field.key, "en")}
                      onChange={(e) => updateValue(field.key, "en", e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 transition-all resize-none"
                    />
                  ) : (
                    <input
                      id={`setting-${field.key}`}
                      name={field.key}
                      type={field.type === "number" ? "number" : field.type === "url" ? "url" : "text"}
                      value={getValue(field.key, "en")}
                      onChange={(e) => {
                        if (!AUTOMATIC_STAT_KEYS.has(field.key)) {
                          updateValue(field.key, "en", e.target.value);
                        }
                      }}
                      readOnly={AUTOMATIC_STAT_KEYS.has(field.key)}
                      disabled={AUTOMATIC_STAT_KEYS.has(field.key)}
                      className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 transition-all"
                    />
                  )}
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
            {saving ? "Saving..." : "Save All Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
