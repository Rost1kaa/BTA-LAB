"use server";

import { revalidatePath, updateTag } from "next/cache";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin, requireAdminMutation } from "@/lib/auth/admin";
import { logSecurityEvent } from "@/lib/security/logging";
import { validateUploadedImage } from "@/lib/security/upload";
import type { PortfolioProject } from "@/types/supabase";
import { slugifyGeorgian } from "@/lib/georgian-slug";

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

const projectSchema = z.object({
  title: z.string().default("").transform((v) => v.trim()),
  title_ka: z.string().default("").transform((v) => v.trim()),
  title_en: z.string().default("").transform((v) => v.trim()),
  slug: z
    .string()
    .regex(/^[a-z0-9-]*$/, "Slug must contain only lowercase letters, numbers, and hyphens.")
    .default("")
    .transform((v) => v.trim()),
  category: z.string().min(1, "Category is required."),
  category_label_ka: z.string().default(""),
  category_label_en: z.string().default(""),
  description: z.string().default(""),
  description_ka: z.string().default(""),
  description_en: z.string().default(""),
  full_description: z.string().default(""),
  full_description_ka: z.string().default(""),
  full_description_en: z.string().default(""),
  problem: z.string().default(""),
  problem_ka: z.string().default(""),
  problem_en: z.string().default(""),
  solution: z.string().default(""),
  solution_ka: z.string().default(""),
  solution_en: z.string().default(""),
  results: z.array(z.string()).default([]),
  results_ka: z.array(z.string()).default([]),
  results_en: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
  cover_image: imageLocation.default(""),
  gallery: z.array(imageLocation).max(30).default([]),
  link: httpUrl.or(z.literal("")).default(""),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  display_order: z.number().int().default(0),
  alt_text: z.string().default(""),
  alt_text_ka: z.string().default(""),
  alt_text_en: z.string().default(""),
  seo_title: z.string().default(""),
  seo_title_ka: z.string().default(""),
  seo_title_en: z.string().default(""),
  seo_description: z.string().default(""),
  seo_description_ka: z.string().default(""),
  seo_description_en: z.string().default(""),
});

export type ProjectInput = z.infer<typeof projectSchema>;

function normalizeProjectPayload(input: Partial<ProjectInput>): Partial<ProjectInput> & { slug: string } {
  const titleKa = input.title_ka?.trim() || "";
  const titleEn = input.title_en?.trim() || input.title?.trim() || "";
  const title = titleEn || titleKa;
  const slug = input.slug?.trim() || slugifyGeorgian(titleKa || titleEn || title);

  return {
    ...input,
    title,
    title_ka: titleKa,
    title_en: titleEn,
    slug,
    category_label_ka: input.category_label_ka?.trim() || "",
    category_label_en: input.category_label_en?.trim() || input.category || "",
    description: input.description_en?.trim() || input.description?.trim() || "",
    full_description: input.full_description_en?.trim() || input.full_description?.trim() || "",
    problem: input.problem_en?.trim() || input.problem?.trim() || "",
    solution: input.solution_en?.trim() || input.solution?.trim() || "",
    results: input.results_en?.length ? input.results_en : input.results || [],
    alt_text: input.alt_text_en?.trim() || input.alt_text?.trim() || "",
    seo_title: input.seo_title_en?.trim() || input.seo_title?.trim() || "",
    seo_description: input.seo_description_en?.trim() || input.seo_description?.trim() || "",
  };
}

export async function getPortfolioProjects(): Promise<PortfolioProject[]> {
  const admin = await requireAdmin({ redirectToLogin: false });
  if (!admin) return [];
  const { data, error } = await admin.supabase
    .from("portfolio_projects")
    .select("*")
    .order("display_order")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []) as unknown as PortfolioProject[];
}

export async function getPublishedProjects(): Promise<PortfolioProject[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("portfolio_projects")
    .select("*")
    .eq("published", true)
    .order("display_order")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []) as unknown as PortfolioProject[];
}

export async function getFeaturedProjects(): Promise<PortfolioProject[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("portfolio_projects")
    .select("*")
    .eq("featured", true)
    .eq("published", true)
    .order("display_order")
    .limit(6);

  if (error) throw new Error(error.message);
  return (data || []) as unknown as PortfolioProject[];
}

export async function getProjectBySlug(slug: string): Promise<PortfolioProject | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("portfolio_projects")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) return null;
  return data as unknown as PortfolioProject | null;
}

export async function getProjectById(id: string): Promise<PortfolioProject | null> {
  const admin = await requireAdmin({ redirectToLogin: false });
  if (!admin) return null;
  const { data, error } = await admin.supabase
    .from("portfolio_projects")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as unknown as PortfolioProject | null;
}

export async function createProject(input: ProjectInput) {
  const admin = await requireAdminMutation("portfolio:create");
  if (!admin) return { error: "Unauthorized." };

  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input.", fieldErrors: parsed.error.issues };
  }
  const payload = normalizeProjectPayload(parsed.data);
  if (!payload.title_ka && !payload.title_en) {
    return { error: "Enter at least one project title." };
  }
  if (!payload.slug) {
    return { error: "Slug could not be generated. Enter a slug manually." };
  }

  const { data: existing } = await admin.supabase
    .from("portfolio_projects")
    .select("id")
    .eq("slug", payload.slug)
    .maybeSingle();
  if (existing) return { error: "A project with this slug already exists." };

  const { data, error } = await admin.supabase
    .from("portfolio_projects")
    .insert({
      ...payload,
      link: payload.link || null,
      created_by: admin.user.id,
      updated_by: admin.user.id,
    } as never)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePortfolio();

  return { data };
}

