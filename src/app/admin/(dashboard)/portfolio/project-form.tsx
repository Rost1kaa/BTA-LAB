"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createProject, updateProject, uploadProjectImage } from "@/lib/actions/portfolio";
import { Save, ArrowLeft, Upload, X } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import Image from "next/image";
import type { PortfolioProject } from "@/types/supabase";
import { slugifyGeorgian } from "@/lib/georgian-slug";

const CATEGORIES = ["Web", "E-commerce", "Branding", "Marketing", "UI/UX"];

interface ProjectFormProps {
  project?: PortfolioProject;
  categories?: string[];
}

export function ProjectForm({ project, categories = CATEGORIES }: ProjectFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slugTouched, setSlugTouched] = useState(Boolean(project?.slug));

  const [form, setForm] = useState({
    title_ka: project?.title_ka || project?.title || "",
    title_en: project?.title_en || project?.title || "",
    slug: project?.slug || "",
    category: project?.category || "Web",
    category_label_ka: project?.category_label_ka || project?.category_label || "",
    category_label_en: project?.category_label_en || project?.category || "",
    description_ka: project?.description_ka || project?.description || "",
    description_en: project?.description_en || project?.description || "",
    full_description_ka: project?.full_description_ka || project?.full_description || "",
    full_description_en: project?.full_description_en || project?.full_description || "",
    problem_ka: project?.problem_ka || project?.problem || "",
    problem_en: project?.problem_en || project?.problem || "",
    solution_ka: project?.solution_ka || project?.solution || "",
    solution_en: project?.solution_en || project?.solution || "",
    results_ka: project?.results_ka?.join("\n") || project?.results?.join("\n") || "",
    results_en: project?.results_en?.join("\n") || project?.results?.join("\n") || "",
    technologies: project?.technologies?.join(", ") || "",
    cover_image: project?.cover_image || "",
    link: project?.link || "",
    featured: project?.featured || false,
    published: project?.published || false,
    display_order: project?.display_order ?? 0,
    alt_text_ka: project?.alt_text_ka || project?.alt_text || "",
    alt_text_en: project?.alt_text_en || project?.alt_text || "",
    seo_title_ka: project?.seo_title_ka || project?.seo_title || "",
    seo_title_en: project?.seo_title_en || project?.seo_title || "",
    seo_description_ka: project?.seo_description_ka || project?.seo_description || "",
    seo_description_en: project?.seo_description_en || project?.seo_description || "",
  });

  function updateField(field: string, value: string | boolean | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadProjectImage(file);
      if (result.error) {
        toast.error(result.error);
      } else if (result.url) {
        updateField("cover_image", result.url);
        toast.success("Image uploaded!");
      }
    } catch {
      toast.error("Failed to upload image.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    // Client-side validation
    const newErrors: Record<string, string> = {};
    if (!form.title_ka.trim() && !form.title_en.trim()) newErrors.title = "Enter at least one title.";
    if (!form.slug.trim()) newErrors.slug = "Slug is required.";
    else if (!/^[a-z0-9-]+$/.test(form.slug))
      newErrors.slug = "Slug must contain only lowercase letters, numbers, and hyphens.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSaving(false);
      return;
    }

    const input = {
      title: form.title_en.trim() || form.title_ka.trim(),
      title_ka: form.title_ka.trim(),
      title_en: form.title_en.trim(),
      slug: form.slug.trim(),
      category: form.category,
      category_label_ka: form.category_label_ka.trim(),
      category_label_en: form.category_label_en.trim() || form.category,
      description: form.description_en.trim(),
      description_ka: form.description_ka.trim(),
      description_en: form.description_en.trim(),
      full_description: form.full_description_en.trim(),
      full_description_ka: form.full_description_ka.trim(),
      full_description_en: form.full_description_en.trim(),
      problem: form.problem_en.trim(),
      problem_ka: form.problem_ka.trim(),
      problem_en: form.problem_en.trim(),
      solution: form.solution_en.trim(),
      solution_ka: form.solution_ka.trim(),
      solution_en: form.solution_en.trim(),
      results: form.results_en.split("\n").filter((r) => r.trim()).map((r) => r.trim()),
      results_ka: form.results_ka.split("\n").filter((r) => r.trim()).map((r) => r.trim()),
      results_en: form.results_en.split("\n").filter((r) => r.trim()).map((r) => r.trim()),
      technologies: form.technologies.split(",").filter((t) => t.trim()).map((t) => t.trim()),
      cover_image: form.cover_image,
      gallery: project?.gallery || [],
      link: form.link.trim(),
      featured: form.featured,
      published: form.published,
      display_order: form.display_order,
      alt_text: form.alt_text_en.trim(),
      alt_text_ka: form.alt_text_ka.trim(),
      alt_text_en: form.alt_text_en.trim(),
      seo_title: form.seo_title_en.trim(),
      seo_title_ka: form.seo_title_ka.trim(),
      seo_title_en: form.seo_title_en.trim(),
      seo_description: form.seo_description_en.trim(),
      seo_description_ka: form.seo_description_ka.trim(),
      seo_description_en: form.seo_description_en.trim(),
    };

    try {
      let result;
      if (project) {
        result = await updateProject(project.id, input);
      } else {
        result = await createProject(input);
      }

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(project ? "Project updated!" : "Project created!");
        router.push("/admin/portfolio");
        router.refresh();
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {/* Title & Slug */}
      <div className="rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] p-6 space-y-5">
        <h2 className="text-sm font-semibold text-[var(--color-fg-primary)]">Basic Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="project-title-ka" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">
              Georgian Title *
            </label>
            <input
              id="project-title-ka"
              name="title_ka"
              type="text"
              value={form.title_ka}
              onChange={(e) => {
                updateField("title_ka", e.target.value);
                if (!slugTouched) updateField("slug", slugifyGeorgian(e.target.value));
              }}
              className={`w-full h-11 px-4 bg-[var(--color-overlay)] border rounded-xl text-sm text-[var(--color-fg-primary)] focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 transition-all ${errors.title ? "border-red-500/50" : "border-[var(--color-border-primary)]"}`}
              placeholder="პროექტის სათაური"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="project-title-en" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">
              English Title *
            </label>
            <input
              id="project-title-en"
              name="title_en"
              type="text"
              value={form.title_en}
              onChange={(e) => updateField("title_en", e.target.value)}
              className={`w-full h-11 px-4 bg-[var(--color-overlay)] border rounded-xl text-sm text-[var(--color-fg-primary)] focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 transition-all ${errors.title ? "border-red-500/50" : "border-[var(--color-border-primary)]"}`}
              placeholder="Project title"
            />
          </div>
          {errors.title && <p className="md:col-span-2 text-xs text-red-500">{errors.title}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="project-slug" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">
            Slug *
          </label>
          <input
            id="project-slug"
            name="slug"
            type="text"
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              updateField("slug", e.target.value);
            }}
            className={`w-full h-11 px-4 bg-[var(--color-overlay)] border rounded-xl text-sm text-[var(--color-fg-primary)] focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 transition-all font-mono ${errors.slug ? "border-red-500/50" : "border-[var(--color-border-primary)]"}`}
            placeholder="my-project-slug"
          />
          {errors.slug && <p className="text-xs text-red-500">{errors.slug}</p>}
          <p className="text-xs text-[var(--color-fg-tertiary)]/50">Lowercase letters, numbers, and hyphens only.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="project-category" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">
              Category
            </label>
            <select
              id="project-category"
              name="category"
              value={form.category}
              onChange={(e) => updateField("category", e.target.value)}
              className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus:outline-none appearance-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="project-display-order" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">
              Display Order
            </label>
            <input
              id="project-display-order"
              name="display_order"
              type="number"
              value={form.display_order}
              onChange={(e) => updateField("display_order", parseInt(e.target.value) || 0)}
              className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="project-category-label-ka" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">
              Georgian Category Label
            </label>
            <input
              id="project-category-label-ka"
              type="text"
              value={form.category_label_ka}
              onChange={(e) => updateField("category_label_ka", e.target.value)}
              className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="project-category-label-en" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">
              English Category Label
            </label>
            <input
              id="project-category-label-en"
              type="text"
              value={form.category_label_en}
              onChange={(e) => updateField("category_label_en", e.target.value)}
              className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] p-6 space-y-5">
        <h2 className="text-sm font-semibold text-[var(--color-fg-primary)]">Description</h2>

        <BilingualTextarea
          id="project-description"
          label="Short Description"
          kaValue={form.description_ka}
          enValue={form.description_en}
          onKaChange={(value) => updateField("description_ka", value)}
          onEnChange={(value) => updateField("description_en", value)}
          rows={3}
        />

        <BilingualTextarea
          id="project-full-description"
          label="Full Description"
          kaValue={form.full_description_ka}
          enValue={form.full_description_en}
          onKaChange={(value) => updateField("full_description_ka", value)}
          onEnChange={(value) => updateField("full_description_en", value)}
          rows={5}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <BilingualTextarea
              id="project-problem"
              label="Problem"
              kaValue={form.problem_ka}
              enValue={form.problem_en}
              onKaChange={(value) => updateField("problem_ka", value)}
              onEnChange={(value) => updateField("problem_en", value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <BilingualTextarea
              id="project-solution"
              label="Solution"
              kaValue={form.solution_ka}
              enValue={form.solution_en}
              onKaChange={(value) => updateField("solution_ka", value)}
              onEnChange={(value) => updateField("solution_en", value)}
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Results & Technologies */}
      <div className="rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] p-6 space-y-5">
        <h2 className="text-sm font-semibold text-[var(--color-fg-primary)]">Results & Technologies</h2>

        <BilingualTextarea
          id="project-results"
          label="Results (one per line)"
          kaValue={form.results_ka}
          enValue={form.results_en}
          onKaChange={(value) => updateField("results_ka", value)}
          onEnChange={(value) => updateField("results_en", value)}
          rows={4}
          mono
        />

        <div className="space-y-2">
          <label htmlFor="project-technologies" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">
            Technologies (comma separated)
          </label>
          <input
            id="project-technologies"
            name="technologies"
            type="text"
            value={form.technologies}
            onChange={(e) => updateField("technologies", e.target.value)}
            className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 transition-all font-mono"
            placeholder="Next.js, Node.js, PostgreSQL, Stripe"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="project-live-url" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">
            Live URL
          </label>
          <input
            id="project-live-url"
            name="link"
            type="url"
            value={form.link}
            onChange={(e) => updateField("link", e.target.value)}
            className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 transition-all"
            placeholder="https://example.com"
          />
        </div>
      </div>

      {/* Cover Image */}
      <div className="rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] p-6 space-y-5">
        <h2 className="text-sm font-semibold text-[var(--color-fg-primary)]">Cover Image</h2>

        <div className="space-y-4">
          {/* Upload area */}
          <div className="relative flex items-center justify-center h-48 rounded-xl border-2 border-dashed border-[var(--color-border-primary)] bg-[var(--color-overlay)] hover:border-[var(--color-fg-tertiary)]/30 transition-colors overflow-hidden focus-within:ring-2 focus-within:ring-[var(--color-fg-tertiary)]/30">
            <label htmlFor="project-cover-upload" className="absolute inset-0 cursor-pointer">
              {form.cover_image ? (
                <Image
                  src={form.cover_image}
                  alt="Cover preview"
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="h-full flex items-center justify-center text-center">
                  {uploading ? (
                    <span className="flex flex-col items-center gap-2">
                      <span className="animate-spin h-8 w-8 border-2 border-[var(--color-fg-tertiary)] border-t-transparent rounded-full" />
                      <span className="text-xs text-[var(--color-fg-tertiary)]/70">Uploading…</span>
                    </span>
                  ) : (
                    <span>
                      <Upload size={24} aria-hidden="true" className="mx-auto mb-2 text-[var(--color-fg-tertiary)]/50" />
                      <span className="block text-sm text-[var(--color-fg-tertiary)]/70">Choose an Image</span>
                      <span className="block text-xs text-[var(--color-fg-tertiary)]/50 mt-1">WebP, PNG, or JPEG up to 5 MB</span>
                    </span>
                  )}
                </span>
              )}
            </label>
            {form.cover_image && (
              <button
                type="button"
                onClick={() => updateField("cover_image", "")}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Remove image"
              >
                <X size={14} aria-hidden="true" />
              </button>
            )}
          </div>

          <input
            id="project-cover-upload"
            ref={fileInputRef}
            type="file"
            accept="image/webp,image/png,image/jpeg"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />

          <BilingualTextInput
            id="project-alt-text"
            label="Alt Text"
            kaValue={form.alt_text_ka}
            enValue={form.alt_text_en}
            onKaChange={(value) => updateField("alt_text_ka", value)}
            onEnChange={(value) => updateField("alt_text_en", value)}
          />
        </div>
      </div>

      {/* SEO */}
      <div className="rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] p-6 space-y-5">
        <h2 className="text-sm font-semibold text-[var(--color-fg-primary)]">SEO</h2>

        <BilingualTextInput
          id="project-seo-title"
          label="SEO Title"
          kaValue={form.seo_title_ka}
          enValue={form.seo_title_en}
          onKaChange={(value) => updateField("seo_title_ka", value)}
          onEnChange={(value) => updateField("seo_title_en", value)}
        />

        <BilingualTextarea
          id="project-seo-description"
          label="SEO Description"
          kaValue={form.seo_description_ka}
          enValue={form.seo_description_en}
          onKaChange={(value) => updateField("seo_description_ka", value)}
          onEnChange={(value) => updateField("seo_description_en", value)}
          rows={2}
        />
      </div>

      {/* Status */}
      <div className="rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] p-6">
        <h2 className="text-sm font-semibold text-[var(--color-fg-primary)] mb-4">Status</h2>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              name="published"
              type="checkbox"
              checked={form.published}
              onChange={(e) => updateField("published", e.target.checked)}
              className="w-4 h-4 rounded border-[var(--color-border-primary)] text-[var(--color-accent)] focus:ring-0"
            />
            <div>
              <p className="text-sm font-medium text-[var(--color-fg-primary)]">Published</p>
              <p className="text-xs text-[var(--color-fg-tertiary)]/70">Visible on the public website</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              name="featured"
              type="checkbox"
              checked={form.featured}
              onChange={(e) => updateField("featured", e.target.checked)}
              className="w-4 h-4 rounded border-[var(--color-border-primary)] text-[var(--color-accent)] focus:ring-0"
            />
            <div>
              <p className="text-sm font-medium text-[var(--color-fg-primary)]">Featured</p>
              <p className="text-xs text-[var(--color-fg-tertiary)]/70">Show on the homepage</p>
            </div>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4">
        <Link
          href="/admin/portfolio"
          className="inline-flex items-center gap-2 h-11 px-5 bg-[var(--color-overlay)] text-[var(--color-fg-primary)] font-medium rounded-xl hover:bg-[var(--color-border-primary)] transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          Cancel
        </Link>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 h-11 px-5 bg-[var(--color-accent)] text-[var(--color-accent-foreground)] font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
        >
          {saving ? (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <Save size={16} />
          )}
          {saving ? "Saving..." : project ? "Update Project" : "Create Project"}
        </button>
      </div>
    </form>
  );
}

function FieldLocaleLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--color-fg-tertiary)]/50">
      {children}
    </span>
  );
}

function BilingualTextInput({
  id,
  label,
  kaValue,
  enValue,
  onKaChange,
  onEnChange,
}: {
  id: string;
  label: string;
  kaValue: string;
  enValue: string;
  onKaChange: (value: string) => void;
  onEnChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={`${id}-ka`} className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">
        {label}
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <FieldLocaleLabel>Georgian</FieldLocaleLabel>
          <input
            id={`${id}-ka`}
            type="text"
            value={kaValue}
            onChange={(event) => onKaChange(event.target.value)}
            className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 transition-all"
          />
        </div>
        <div className="space-y-1">
          <FieldLocaleLabel>English</FieldLocaleLabel>
          <input
            id={`${id}-en`}
            type="text"
            value={enValue}
            onChange={(event) => onEnChange(event.target.value)}
            className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 transition-all"
          />
        </div>
      </div>
    </div>
  );
}

function BilingualTextarea({
  id,
  label,
  kaValue,
  enValue,
  onKaChange,
  onEnChange,
  rows,
  mono = false,
}: {
  id: string;
  label: string;
  kaValue: string;
  enValue: string;
  onKaChange: (value: string) => void;
  onEnChange: (value: string) => void;
  rows: number;
  mono?: boolean;
}) {
  const className = `w-full px-4 py-3 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 transition-all resize-none ${mono ? "font-mono" : ""}`;

  return (
    <div className="space-y-2">
      <label htmlFor={`${id}-ka`} className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">
        {label}
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <FieldLocaleLabel>Georgian</FieldLocaleLabel>
          <textarea
            id={`${id}-ka`}
            value={kaValue}
            onChange={(event) => onKaChange(event.target.value)}
            rows={rows}
            className={className}
          />
        </div>
        <div className="space-y-1">
          <FieldLocaleLabel>English</FieldLocaleLabel>
          <textarea
            id={`${id}-en`}
            value={enValue}
            onChange={(event) => onEnChange(event.target.value)}
            rows={rows}
            className={className}
          />
        </div>
      </div>
    </div>
  );
}
