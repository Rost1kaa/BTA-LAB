"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { requireAdminMutation } from "@/lib/auth/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ServicePackage } from "@/types/supabase";

const servicePackageSchema = z.object({
  section: z.enum(["website", "social-media", "addons"]),
  name: z.string().trim().min(1, "Name is required.").max(120),
  name_ka: z.string().trim().max(120).default(""),
  name_en: z.string().trim().max(120).default(""),
  price: z.string().trim().max(80).default(""),
  price_suffix_ka: z.string().trim().max(40).default(""),
  price_suffix_en: z.string().trim().max(40).default(""),
  custom_price_label_ka: z.string().trim().max(80).default(""),
  custom_price_label_en: z.string().trim().max(80).default(""),
  billing_label: z.string().trim().max(120).default(""),
  billing_label_ka: z.string().trim().max(120).default(""),
  billing_label_en: z.string().trim().max(120).default(""),
  description: z.string().trim().max(2000).default(""),
  description_ka: z.string().trim().max(2000).default(""),
  description_en: z.string().trim().max(2000).default(""),
  ideal_for: z.string().trim().max(500).default(""),
  ideal_for_ka: z.string().trim().max(500).default(""),
  ideal_for_en: z.string().trim().max(500).default(""),
  features: z.array(z.string().trim().min(1).max(300)).max(50).default([]),
  features_ka: z.array(z.string().trim().min(1).max(300)).max(50).default([]),
  features_en: z.array(z.string().trim().min(1).max(300)).max(50).default([]),
  delivery_time: z.string().trim().max(120).default(""),
  delivery_time_ka: z.string().trim().max(120).default(""),
  delivery_time_en: z.string().trim().max(120).default(""),
  cta: z.string().trim().min(1).max(100).default("Choose Package"),
  cta_label_ka: z.string().trim().max(100).default(""),
  cta_label_en: z.string().trim().max(100).default(""),
  highlighted: z.boolean().default(false),
  custom_price: z.boolean().default(false),
  price_explanation: z.string().trim().max(500).default(""),
  price_explanation_ka: z.string().trim().max(500).default(""),
  price_explanation_en: z.string().trim().max(500).default(""),
  icon_name: z.string().trim().max(80).default(""),
  display_order: z.number().int().min(0).max(10000).default(0),
  published: z.boolean().default(true),
});

export type ServicePackageInput = z.infer<typeof servicePackageSchema>;

export async function getServicePackages(includeDrafts = false): Promise<ServicePackage[]> {
  const supabase = await createServerSupabaseClient();
  let query = supabase.from("service_packages").select("*").order("section").order("display_order");

  if (!includeDrafts) {
    query = query.eq("published", true);
  }

  const { data, error } = await query;
  if (error) throw new Error("Service packages could not be loaded.");
  return (data || []) as ServicePackage[];
}

export async function createServicePackage(input: ServicePackageInput) {
  const admin = await requireAdminMutation("services:create");
  if (!admin) return { error: "Unauthorized." };

  const parsed = servicePackageSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid package." };

  const payload = toDatabasePayload(parsed.data, admin.user.id);
  const { data, error } = await admin.supabase
    .from("service_packages")
    .insert(payload as never)
    .select()
    .single();

  if (error && isMissingSchemaError(error.message)) {
    const retry = await admin.supabase
      .from("service_packages")
      .insert(toLegacyDatabasePayload(parsed.data, admin.user.id) as never)
      .select()
      .single();

    if (retry.error) return actionError("create", retry.error.message);
    revalidateServices();
    return { data: retry.data, warning: bilingualMigrationWarning };
  }

  if (error) return actionError("create", error.message);
  revalidateServices();
  return { data };
}

