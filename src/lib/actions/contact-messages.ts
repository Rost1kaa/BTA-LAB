"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminMutation } from "@/lib/auth/admin";

export async function deleteContactMessage(messageId: string) {
  const admin = await requireAdminMutation("contact-messages:delete");
  if (!admin) return { error: "Unauthorized." };

  const idResult = z.string().uuid().safeParse(messageId);
  if (!idResult.success) return { error: "Invalid message." };

  const { error } = await admin.supabase
    .from("contact_messages")
    .delete()
    .eq("id", messageId);

  if (error) {
    console.error("Contact message delete failed:", error.message);
    return { error: "Message could not be deleted." };
  }

  revalidatePath("/admin/messages");
  return { success: true };
}
