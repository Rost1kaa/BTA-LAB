"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminMutation } from "@/lib/auth/admin";
import { getSiteUrl } from "@/lib/site-url";

const fullNameSchema = z.string().trim().min(1).max(200);
const idSchema = z.string().uuid();

interface CreatedInvitation {
  id: string;
  full_name: string;
  token: string;
  status: "pending" | "submitted";
  is_viewed: boolean;
  created_at: string;
  submitted_at: string | null;
}

/**
 * Create a one-time questionnaire invitation link for the given full name.
 * Returns the secure link and the created invitation.
 */
export async function createQuestionnaireInvitation(
  fullName: string
): Promise<{ success: false; error: string } | { success: true; invitation: CreatedInvitation; link: string }> {
  const admin = await requireAdminMutation("questionnaire:create");
  if (!admin) return { success: false, error: "Unauthorized." };

  const nameResult = fullNameSchema.safeParse(fullName);
  if (!nameResult.success) {
    return { success: false, error: "გთხოვთ, შეიყვანოთ სახელი და გვარი." };
  }

  const token = randomBytes(32).toString("base64url");

  const { data, error } = (await admin.supabase
    .from("questionnaire_invitations")
    .insert({ full_name: nameResult.data, token } as never)
    .select("id, full_name, token, status, is_viewed, created_at, submitted_at")
    .single()) as unknown as {
    data: CreatedInvitation | null;
    error: unknown;
  };

  if (error || !data) {
    console.error(
      "Questionnaire invitation creation failed:",
      error instanceof Error ? error.message : error
    );
    return { success: false, error: "ლინკის შექმნა ვერ მოხერხდა." };
  }

  revalidatePath("/admin/questionnaires");

  return {
    success: true,
    invitation: data,
    link: `${getSiteUrl()}/questionnaire/${data.token}`,
  };
}

/**
 * Permanently delete a questionnaire invitation.
 * Works for completed and uncompleted questionnaires alike; answers are
 * stored on the invitation row itself, so no orphaned records are possible.
 */
export async function deleteQuestionnaireInvitation(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const admin = await requireAdminMutation("questionnaire:delete");
  if (!admin) return { success: false, error: "Unauthorized." };

  const idResult = idSchema.safeParse(id);
  if (!idResult.success) {
    return { success: false, error: "Invalid request." };
  }

  const { error } = (await admin.supabase
    .from("questionnaire_invitations")
    .delete()
    .eq("id", id)) as unknown as { error: unknown };

  if (error) {
    console.error(
      "Questionnaire invitation deletion failed:",
      error instanceof Error ? error.message : error
    );
    return { success: false, error: "წაშლა ვერ მოხერხდა." };
  }

  revalidatePath("/admin/questionnaires");
  return { success: true };
}

/**
 * Mark an invitation as viewed (ნანახი) or unviewed (უნახავი).
 * Only the administrator's viewed state changes — never the answers,
 * the token, or the completion state.
 */
export async function setQuestionnaireInvitationViewed(
  id: string,
  viewed: boolean
): Promise<{ success: boolean; error?: string }> {
  const admin = await requireAdminMutation("questionnaire:set-viewed");
  if (!admin) return { success: false, error: "Unauthorized." };

  const idResult = idSchema.safeParse(id);
  const viewedResult = z.boolean().safeParse(viewed);
  if (!idResult.success || !viewedResult.success) {
    return { success: false, error: "Invalid request." };
  }

  const { error } = (await admin.supabase
    .from("questionnaire_invitations")
    .update({
      is_viewed: viewedResult.data,
      viewed_at: viewedResult.data ? new Date().toISOString() : null,
    } as never)
    .eq("id", id)) as unknown as { error: unknown };

  if (error) {
    console.error(
      "Questionnaire invitation viewed update failed:",
      error instanceof Error ? error.message : error
    );
    return { success: false, error: "სტატუსის განახლება ვერ მოხერხდა." };
  }

  revalidatePath("/admin/questionnaires");
  return { success: true };
}
