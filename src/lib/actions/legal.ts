"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAdminMutation } from "@/lib/auth/admin";

export type LegalPolicyType = "PRIVACY_POLICY" | "COOKIE_POLICY";

const legalPolicyUpdateSchema = z.object({
  type: z.enum(["PRIVACY_POLICY", "COOKIE_POLICY"]),
  title_ka: z.string().optional().default(""),
  title_en: z.string().optional().default(""),
  description_ka: z.string().optional().default(""),
  description_en: z.string().optional().default(""),
  content_ka: z.string().optional().default(""),
  content_en: z.string().optional().default(""),
});

export type LegalPolicyUpdateInput = z.infer<typeof legalPolicyUpdateSchema>;

/**
 * Fetch a legal policy by type.
 * Returns null if not found (should not happen after seeding).
 */
export async function getLegalPolicy(type: LegalPolicyType) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("legal_policies")
    .select("*")
    .eq("type", type)
    .maybeSingle();

  if (error) {
    console.error(`Failed to fetch legal policy ${type}:`, error.message);
    return null;
  }

  return data as {
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
  } | null;
}

/**
 * Update a legal policy. Requires admin privileges.
 */
export async function updateLegalPolicy(input: LegalPolicyUpdateInput) {
  const admin = await requireAdminMutation("legal:update");
  if (!admin) return { error: "Unauthorized." };

  const parsed = legalPolicyUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input." };
  }

  const { data, error } = await admin.supabase
    .from("legal_policies")
    .upsert(
      {
        type: parsed.data.type,
        title_ka: parsed.data.title_ka.trim(),
        title_en: parsed.data.title_en.trim(),
        description_ka: parsed.data.description_ka.trim(),
        description_en: parsed.data.description_en.trim(),
        content_ka: parsed.data.content_ka.trim(),
        content_en: parsed.data.content_en.trim(),
      } as never,
      { onConflict: "type", ignoreDuplicates: false } as never
    )
    .select()
    .single();

  if (error) return { error: error.message };

  // Revalidate public pages and admin
  revalidatePath("/privacy");
  revalidatePath("/cookies");
  revalidatePath("/admin/legal");
  revalidateTag("cms-legal", { expire: 0 });

  return { data };
}