export async function updateProject(id: string, input: Partial<ProjectInput>) {
  const admin = await requireAdminMutation("portfolio:update");
  if (!admin) return { error: "Unauthorized." };
  if (!z.string().uuid().safeParse(id).success) return { error: "Invalid project identifier." };

  const parsed = projectSchema.partial().safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Invalid input." };
  const payload = normalizeProjectPayload(parsed.data);

  if (payload.slug) {
    const { data: existing } = await admin.supabase
      .from("portfolio_projects")
      .select("id")
      .eq("slug", payload.slug)
      .maybeSingle();
    const existingProject = existing as unknown as { id: string } | null;
    if (existingProject && existingProject.id !== id) {
      return { error: "A project with this slug already exists." };
    }
  }

  const { data: previous } = await admin.supabase
    .from("portfolio_projects")
    .select("cover_image, slug")
    .eq("id", id)
    .maybeSingle();

  const { data, error } = await admin.supabase
    .from("portfolio_projects")
    .update({
      ...payload,
      link: payload.link || null,
      updated_by: admin.user.id,
    } as never)
    .eq("id", id)
    .select()
    .single();

  if (error) return { error: error.message };

  const previousProject = previous as { cover_image: string; slug: string } | null;
  if (
    previousProject?.cover_image &&
    payload.cover_image !== undefined &&
    payload.cover_image !== previousProject.cover_image
  ) {
    const oldPath = extractStoragePath(previousProject.cover_image);
    if (oldPath) {
      const { error: cleanupError } = await admin.supabase.storage
        .from("portfolio-images")
        .remove([oldPath]);
      if (cleanupError) {
        console.error("Replaced portfolio image cleanup failed:", cleanupError.message);
      }
    }
  }

  revalidatePortfolio();
  revalidatePath(`/portfolio/${payload.slug || (data as Record<string, string> | null)?.slug || id}`);
  if (previousProject?.slug && previousProject.slug !== payload.slug) {
    revalidatePath(`/portfolio/${previousProject.slug}`);
  }

  return { data };
}

export async function deleteProject(id: string) {
  const admin = await requireAdminMutation("portfolio:delete");
  if (!admin) return { error: "Unauthorized." };
  if (!z.string().uuid().safeParse(id).success) return { error: "Invalid project identifier." };

  const { data: project } = await admin.supabase
    .from("portfolio_projects")
    .select("cover_image")
    .eq("id", id)
    .maybeSingle();

  const { error } = await admin.supabase.from("portfolio_projects").delete().eq("id", id);

  if (error) return { error: error.message };

  const storedProject = project as { cover_image?: string } | null;
  if (storedProject?.cover_image) {
    const path = extractStoragePath(storedProject.cover_image);
    if (path) {
      const { error: cleanupError } = await admin.supabase.storage.from("portfolio-images").remove([path]);
      if (cleanupError) console.error("Deleted project image cleanup failed:", cleanupError.message);
    }
  }

  revalidatePortfolio();

  return { success: true };
}

export async function reorderProjects(orderedIds: string[]) {
  const admin = await requireAdminMutation("portfolio:reorder");
  if (!admin) return { error: "Unauthorized." };
  if (!z.array(z.string().uuid()).max(500).safeParse(orderedIds).success) {
    return { error: "Invalid project order." };
  }

  const updates = orderedIds.map((id, index) =>
    admin.supabase.from("portfolio_projects").update({ display_order: index } as never).eq("id", id)
  );

  const results = await Promise.all(updates);
  const errors = results.filter((r) => r.error);
  if (errors.length > 0) return { error: "Failed to reorder some projects." };

  revalidatePortfolio();

  return { success: true };
}

export async function uploadProjectImage(file: File): Promise<{ url?: string; error?: string }> {
  const admin = await requireAdminMutation("portfolio:upload");
  if (!admin) return { error: "Unauthorized." };

  const validationError = await validateUploadedImage(file, 5 * 1024 * 1024);
  if (validationError) {
    logSecurityEvent({
      event: "upload_rejected",
      userId: admin.user.id,
      reason: validationError,
      route: "portfolio:upload",
    });
    return { error: validationError };
  }

  const originalExtension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const normalizedExtension = file.type === "image/jpeg" ? "jpg" : originalExtension;
  const filePath = `projects/${admin.user.id}/${randomUUID()}.${normalizedExtension}`;

  const { error: uploadError } = await admin.supabase.storage
    .from("portfolio-images")
    .upload(filePath, file, { cacheControl: "3600", upsert: false });

  if (uploadError) return { error: uploadError.message };

  const { data: urlData } = admin.supabase.storage.from("portfolio-images").getPublicUrl(filePath);
  return { url: urlData.publicUrl };
}

export async function deleteProjectImage(url: string) {
  const admin = await requireAdminMutation("portfolio:image-delete");
  if (!admin) return { error: "Unauthorized." };

  const path = extractStoragePath(url);
  if (!path) return { error: "Invalid image URL." };

  const { error } = await admin.supabase.storage.from("portfolio-images").remove([path]);
  if (error) return { error: error.message };

  return { success: true };
}

export async function getPortfolioCategories() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("portfolio_categories").select("*").order("sort_order");
  return (data || []) as Record<string, unknown>[];
}

function extractStoragePath(url: string): string | null {
  try {
    const u = new URL(url);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl || u.origin !== new URL(supabaseUrl).origin) return null;
    const prefix = "/storage/v1/object/public/portfolio-images/";
    if (!u.pathname.startsWith(prefix)) return null;
    const path = decodeURIComponent(u.pathname.slice(prefix.length));
    return path && !path.includes("..") ? path : null;
  } catch {
    return null;
  }
}

function revalidatePortfolio() {
  revalidatePath("/");
  revalidatePath("/portfolio");
  revalidatePath("/admin/portfolio");
  updateTag("cms-projects");
}
