"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createTeamMember, updateTeamMember, deleteTeamMember } from "@/lib/actions/team";
import { Save, Trash2, Edit, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import type { TeamMember } from "@/types/supabase";

export default function TeamAdminPage() {
  const router = useRouter();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name_ka: "",
    name_en: "",
    role_ka: "",
    role_en: "",
    bio_ka: "",
    bio_en: "",
    skills_ka: "",
    skills_en: "",
    image: "",
    linkedin: "",
    twitter: "",
    github: "",
    website: "",
    instagram: "",
    published: true,
    display_order: 0,
  });

  const loadMembers = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("team_members")
        .select("*")
        .order("display_order");
      setMembers(data || []);
    } catch {
      toast.error("Failed to load team members.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadMembers();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [loadMembers]);

  function resetForm() {
    setForm({
      name_ka: "",
      name_en: "",
      role_ka: "",
      role_en: "",
      bio_ka: "",
      bio_en: "",
      skills_ka: "",
      skills_en: "",
      image: "",
      linkedin: "",
      twitter: "",
      github: "",
      website: "",
      instagram: "",
      published: true,
      display_order: members.length,
    });
    setEditingId(null);
  }

  function editMember(member: TeamMember) {
    setForm({
      name_ka: member.name_ka || member.name,
      name_en: member.name_en || member.name,
      role_ka: member.role_ka || member.role,
      role_en: member.role_en || member.role,
      bio_ka: member.bio_ka || member.bio,
      bio_en: member.bio_en || member.bio,
      skills_ka: (member.skills_ka || member.skills || []).join(", "),
      skills_en: (member.skills_en || member.skills || []).join(", "),
      image: member.image,
      linkedin: (member.socials as Record<string, string>)?.linkedin || "",
      twitter: (member.socials as Record<string, string>)?.twitter || "",
      github: (member.socials as Record<string, string>)?.github || "",
      website: (member.socials as Record<string, string>)?.website || "",
      instagram: (member.socials as Record<string, string>)?.instagram || "",
      published: member.published,
      display_order: member.display_order,
    });
    setEditingId(member.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name_ka.trim() && !form.name_en.trim()) {
      toast.error("Name is required.");
      return;
    }

    setSaving(true);
    const socials: Record<string, string> = {};
    if (form.linkedin) socials.linkedin = form.linkedin;
    if (form.twitter) socials.twitter = form.twitter;
    if (form.github) socials.github = form.github;
    if (form.website) socials.website = form.website;
    if (form.instagram) socials.instagram = form.instagram;

    const input = {
      name: form.name_en.trim() || form.name_ka.trim(),
      name_ka: form.name_ka.trim(),
      name_en: form.name_en.trim(),
      role: form.role_en.trim(),
      role_ka: form.role_ka.trim(),
      role_en: form.role_en.trim(),
      bio: form.bio_en.trim(),
      bio_ka: form.bio_ka.trim(),
      bio_en: form.bio_en.trim(),
      skills: form.skills_en.split(",").map((s) => s.trim()).filter(Boolean),
      skills_ka: form.skills_ka.split(",").map((s) => s.trim()).filter(Boolean),
      skills_en: form.skills_en.split(",").map((s) => s.trim()).filter(Boolean),
      image_alt_ka: form.name_ka.trim(),
      image_alt_en: form.name_en.trim(),
      image: form.image,
      socials,
      published: form.published,
      display_order: form.display_order,
    };

    try {
      let result;
      if (editingId) {
        result = await updateTeamMember(editingId, input);
      } else {
        result = await createTeamMember(input);
      }

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(editingId ? "Member updated!" : "Member created!");
        resetForm();
        loadMembers();
        router.refresh();
      }
    } catch {
      toast.error("An error occurred.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(true);
    try {
      const result = await deleteTeamMember(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Member deleted.");
        setDeleteConfirm(null);
        loadMembers();
        router.refresh();
      }
    } catch {
      toast.error("Failed to delete.");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin h-6 w-6 border-2 border-[var(--color-fg-tertiary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-fg-primary)]">
          Team Members
        </h1>
        <p className="mt-1 text-sm text-[var(--color-fg-tertiary)]">
          Manage your team
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] p-6 mb-8 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--color-fg-primary)]">
            {editingId ? "Edit Member" : "Add Member"}
          </h2>
          {editingId && (
            <button type="button" onClick={resetForm} className="text-xs text-[var(--color-fg-tertiary)]/70 hover:text-[var(--color-fg-primary)]">
              Cancel editing
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="team-name-ka" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">Name (Georgian)</label>
            <input id="team-name-ka" name="name_ka" type="text" value={form.name_ka} onChange={(e) => setForm((p) => ({ ...p, name_ka: e.target.value }))}
              className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 transition-all" />
          </div>
          <div className="space-y-2">
            <label htmlFor="team-name-en" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">Name (English)</label>
            <input id="team-name-en" name="name_en" type="text" value={form.name_en} onChange={(e) => setForm((p) => ({ ...p, name_en: e.target.value }))}
              className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 transition-all" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="team-role-ka" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">Role (Georgian)</label>
            <input id="team-role-ka" name="role_ka" type="text" value={form.role_ka} onChange={(e) => setForm((p) => ({ ...p, role_ka: e.target.value }))}
              className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 transition-all" />
          </div>
          <div className="space-y-2">
            <label htmlFor="team-role-en" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">Role (English)</label>
            <input id="team-role-en" name="role_en" type="text" value={form.role_en} onChange={(e) => setForm((p) => ({ ...p, role_en: e.target.value }))}
              className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 transition-all" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">Bio</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <textarea id="team-bio-ka" name="bio_ka" value={form.bio_ka} onChange={(e) => setForm((p) => ({ ...p, bio_ka: e.target.value }))} rows={3}
              className="w-full px-4 py-3 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 transition-all resize-none" placeholder="Georgian" />
            <textarea id="team-bio-en" name="bio_en" value={form.bio_en} onChange={(e) => setForm((p) => ({ ...p, bio_en: e.target.value }))} rows={3}
              className="w-full px-4 py-3 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 transition-all resize-none" placeholder="English" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">Skills (comma separated)</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input id="team-skills-ka" name="skills_ka" type="text" value={form.skills_ka} onChange={(e) => setForm((p) => ({ ...p, skills_ka: e.target.value }))}
              className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 transition-all font-mono"
              placeholder="Georgian" />
            <input id="team-skills-en" name="skills_en" type="text" value={form.skills_en} onChange={(e) => setForm((p) => ({ ...p, skills_en: e.target.value }))}
              className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 transition-all font-mono"
              placeholder="React, Node.js, TypeScript" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="team-image" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">Image URL</label>
            <input id="team-image" type="url" value={form.image} onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))}
              className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fg-tertiary)]/30" placeholder="https://…" />
          </div>
          <div className="space-y-2">
            <label htmlFor="team-display-order" className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">Display Order</label>
            <input id="team-display-order" type="number" min="0" value={form.display_order} onChange={(e) => setForm((p) => ({ ...p, display_order: Number.parseInt(e.target.value, 10) || 0 }))}
              className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fg-tertiary)]/30" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(["linkedin", "twitter", "github", "website", "instagram"] as const).map((platform) => (
            <div key={platform} className="space-y-2">
              <label htmlFor={`team-${platform}`} className="text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">{platform}</label>
              <input id={`team-${platform}`} name={platform} type="url" value={form[platform]} onChange={(e) => setForm((p) => ({ ...p, [platform]: e.target.value }))}
                className="w-full h-11 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 transition-all"
                placeholder={`https://${platform}.com/...`} />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.published} onChange={(e) => setForm((p) => ({ ...p, published: e.target.checked }))}
              className="w-4 h-4 rounded border-[var(--color-border-primary)]" />
            <span className="text-sm text-[var(--color-fg-primary)]">Published</span>
          </label>
        </div>

        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 h-11 px-5 bg-[var(--color-accent)] text-[var(--color-accent-foreground)] font-medium rounded-xl hover:opacity-90 transition-opacity text-sm disabled:opacity-50">
          <Save size={16} />
          {saving ? "Saving…" : editingId ? "Update Member" : "Add Member"}
        </button>
      </form>

      {/* Members List */}
      <div className="rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border-primary)] bg-[var(--color-overlay)]">
                <th className="text-left px-4 py-3 text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider hidden md:table-cell">Role</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider hidden sm:table-cell">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-[var(--color-fg-tertiary)]/70 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-primary)]">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-[var(--color-overlay)]/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[var(--color-fg-primary)]">{member.name}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs text-[var(--color-fg-tertiary)]/70">{member.role}</span>
                  </td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell">
                    {member.published ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-500"><Eye size={12} /> Visible</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-500"><EyeOff size={12} /> Hidden</span>
                    )}
                  </td>
                  <td className="relative px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button type="button" onClick={() => editMember(member)} aria-label={`Edit ${member.name}`}
                        className="p-2 rounded-lg text-[var(--color-fg-tertiary)]/50 hover:text-[var(--color-fg-primary)] hover:bg-[var(--color-overlay)] transition-all">
                        <Edit size={14} />
                      </button>
                      <button type="button" onClick={() => setDeleteConfirm(deleteConfirm === member.id ? null : member.id)} aria-label={`Delete ${member.name}`}
                        className="p-2 rounded-lg text-[var(--color-fg-tertiary)]/50 hover:text-red-500 hover:bg-red-500/10 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {deleteConfirm === member.id && (
                      <div className="absolute right-0 mt-2 p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-red-500/20 shadow-lg z-10 min-w-[280px]">
                        <p className="text-sm font-medium text-[var(--color-fg-primary)] mb-1">Delete &ldquo;{member.name}&rdquo;?</p>
                        <p className="text-xs text-[var(--color-fg-tertiary)]/70 mb-3">This cannot be undone.</p>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleDelete(member.id)} disabled={deleting}
                            className="flex-1 h-9 bg-red-500 text-white text-xs font-medium rounded-xl hover:bg-red-600 disabled:opacity-50">
                            {deleting ? "Deleting…" : "Delete"}
                          </button>
                          <button onClick={() => setDeleteConfirm(null)}
                            className="flex-1 h-9 bg-[var(--color-overlay)] text-[var(--color-fg-tertiary)] text-xs font-medium rounded-xl">
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
        {members.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-[var(--color-fg-tertiary)]/70">No team members yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
