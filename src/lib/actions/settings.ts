"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";

const settingSchema = z.object({
  setting_key: z.string().trim().min(1).max(100),
  setting_value: z.string().optional().default(""),
  value_ka: z.string().optional().default(""),
  value_en: z.string().optional().default(""),
  setting_type: z
    .enum(["text", "textarea", "url", "image", "boolean", "json"])
    .default("text"),
});

export type SettingInput = z.infer<typeof settingSchema>;

export async function getAllSettings() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("site_settings").select("*").order("setting_key");
  return (data || []) as Record<string, unknown>[];
}

export async function getSetting(key: string): Promise<string> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("site_settings")
    .select("setting_value")
    .eq("setting_key", key)
    .maybeSingle();

  return (data as { setting_value?: string } | null)?.setting_value || "";
}

export async function getSettingsMap(): Promise<Record<string, string>> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("site_settings").select("setting_key, setting_value");
  const items = (data || []) as Array<{ setting_key: string; setting_value: string }>;

  return Object.fromEntries(items.map((item) => [item.setting_key, item.setting_value]));
}

export async function getAutomaticSettingsStats() {
  try {
    const supabase = createServiceRoleClient();
    const [teamResult, servicesResult] = await Promise.all([
      supabase.from("team_members").select("*", { count: "exact", head: true }),
      supabase.from("service_packages").select("*", { count: "exact", head: true }),
    ]);

    if (teamResult.error || servicesResult.error) {
      console.error("Automatic settings stats failed:", teamResult.error?.message || servicesResult.error?.message);
    }

    return {
      teamMembers: teamResult.count ?? 0,
      services: servicesResult.count ?? 0,
    };
  } catch (error) {
    console.error("Automatic settings stats failed:", error);
    return {
      teamMembers: 0,
      services: 0,
    };
  }
}

export async function upsertSetting(key: string, value: string) {
  return upsertSettings([{ setting_key: key, setting_value: value, value_ka: "", value_en: value, setting_type: "text" }]);
}

export async function upsertSettings(entries: SettingInput[]) {
  const admin = await requireAdmin({ redirectToLogin: false });
  if (!admin) return { error: "Unauthorized." };

  const parsed = z.array(settingSchema).min(1).max(100).safeParse(entries);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid settings payload." };
  }

  for (const setting of parsed.data) {
    const valueForValidation = (setting.value_en || setting.setting_value).trim();

    if (setting.setting_type === "url" && valueForValidation) {
      const urlResult = z.string().url().safeParse(valueForValidation);
      if (!urlResult.success) {
        return { error: `Enter a valid URL for ${setting.setting_key}.` };
      }
    }

    if (setting.setting_type === "json" && valueForValidation) {
      try {
        JSON.parse(valueForValidation);
      } catch {
        return { error: `Enter valid JSON for ${setting.setting_key}.` };
      }
    }
  }

  const payload = parsed.data.map((setting) => ({
    ...setting,
    setting_value: (setting.value_en || setting.setting_value).trim(),
    value_ka: setting.value_ka.trim(),
    value_en: (setting.value_en || setting.setting_value).trim(),
    updated_by: admin.user.id,
  }));

  const { error } = await admin.supabase
    .from("site_settings")
    .upsert(payload as never, { onConflict: "setting_key" } as never);

  if (error) {
    console.error("Settings save failed:", error.message);
    return { error: "Settings could not be saved. Please try again." };
  }

  ["/", "/contact", "/admin/settings"].forEach((path) => revalidatePath(path));
  updateTag("cms-settings");
  updateTag("cms-stats");
  return { success: true };
}
