"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAdminMutation } from "@/lib/auth/admin";
import { logSecurityEvent } from "@/lib/security/logging";
import { validateUploadedImage } from "@/lib/security/upload";
import { writeFile, mkdir, unlink, access } from "node:fs/promises";
import path from "node:path";
import type { TeamMember } from "@/types/supabase";

const httpUrl = z.string().url().refine((value) => {
  try {
    const protocol = new URL(value).protocol;
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}, "URL must use HTTP or HTTPS.");

const imageLocation = z.string().refine((value) => {
  if (!value || value.startsWith("/")) return true;
  return httpUrl.safeParse(value).success;
}, "Image must be a local path or an HTTP(S) URL.");

const memberSchema = z.object({
  name: z.string().min(1, "Name is required.").transform((v) => v.trim()),
  name_ka: z.string().default(""),
  name_en: z.string().default(""),
  position: z.string().default(""),
  position_ka: z.string().default(""),
  position_en: z.string().default(""),
  bio: z.string().default(""),
  bio_ka: z.string().default(""),
  bio_en: z.string().default(""),
  image: imageLocation.default(""),
  image_alt_ka: z.string().default(""),
  image_alt_en: z.string().default(""),
  socials: z.record(z.string(), httpUrl).default({}),
  display_order: z.number().int().default(0),
  published: z.boolean().default(true),
});

export type MemberInput = z.infer<typeof memberSchema>;

const TEAM_UPLOAD_DIR = "public/team";

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u10A0-\u10FF_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getExtensionFromMime(mimeType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  return map[mimeType] || "webp";
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("team_members")
    .select("*")
    .order("display_order")
    .order("created_at", { ascending: false });
  return (data || []) as unknown as TeamMember[];
}

export async function getPublishedTeamMembers(): Promise<TeamMember[]> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("team_members")
    .select("*")
    .eq("published", true)
    .order("display_order");
  return (data || []) as unknown as TeamMember[];
}

export async function getTeamMemberById(id: string): Promise<TeamMember | null> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("team_members")
    .select("*")
    .eq("id", id)
    .single();
  return data as unknown as TeamMember | null;
}

export async function createTeamMember(input: MemberInput) {
  const admin = await requireAdminMutation("team:create");
  if (!admin) return { error: "Unauthorized." };

  const parsed = memberSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Invalid input." };

  const { data, error } = await admin.supabase
    .from("team_members")
    .insert({ ...toMemberPayload(parsed.data), updated_by: admin.user.id } as never)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidateTeam();
  return { data };
}

export async function updateTeamMember(id: string, input: Partial<MemberInput>) {
  const admin = await requireAdminMutation("team:update");
  if (!admin) return { error: "Unauthorized." };

  const parsed = memberSchema.partial().safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Invalid input." };

  const { data, error } = await admin.supabase
    .from("team_members")
    .update({ ...toMemberPayload(parsed.data), updated_by: admin.user.id } as never)
    .eq("id", id)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidateTeam();
  return { data };
}

function toMemberPayload(input: Partial<MemberInput>) {
  return {
    ...input,
    name: input.name_en || input.name_ka || input.name || "",
    position: input.position_en || input.position_ka || input.position || "",
    bio: input.bio_en || input.bio || "",
    name_ka: input.name_ka || "",
    name_en: input.name_en || input.name || "",
    position_ka: input.position_ka || "",
    position_en: input.position_en || input.position || "",
    bio_ka: input.bio_ka || "",
    bio_en: input.bio_en || input.bio || "",
  };
}

export async function deleteTeamMember(id: string) {
  const admin = await requireAdminMutation("team:delete");
  if (!admin) return { error: "Unauthorized." };

  const { error } = await admin.supabase.from("team_members").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidateTeam();
  return { success: true };
}

export async function reorderTeamMembers(orderedIds: string[]) {
  const admin = await requireAdminMutation("team:reorder");
  if (!admin) return { error: "Unauthorized." };

  const results = await Promise.all(
    orderedIds.map((id, index) =>
      admin.supabase.from("team_members").update({ display_order: index } as never).eq("id", id)
    )
  );

  const errors = results.filter((r) => r.error);
  if (errors.length > 0) return { error: "Failed to reorder." };

  revalidateTeam();
  return { success: true };
}

export async function uploadTeamMemberImage(file: File): Promise<{ url?: string; error?: string }> {
  const admin = await requireAdminMutation("team:upload");
  if (!admin) return { error: "Unauthorized." };

  const validationError = await validateUploadedImage(file, 5 * 1024 * 1024);
  if (validationError) {
    logSecurityEvent({
      event: "upload_rejected",
      userId: admin.user.id,
      reason: validationError,
      route: "team:upload",
    });
    return { error: validationError };
  }

  const ext = getExtensionFromMime(file.type);
  const safeName = sanitizeFilename(file.name.replace(`.${file.name.split(".").pop()}`, ""));
  const timestamp = Date.now();
  const filename = `${safeName}-${timestamp}.${ext}`;
  const filePath = path.join(process.cwd(), TEAM_UPLOAD_DIR, filename);

  try {
    await mkdir(path.join(process.cwd(), TEAM_UPLOAD_DIR), { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);
    return { url: `/team/${filename}` };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to upload image.";
    return { error: message };
  }
}

export async function deleteTeamMemberImage(url: string) {
  const admin = await requireAdminMutation("team:image-delete");
  if (!admin) return { error: "Unauthorized." };

  const localPath = extractLocalPath(url);
  if (!localPath) return { error: "Invalid image URL." };

  try {
    await access(localPath);
    await unlink(localPath);
    return { success: true };
  } catch {
    return { success: true };
  }
}

function extractLocalPath(url: string): string | null {
  if (!url.startsWith("/team/")) return null;
  const filename = url.replace("/team/", "");
  if (filename.includes("..") || filename.includes("/")) return null;
  return path.join(process.cwd(), TEAM_UPLOAD_DIR, filename);
}

function revalidateTeam() {
  revalidatePath("/");
  revalidatePath("/team");
  revalidatePath("/admin/team");
  updateTag("cms-team");
  updateTag("cms-stats");
}
