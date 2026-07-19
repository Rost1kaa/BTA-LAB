"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteProject } from "@/lib/actions/portfolio";
import {
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  ExternalLink,
} from "lucide-react";
import type { PortfolioProject } from "@/types/supabase";
import toast from "react-hot-toast";

interface PortfolioListProps {
  projects: PortfolioProject[];
  categories: string[];
}

export function PortfolioList({ projects, categories }: PortfolioListProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft">("all");
  const [filterFeatured, setFilterFeatured] = useState<"all" | "featured">("all");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = projects.filter((p) => {
    const matchesSearch = search === "" || 
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === "all" || p.category === filterCategory;
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "published" ? p.published : !p.published);
    const matchesFeatured = filterFeatured === "all" || p.featured;
    return matchesSearch && matchesCategory && matchesStatus && matchesFeatured;
  });

  async function handleDelete(id: string) {
    setDeleting(true);
    try {
      const result = await deleteProject(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Project deleted.");
        setDeleteConfirm(null);
        router.refresh();
      }
    } catch {
      toast.error("Failed to delete project.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      {/* Filters */}
      <div className="rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-fg-tertiary)]/50" />
            <input
              aria-label="Search projects"
              name="project-search"
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] placeholder:text-[var(--color-fg-tertiary)]/30 focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 transition-all"
            />
          </div>

          {/* Category filter */}
          <select
            aria-label="Filter projects by category"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="h-10 px-3 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Status filter */}
          <select
            aria-label="Filter projects by publication status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as "all" | "published" | "draft")}
            className="h-10 px-3 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          {/* Featured filter */}
          <select
            aria-label="Filter featured projects"
            value={filterFeatured}
            onChange={(e) => setFilterFeatured(e.target.value as "all" | "featured")}
            className="h-10 px-3 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus:outline-none"
          >
            <option value="all">All Projects</option>
            <option value="featured">Featured Only</option>
          </select>
        </div>
      </div>

      {/* Project count */}
      <p className="text-xs text-[var(--color-fg-tertiary)]/70 mb-4">
        {filtered.length} of {projects.length} projects
      </p>

      {/* Table */}
      <div className="rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border-primary)] bg-[var(--color-overlay)]">
                <th className="text-left px-4 py-3 text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">Title</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider hidden md:table-cell">Category</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider hidden sm:table-cell">Status</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider hidden sm:table-cell">Featured</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider hidden md:table-cell">Order</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-primary)]">
              {filtered.map((project) => (
                <tr key={project.id} className="hover:bg-[var(--color-overlay)]/50 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-[var(--color-fg-primary)]">{project.title}</p>
                      <p className="text-xs text-[var(--color-fg-tertiary)]/50 mt-0.5">{project.slug}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-overlay)] text-[var(--color-fg-tertiary)]/70">
                      {project.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell">
                    {project.published ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-500">
                        <Eye size={12} />
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-500">
                        <EyeOff size={12} />
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell">
                    {project.featured ? (
                      <Star size={14} className="inline text-amber-500 fill-amber-500" />
                    ) : (
                      <span className="text-xs text-[var(--color-fg-tertiary)]/50">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right hidden md:table-cell">
                    <span className="text-xs text-[var(--color-fg-tertiary)]/70">{project.display_order}</span>
                  </td>
                  <td className="relative px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/portfolio/${project.id}/edit`}
                        className="p-2 rounded-lg text-[var(--color-fg-tertiary)]/50 hover:text-[var(--color-fg-primary)] hover:bg-[var(--color-overlay)] transition-all"
                        aria-label={`Edit ${project.title}`}
                      >
                        <Edit size={14} />
                      </Link>
                      {project.link && (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg text-[var(--color-fg-tertiary)]/50 hover:text-[var(--color-fg-primary)] hover:bg-[var(--color-overlay)] transition-all"
                          aria-label={`Visit ${project.title}`}
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                      <button
                        onClick={() => setDeleteConfirm(deleteConfirm === project.id ? null : project.id)}
                        className="p-2 rounded-lg text-[var(--color-fg-tertiary)]/50 hover:text-red-500 hover:bg-red-500/10 transition-all"
                        aria-label={`Delete ${project.title}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Delete confirmation */}
                    {deleteConfirm === project.id && (
                      <div className="absolute right-0 mt-2 p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-red-500/20 shadow-lg z-10 min-w-[280px]">
                        <p className="text-sm font-medium text-[var(--color-fg-primary)] mb-1">
                          Delete &ldquo;{project.title}&rdquo;?
                        </p>
                        <p className="text-xs text-[var(--color-fg-tertiary)]/70 mb-3">
                          This action cannot be undone. All data and uploaded images will be permanently removed.
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDelete(project.id)}
                            disabled={deleting}
                            className="flex-1 h-9 bg-red-500 text-white text-xs font-medium rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
                          >
                            {deleting ? "Deleting..." : "Delete"}
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="flex-1 h-9 bg-[var(--color-overlay)] text-[var(--color-fg-tertiary)] text-xs font-medium rounded-xl hover:bg-[var(--color-border-primary)] transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-[var(--color-fg-tertiary)]/70">No projects found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
