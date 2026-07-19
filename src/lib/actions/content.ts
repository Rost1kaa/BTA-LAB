"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAdminMutation } from "@/lib/auth/admin";
import { getRevalidationPaths } from "@/lib/cms";

const contentUpdateSchema = z.object({
  page: z.string().min(1),
  section: z.string().min(1),
  content_key: z.string().min(1),
  content_value: z.string().optional().default(""),
  value_ka: z.string().optional().default(""),
  value_en: z.string().optional().default(""),
  content_type: z.enum(["text", "textarea", "number", "url", "image", "rich_text", "boolean", "json"]).default("text"),
});

export type ContentUpdateInput = z.infer<typeof contentUpdateSchema>;

export async function upsertContent(input: ContentUpdateInput) {
  const admin = await requireAdminMutation("content:upsert");
  if (!admin) return { error: "Unauthorized." };

  const parsed = contentUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input." };
  }

  const { data, error } = await admin.supabase
    .from("site_content")
    .upsert(
      {
        page: parsed.data.page,
        section: parsed.data.section,
        content_key: parsed.data.content_key,
        content_value: (parsed.data.value_en || parsed.data.content_value).trim(),
        value_ka: parsed.data.value_ka.trim(),
        value_en: (parsed.data.value_en || parsed.data.content_value).trim(),
        content_type: parsed.data.content_type,
        updated_by: admin.user.id,
      } as never,
      { onConflict: "page, section, content_key", ignoreDuplicates: false } as never
    )
    .select()
    .single();

  if (error) return { error: error.message };

  const paths = getRevalidationPaths("content");
  paths.forEach((path) => revalidatePath(path));
  updateTag("cms-content");

  return { data };
}

export async function upsertContentBatch(entries: ContentUpdateInput[]) {
  const admin = await requireAdminMutation("content:batch");
  if (!admin) return { error: "Unauthorized." };

  const parsed = z.array(contentUpdateSchema).min(1).max(250).safeParse(entries);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid content payload." };
  }

  const payload = parsed.data.map((entry) => ({
    ...entry,
    content_value: (entry.value_en || entry.content_value).trim(),
    value_ka: entry.value_ka.trim(),
    value_en: (entry.value_en || entry.content_value).trim(),
    updated_by: admin.user.id,
  }));

  const { error } = await admin.supabase
    .from("site_content")
    .upsert(payload as never, {
      onConflict: "page, section, content_key",
      ignoreDuplicates: false,
    } as never);

  if (error) {
    console.error("Content batch save failed:", error.message);
    return { error: "Content could not be saved. Please try again." };
  }

  getRevalidationPaths("content").forEach((path) => revalidatePath(path));
  updateTag("cms-content");

  const results = parsed.data.map((entry) => ({
    success: true,
    key: `${entry.page}.${entry.section}.${entry.content_key}`,
  }));

  return { results };
}

export async function getContentByPage(page: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("site_content")
    .select("*")
    .eq("page", page)
    .order("section")
    .order("sort_order");

  if (error) return [];
  return (data || []) as Record<string, unknown>[];
}

export async function getContentBySection(page: string, section: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("site_content")
    .select("*")
    .eq("page", page)
    .eq("section", section)
    .order("sort_order");

  if (error) return [];
  return (data || []) as Record<string, unknown>[];
}

export async function getAllContent() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("site_content")
    .select("*")
    .order("page")
    .order("section")
    .order("sort_order");

  if (error) return [];
  return (data || []) as Record<string, unknown>[];
}

export async function getContentValue(page: string, section: string, key: string): Promise<string> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("site_content")
    .select("content_value, value_ka, value_en")
    .eq("page", page)
    .eq("section", section)
    .eq("content_key", key)
    .single();

  const row = data as { content_value?: string; value_ka?: string; value_en?: string } | null;
  return row?.value_ka || row?.value_en || row?.content_value || "";
}

export async function getContentMap(page: string, section?: string): Promise<Record<string, string>> {
  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from("site_content")
    .select("content_key, content_value, value_ka, value_en")
    .eq("page", page);

  if (section) {
    query = query.eq("section", section);
  }

  const { data } = await query;
  const items = (data || []) as Array<{ content_key: string; content_value: string; value_ka?: string; value_en?: string }>;

  const map: Record<string, string> = {};
  items.forEach((item) => {
    map[item.content_key] = item.value_ka || item.value_en || item.content_value;
  });

  return map;
}
