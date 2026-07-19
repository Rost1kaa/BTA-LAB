"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAdminMutation } from "@/lib/auth/admin";
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
  role: z.string().default(""),
  role_ka: z.string().default(""),
  role_en: z.string().default(""),
  bio: z.string().default(""),
  bio_ka: z.string().default(""),
  bio_en: z.string().default(""),
  skills: z.array(z.string()).default([]),
  skills_ka: z.array(z.string()).default([]),
  skills_en: z.array(z.string()).default([]),
  image: imageLocation.default(""),
  image_alt_ka: z.string().default(""),
  image_alt_en: z.string().default(""),
  socials: z.record(z.string(), httpUrl).default({}),
  display_order: z.number().int().default(0),
  published: z.boolean().default(true),
});

export type MemberInput = z.infer<typeof memberSchema>;

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
    role: input.role_en || input.role || "",
    bio: input.bio_en || input.bio || "",
    skills: input.skills_en?.length ? input.skills_en : input.skills || [],
    name_ka: input.name_ka || "",
    name_en: input.name_en || input.name || "",
    role_ka: input.role_ka || "",
    role_en: input.role_en || input.role || "",
    bio_ka: input.bio_ka || "",
    bio_en: input.bio_en || input.bio || "",
    skills_ka: input.skills_ka || [],
    skills_en: input.skills_en?.length ? input.skills_en : input.skills || [],
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

function revalidateTeam() {
  revalidatePath("/");
  revalidatePath("/team");
  revalidatePath("/admin/team");
  updateTag("cms-team");
  updateTag("cms-stats");
}