export async function updateServicePackage(id: string, input: ServicePackageInput) {
  const admin = await requireAdminMutation("services:update");
  if (!admin) return { error: "Unauthorized." };

  const idResult = z.string().uuid().safeParse(id);
  const parsed = servicePackageSchema.safeParse(input);
  if (!idResult.success || !parsed.success) {
    return { error: parsed.success ? "Invalid package identifier." : parsed.error.issues[0]?.message ?? "Invalid package." };
  }

  const payload = toDatabasePayload(parsed.data, admin.user.id);
  const { data, error } = await admin.supabase
    .from("service_packages")
    .update(payload as never)
    .eq("id", id)
    .select()
    .single();

  if (error && isMissingSchemaError(error.message)) {
    const retry = await admin.supabase
      .from("service_packages")
      .update(toLegacyDatabasePayload(parsed.data, admin.user.id) as never)
      .eq("id", id)
      .select()
      .single();

    if (retry.error) return actionError("update", retry.error.message);
    revalidateServices();
    return { data: retry.data, warning: bilingualMigrationWarning };
  }

  if (error) return actionError("update", error.message);
  revalidateServices();
  return { data };
}

export async function deleteServicePackage(id: string) {
  const admin = await requireAdminMutation("services:delete");
  if (!admin) return { error: "Unauthorized." };
  if (!z.string().uuid().safeParse(id).success) return { error: "Invalid package identifier." };

  const { error } = await admin.supabase.from("service_packages").delete().eq("id", id);
  if (error) return actionError("delete", error.message);

  revalidateServices();
  return { success: true };
}

function toDatabasePayload(input: ServicePackageInput, userId: string) {
  return {
    ...input,
    name: input.name_en || input.name_ka || input.name,
    name_ka: input.name_ka,
    name_en: input.name_en,
    price_suffix_ka: input.price_suffix_ka,
    price_suffix_en: input.price_suffix_en,
    custom_price_label_ka: input.custom_price_label_ka,
    custom_price_label_en: input.custom_price_label_en,
    billing_label: input.billing_label || null,
    billing_label_ka: input.billing_label_ka,
    billing_label_en: input.billing_label_en,
    description: input.description || null,
    description_ka: input.description_ka,
    description_en: input.description_en,
    ideal_for: input.ideal_for || null,
    ideal_for_ka: input.ideal_for_ka,
    ideal_for_en: input.ideal_for_en,
    features: input.features_en.length ? input.features_en : input.features,
    features_ka: input.features_ka,
    features_en: input.features_en,
    delivery_time: input.delivery_time || null,
    delivery_time_ka: input.delivery_time_ka,
    delivery_time_en: input.delivery_time_en,
    cta: input.cta_label_en || input.cta,
    cta_ka: input.cta_label_ka,
    cta_en: input.cta_label_en || input.cta,
    cta_label_ka: input.cta_label_ka,
    cta_label_en: input.cta_label_en || input.cta,
    price_explanation: input.price_explanation || null,
    price_explanation_ka: input.price_explanation_ka,
    price_explanation_en: input.price_explanation_en,
    icon_name: input.icon_name || null,
    updated_by: userId,
  };
}

function toLegacyDatabasePayload(input: ServicePackageInput, userId: string) {
  return {
    section: input.section,
    name: input.name_en || input.name,
    price: input.price,
    billing_label: input.billing_label_en || input.billing_label || null,
    description: input.description_en || input.description || null,
    ideal_for: input.ideal_for_en || input.ideal_for || null,
    features: input.features_en.length ? input.features_en : input.features,
    delivery_time: input.delivery_time_en || input.delivery_time || null,
    cta: input.cta_label_en || input.cta,
    highlighted: input.highlighted,
    custom_price: input.custom_price,
    price_explanation: input.price_explanation_en || input.price_explanation || null,
    icon_name: input.icon_name || null,
    display_order: input.display_order,
    published: input.published,
    updated_by: userId,
  };
}

const bilingualMigrationWarning =
  "Saved to legacy service fields only. Apply the latest Supabase migrations to enable Georgian and English package fields.";

function isMissingSchemaError(message: string) {
  return message.includes("schema cache") || message.includes("Could not find");
}

function actionError(operation: string, message: string) {
  console.error(`Service package ${operation} failed:`, message);
  if (isMissingSchemaError(message)) {
    return {
      error:
        "Package schema is missing bilingual fields. Apply the latest Supabase migrations, then try again.",
    };
  }
  return { error: `Package could not be ${operation}d. Please try again.` };
}

function revalidateServices() {
  revalidatePath("/");
  revalidatePath("/services");
  revalidatePath("/admin/services");
  updateTag("cms-services");
  updateTag("cms-stats");
}
