"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminMutation } from "@/lib/auth/admin";

const statusSchema = z.enum(["new", "contacted", "in_progress", "completed", "cancelled"]);

export async function updateServiceRequestStatus(requestId: string, newStatus: string) {
  const admin = await requireAdminMutation("service-requests:update");
  if (!admin) return { error: "Unauthorized." };

  const idResult = z.string().uuid().safeParse(requestId);
  const statusResult = statusSchema.safeParse(newStatus);

  if (!idResult.success || !statusResult.success) {
    return { error: "Invalid request." };
  }

  const { error } = await admin.supabase
    .from("service_requests")
    .update({ status: statusResult.data } as never)
    .eq("id", requestId);

  if (error) {
    console.error("Service request status update failed:", error.message);
    return { error: "Status could not be updated." };
  }

  revalidatePath("/admin/service-requests");
  return { success: true };
}

export async function deleteServiceRequest(requestId: string) {
  const admin = await requireAdminMutation("service-requests:delete");
  if (!admin) return { error: "Unauthorized." };

  const idResult = z.string().uuid().safeParse(requestId);
  if (!idResult.success) return { error: "Invalid request." };

  const { error } = await admin.supabase
    .from("service_requests")
    .delete()
    .eq("id", requestId);

  if (error) {
    console.error("Service request delete failed:", error.message);
    return { error: "Request could not be deleted." };
  }

  revalidatePath("/admin/service-requests");
  return { success: true };
}
