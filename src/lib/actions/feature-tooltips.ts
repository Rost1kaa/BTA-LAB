"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { requireAdminMutation } from "@/lib/auth/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const tooltipSchema = z.object({
  name_ka: z.string().trim().min(1, "Georgian name is required.").max(200),
  name_en: z.string().trim().min(1, "English name is required.").max(200),
  description_ka: z.string().trim().min(1, "Georgian description is required.").max(1000),
  description_en: z.string().trim().min(1, "English description is required.").max(1000),
});

export type FeatureTooltipInput = z.infer<typeof tooltipSchema>;

export async function getFeatureTooltips() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("service_feature_tooltips")
    .select("*")
    .order("name_ka");

  if (error) throw new Error("Tooltips could not be loaded.");
  return (data || []) as Array<{
    id: string;
    name_ka: string;
    name_en: string;
    description_ka: string;
    description_en: string;
  }>;
}

export async function createFeatureTooltip(input: FeatureTooltipInput) {
  const admin = await requireAdminMutation("tooltips:create");
  if (!admin) return { error: "Unauthorized." };

  const parsed = tooltipSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid tooltip." };
  }

  const { data, error } = await admin.supabase
    .from("service_feature_tooltips")
    .insert({
      name_ka: parsed.data.name_ka,
      name_en: parsed.data.name_en,
      description_ka: parsed.data.description_ka,
      description_en: parsed.data.description_en,
    } as never)
    .select()
    .single();

  if (error) {
    console.error("Tooltip create failed:", error.message);
    return { error: "Tooltip could not be saved." };
  }

  revalidateTooltips();
  return { data };
}

export async function updateFeatureTooltip(id: string, input: FeatureTooltipInput) {
  const admin = await requireAdminMutation("tooltips:update");
  if (!admin) return { error: "Unauthorized." };

  const idResult = z.string().uuid().safeParse(id);
  const parsed = tooltipSchema.safeParse(input);
  if (!idResult.success || !parsed.success) {
    return { error: "Invalid tooltip data." };
  }

  const { data, error } = await admin.supabase
    .from("service_feature_tooltips")
    .update({
      name_ka: parsed.data.name_ka,
      name_en: parsed.data.name_en,
      description_ka: parsed.data.description_ka,
      description_en: parsed.data.description_en,
    } as never)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Tooltip update failed:", error.message);
    return { error: "Tooltip could not be updated." };
  }

  revalidateTooltips();
  return { data };
}

export async function deleteFeatureTooltip(id: string) {
  const admin = await requireAdminMutation("tooltips:delete");
  if (!admin) return { error: "Unauthorized." };

  if (!z.string().uuid().safeParse(id).success) return { error: "Invalid tooltip identifier." };

  const { error } = await admin.supabase.from("service_feature_tooltips").delete().eq("id", id);
  if (error) {
    console.error("Tooltip delete failed:", error.message);
    return { error: "Tooltip could not be deleted." };
  }

  revalidateTooltips();
  return { success: true };
}

function revalidateTooltips() {
  revalidatePath("/services");
  revalidatePath("/admin/feature-tooltips");
  revalidateTag("cms-feature-tooltips", { expire: 0 });
}
