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
  content_value_ka: z.string().optional().default(""),
  content_value_en: z.string().optional().default(""),
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
        content_value_ka: parsed.data.content_value_ka.trim(),
        content_value_en: parsed.data.content_value_en.trim(),
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
    page: entry.page,
    section: entry.section,
    content_key: entry.content_key,
    content_value_ka: entry.content_value_ka.trim(),
    content_value_en: entry.content_value_en.trim(),
    content_type: entry.content_type,
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
    .select("content_value_ka, content_value_en")
    .eq("page", page)
    .eq("section", section)
    .eq("content_key", key)
    .single();

  const row = data as { content_value_ka?: string; content_value_en?: string } | null;
  return row?.content_value_ka || row?.content_value_en || "";
}

export async function getContentMap(page: string, section?: string): Promise<Record<string, string>> {
  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from("site_content")
    .select("content_key, content_value_ka, content_value_en")
    .eq("page", page);

  if (section) {
    query = query.eq("section", section);
  }

  const { data } = await query;
  const items = (data || []) as Array<{ content_key: string; content_value_ka?: string; content_value_en?: string }>;

  const map: Record<string, string> = {};
  items.forEach((item) => {
    map[item.content_key] = item.content_value_ka || item.content_value_en || "";
  });

  return map;
}
