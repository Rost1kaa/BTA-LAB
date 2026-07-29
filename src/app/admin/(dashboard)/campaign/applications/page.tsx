"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2, ChevronDown } from "lucide-react";
import { updateApplicationStatus } from "@/lib/actions/campaign";

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

interface ApplicationRecord {
  id: string;
  application_number: string;
  status: string;
  first_name_ka: string | null;
  first_name_en: string | null;
  last_name_ka: string | null;
  last_name_en: string | null;
  email: string | null;
  business_name_ka: string | null;
  project_title_ka: string | null;
  submitted_at: string;
  assigned_reviewer_id: string | null;
}

// ═══════════════════════════════════════════════════════════════════════════
// Status Helpers
// ═══════════════════════════════════════════════════════════════════════════

const STATUS_OPTIONS = [
  { value: "UNOPENED", label: "გაუხსნელი" },
  { value: "CHECKED", label: "შემოწმებული" },
];

// ═══════════════════════════════════════════════════════════════════════════
// Status Selector Component
// ═══════════════════════════════════════════════════════════════════════════

function StatusSelector({
  currentStatus,
  applicationId,
  onStatusChange,
}: {
  currentStatus: string;
  applicationId: string;
  onStatusChange: (id: string, newStatus: string) => void;
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");

  const handleChange = useCallback(
    async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newStatus = e.target.value;
      if (newStatus === currentStatus) return;

      setIsUpdating(true);
      setError("");

      try {
        await updateApplicationStatus(applicationId, newStatus as any);
        onStatusChange(applicationId, newStatus);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update status";
        setError(message);
      } finally {
        setIsUpdating(false);
      }
    },
    [applicationId, currentStatus, onStatusChange]
  );

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <select
          value={currentStatus}
          onChange={handleChange}
          disabled={isUpdating}
          className={`appearance-none px-2.5 py-1.5 pr-7 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
            currentStatus === "UNOPENED"
              ? "bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20"
              : "bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20"
          } disabled:opacity-50 disabled:cursor-wait`}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={12}
          className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${
            currentStatus === "UNOPENED" ? "text-blue-500" : "text-green-500"
          }`}
        />
      </div>
      {isUpdating && <Loader2 size={12} className="animate-spin ml-1 text-[var(--color-fg-tertiary)]" />}
      {error && (
        <div className="absolute top-full left-0 mt-1 z-10 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/20 whitespace-nowrap">
          <AlertCircle size={10} className="text-red-500 shrink-0" />
          <span className="text-[10px] text-red-600">{error}</span>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Applications Table Component
// ═══════════════════════════════════════════════════════════════════════════

function ApplicationsTable({
  applications,
  onStatusChange,
  emptyMessage,
}: {
  applications: ApplicationRecord[];
  onStatusChange: (id: string, newStatus: string) => void;
  emptyMessage: string;
}) {
  if (applications.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] text-center">
        <p className="text-[var(--color-fg-tertiary)]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border-primary)]">
              <th className="text-left p-4 font-medium text-[var(--color-fg-tertiary)]">Number</th>
              <th className="text-left p-4 font-medium text-[var(--color-fg-tertiary)]">Name</th>
              <th className="text-left p-4 font-medium text-[var(--color-fg-tertiary)]">Email</th>
              <th className="text-left p-4 font-medium text-[var(--color-fg-tertiary)]">Business</th>
              <th className="text-left p-4 font-medium text-[var(--color-fg-tertiary)]">Status</th>
              <th className="text-left p-4 font-medium text-[var(--color-fg-tertiary)]">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border-primary)]">
            {applications.map((app) => (
              <tr key={app.id} className="hover:bg-[var(--color-overlay)] transition-colors">
                <td className="p-4 text-[var(--color-fg-primary)] font-medium">
                  <Link
                    href={`/admin/campaign/applications/${app.id}`}
                    className="hover:text-[var(--color-accent)] transition-colors"
                  >
                    {app.application_number}
                  </Link>
                </td>
                <td className="p-4 text-[var(--color-fg-primary)]">
                  <Link
                    href={`/admin/campaign/applications/${app.id}`}
                    className="hover:text-[var(--color-accent)] transition-colors"
                  >
                    {app.first_name_ka} {app.last_name_ka}
                  </Link>
                </td>
                <td className="p-4 text-[var(--color-fg-tertiary)]">{app.email}</td>
                <td className="p-4 text-[var(--color-fg-tertiary)]">{app.business_name_ka}</td>
                <td className="p-4">
                  <StatusSelector
                    currentStatus={app.status}
                    applicationId={app.id}
                    onStatusChange={onStatusChange}
                  />
                </td>
                <td className="p-4 text-[var(--color-fg-tertiary)]">
                  {new Date(app.submitted_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Page Component
// ═══════════════════════════════════════════════════════════════════════════

export default function CampaignApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  // Fetch applications
  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/campaign/applications");
      if (!response.ok) throw new Error("Failed to fetch applications");
      const data = await response.json();
      setApplications(data.applications || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load applications";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Handle status change
  const handleStatusChange = useCallback(
    (id: string, newStatus: string) => {
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
      );
    },
    []
  );

  // Separate unopened and checked
  const unopened = applications.filter((app) => app.status === "UNOPENED");
  const checked = applications.filter((app) => app.status === "CHECKED");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3">
          <Loader2 size={20} className="animate-spin text-[var(--color-fg-tertiary)]" />
          <p className="text-sm text-[var(--color-fg-tertiary)]">Loading applications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 rounded-2xl bg-red-500/10 border border-red-500/20 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <AlertCircle size={18} className="text-red-500" />
          <p className="text-sm font-medium text-red-600">Failed to load applications</p>
        </div>
        <p className="text-xs text-red-500/80 mb-4">{error}</p>
        <button
          onClick={fetchApplications}
          className="px-4 py-2 text-xs font-medium rounded-lg bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500/20 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/admin/campaign"
          className="p-2 rounded-lg hover:bg-[var(--color-overlay)] transition-colors"
        >
          <ArrowLeft size={18} className="text-[var(--color-fg-tertiary)]" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-fg-primary)]">
            Applications
          </h1>
          <p className="mt-1 text-sm text-[var(--color-fg-tertiary)]">
            {applications.length} total applications — {unopened.length} unopened, {checked.length} checked
          </p>
        </div>
      </div>

      {/* ── Unopened Applications Section ── */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <h2 className="text-lg font-semibold text-[var(--color-fg-primary)]">
            განაცხადები — Applications
          </h2>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500">
            {unopened.length}
          </span>
        </div>

        <ApplicationsTable
          applications={unopened}
          onStatusChange={handleStatusChange}
          emptyMessage="ყველა განაცხადი შემოწმებულია — No unopened applications."
        />
      </div>

      {/* ── Checked Applications Section ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 size={16} className="text-green-500" />
          <h2 className="text-lg font-semibold text-[var(--color-fg-primary)]">
            შემოწმებული განაცხადები — Checked Applications
          </h2>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-500/10 text-green-500">
            {checked.length}
          </span>
        </div>

        <ApplicationsTable
          applications={checked}
          onStatusChange={handleStatusChange}
          emptyMessage="No checked applications yet. Change status from the main applications list."
        />
      </div>
    </div>
  );
}
