"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/use-dictionary";
import { updateServiceRequestStatus, deleteServiceRequest } from "@/lib/actions/service-requests";
import type { Json } from "@/types/supabase";
import {
  Search,
  X,
  ChevronDown,
  ExternalLink,
  Trash2,
  FileText,
  Mail,
  Phone,
  Building2,
  Globe,
  Calendar,
  DollarSign,
  User,
} from "lucide-react";

export interface ServiceRequestListItem {
  id: string;
  service_name: string | null;
  service_package: string;
  client_name: string | null;
  customer_name: string;
  email: string | null;
  customer_email: string;
  phone: string | null;
  customer_phone: string;
  business_type: string | null;
  business_description: string | null;
  has_existing_website: boolean | null;
  website_url: string | null;
  deadline: string | null;
  budget: string | null;
  answers: Json;
  status: string;
  created_at: string;
}

const STATUS_OPTIONS = ["new", "contacted", "in_progress", "completed", "cancelled"];

const statusColors: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  contacted: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  in_progress: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  completed: "bg-green-500/10 text-green-500 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function stringifyAnswer(value: Json | undefined): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.join(", ");
  return JSON.stringify(value, null, 2);
}

export function ServiceRequestsList({ requests: initialRequests, error }: { requests: ServiceRequestListItem[]; error?: string | null }) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedService, setSelectedService] = useState<string>("all");
  const [viewingRequest, setViewingRequest] = useState<ServiceRequestListItem | null>(null);
  const [items, setItems] = useState(initialRequests);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState<string | null>(null);

  const serviceNames = [...new Set(items.map((r) => r.service_name || r.service_package || "Unknown"))].sort();

  const filtered = items.filter((req) => {
    const q = searchQuery.toLowerCase();
    const name = (req.client_name || req.customer_name || "").toLowerCase();
    const email = (req.email || req.customer_email || "").toLowerCase();
    const matchesSearch = !q || name.includes(q) || email.includes(q) || req.id.toLowerCase().includes(q);
    const matchesStatus = selectedStatus === "all" || req.status === selectedStatus;
    const matchesService = selectedService === "all" || (req.service_name || req.service_package) === selectedService;
    return matchesSearch && matchesStatus && matchesService;
  });

  const handleStatus = useCallback(async (id: string, status: string) => {
    setStatusLoading(id);
    const result = await updateServiceRequestStatus(id, status);
    if (result.success) {
      setItems((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
      if (viewingRequest?.id === id) setViewingRequest((prev) => prev ? { ...prev, status } : null);
    }
    setStatusLoading(null);
  }, [viewingRequest]);

  const handleDelete = useCallback(async (id: string) => {
    const result = await deleteServiceRequest(id);
    if (result.success) {
      setItems((prev) => prev.filter((r) => r.id !== id));
      if (viewingRequest?.id === id) setViewingRequest(null);
    }
    setShowDeleteConfirm(null);
  }, [viewingRequest]);

  const getBusinessLabel = (v: string) => t(`serviceRequest.general.businessType.${v}`) !== `serviceRequest.general.businessType.${v}` ? t(`serviceRequest.general.businessType.${v}`) : v;
  const getDeadlineLabel = (v: string) => t(`serviceRequest.general.deadline.${v}`) !== `serviceRequest.general.deadline.${v}` ? t(`serviceRequest.general.deadline.${v}`) : v;
  const getBudgetLabel = (v: string) => t(`serviceRequest.general.budget.${v}`) !== `serviceRequest.general.budget.${v}` ? t(`serviceRequest.general.budget.${v}`) : v;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-fg-primary)]">{t("admin.serviceRequests.title")}</h1>
          <p className="mt-1 text-sm text-[var(--color-fg-tertiary)]">{t("admin.serviceRequests.description")}</p>
        </div>
        <div className="text-xs text-[var(--color-fg-tertiary)] bg-[var(--color-overlay)] px-3 py-1.5 rounded-full">{items.length} total</div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-fg-tertiary)]/50" />
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or ID..."
            className="w-full h-10 pl-9 pr-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] placeholder:text-[var(--color-fg-tertiary)]/30 focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 transition-all" />
        </div>
        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}
          className="h-10 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 transition-all appearance-none">
          <option value="all">{t("admin.serviceRequests.filter.all")}</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{t(`admin.serviceRequests.status.${s}`)}</option>)}
        </select>
        <select value={selectedService} onChange={(e) => setSelectedService(e.target.value)}
          className="h-10 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 transition-all appearance-none">
          <option value="all">{t("admin.serviceRequests.filter.all")}</option>
          {serviceNames.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      {error ? (
        <div className="rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] p-6 text-sm text-red-500">Service requests could not be loaded.</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] p-10 text-center">
          <FileText size={32} className="mx-auto text-[var(--color-fg-tertiary)]/30 mb-3" />
          <p className="text-sm text-[var(--color-fg-tertiary)]">{t("admin.serviceRequests.empty")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((request) => {
            const displayName = request.client_name || request.customer_name || "Unknown";
            const displayEmail = request.email || request.customer_email || "";
            const displayPhone = request.phone || request.customer_phone || "";
            const displayService = request.service_name || request.service_package || "-";
            const displayBudget = request.budget ? getBudgetLabel(request.budget) : "-";
            const shortId = request.id.slice(0, 8);

            return (
              <motion.div key={request.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] overflow-hidden hover:border-[var(--color-fg-tertiary)]/20 transition-all">
                <div className="p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-[var(--color-fg-tertiary)]/50">#{shortId}</span>
                        <h3 className="text-sm font-semibold text-[var(--color-fg-primary)] truncate">{displayName}</h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-[var(--color-fg-tertiary)]">
                        {displayEmail && <span>{displayEmail}</span>}
                        {displayPhone && <span>{displayPhone}</span>}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="relative group">
                        <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer transition-all", statusColors[request.status])}>
                          {t(`admin.serviceRequests.status.${request.status}`)}
                          <ChevronDown size={12} />
                        </span>
                        <div className="absolute right-0 top-full mt-1 z-20 hidden group-hover:block min-w-[140px]">
                          <div className="rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-primary)] shadow-xl py-1 overflow-hidden">
                            {STATUS_OPTIONS.map((status) => (
                              <button key={status} onClick={() => handleStatus(request.id, status)} disabled={statusLoading === request.id}
                                className={cn("w-full text-left px-3 py-2 text-xs font-medium transition-colors cursor-pointer",
                                  request.status === status ? "text-[var(--color-accent)] bg-[var(--color-overlay)]" : "text-[var(--color-fg-tertiary)] hover:bg-[var(--color-overlay)] hover:text-[var(--color-fg-primary)]")}>
                                {t(`admin.serviceRequests.status.${status}`)}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-[var(--color-fg-tertiary)]/70 whitespace-nowrap">{formatDate(request.created_at)}</span>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <DetailPill icon={<FileText size={12} />} value={displayService} />
                    <DetailPill icon={<DollarSign size={12} />} value={displayBudget} />
                    <DetailPill icon={<Building2 size={12} />} value={request.business_type ? getBusinessLabel(request.business_type) : "-"} />
                    <DetailPill icon={<Calendar size={12} />} value={request.deadline ? getDeadlineLabel(request.deadline) : "-"} />
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button onClick={() => setViewingRequest(request)} className="text-xs font-medium text-[var(--color-accent)] hover:underline cursor-pointer">{t("admin.serviceRequests.view")}</button>
                    <span className="text-[var(--color-border-primary)]">·</span>
                    <button onClick={() => setShowDeleteConfirm(request.id)} className="text-xs font-medium text-red-500/70 hover:text-red-500 cursor-pointer">{t("admin.serviceRequests.delete")}</button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* View Modal */}
      <AnimatePresence>
        {viewingRequest && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
            onClick={(e) => { if (e.target === e.currentTarget) setViewingRequest(null); }}>
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 20 }}
              className="relative w-full max-w-2xl my-8 rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-bg-primary)] shadow-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-[var(--color-border-primary)] flex items-center justify-between">
                <h2 className="text-lg font-bold text-[var(--color-fg-primary)]">Request #{viewingRequest.id.slice(0, 8)}</h2>
                <button onClick={() => setViewingRequest(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-fg-tertiary)]/50 hover:text-[var(--color-fg-secondary)] hover:bg-[var(--color-overlay)] transition-colors cursor-pointer"><X size={18} /></button>
              </div>
              <div className="px-6 py-5 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={cn("px-3 py-1 rounded-full text-xs font-medium border", statusColors[viewingRequest.status])}>{t(`admin.serviceRequests.status.${viewingRequest.status}`)}</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {STATUS_OPTIONS.map((status) => (
                      <button key={status} onClick={() => handleStatus(viewingRequest.id, status)} disabled={statusLoading === viewingRequest.id}
                        className={cn("px-2 py-1 rounded text-[10px] font-medium border transition-all cursor-pointer",
                          viewingRequest.status === status ? "bg-[var(--color-accent)] text-[var(--color-accent-foreground)] border-[var(--color-accent)]" : "bg-[var(--color-overlay)] text-[var(--color-fg-tertiary)] border-[var(--color-border-primary)] hover:border-[var(--color-fg-tertiary)]/30")}>
                        {t(`admin.serviceRequests.status.${status}`)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DetailCard icon={<FileText size={16} />} label={t("admin.serviceRequests.table.service")} value={viewingRequest.service_name || viewingRequest.service_package || "-"} />
                  <DetailCard icon={<User size={16} />} label="Client" value={viewingRequest.client_name || viewingRequest.customer_name || "-"} />
                  <DetailCard icon={<Mail size={16} />} label="Email" value={viewingRequest.email || viewingRequest.customer_email || "-"} />
                  <DetailCard icon={<Phone size={16} />} label="Phone" value={viewingRequest.phone || viewingRequest.customer_phone || "-"} />
                  <DetailCard icon={<Building2 size={16} />} label="Business Type" value={viewingRequest.business_type ? getBusinessLabel(viewingRequest.business_type) : "-"} />
                  <DetailCard icon={<DollarSign size={16} />} label="Budget" value={viewingRequest.budget ? getBudgetLabel(viewingRequest.budget) : "-"} />
                  <DetailCard icon={<Calendar size={16} />} label="Deadline" value={viewingRequest.deadline ? getDeadlineLabel(viewingRequest.deadline) : "-"} />
                  <DetailCard icon={<Globe size={16} />} label="Has Website" value={viewingRequest.has_existing_website ? "Yes" : "No"} />
                </div>
                {viewingRequest.has_existing_website && viewingRequest.website_url && (
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-fg-tertiary)]/60 mb-1">Website URL</p>
                    <a href={viewingRequest.website_url} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--color-accent)] hover:underline inline-flex items-center gap-1">{viewingRequest.website_url}<ExternalLink size={12} /></a>
                  </div>
                )}
                {viewingRequest.business_description && (
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-fg-tertiary)]/60 mb-1">Business Description</p>
                    <p className="text-sm text-[var(--color-fg-tertiary)] leading-relaxed">{viewingRequest.business_description}</p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-fg-tertiary)]/60 mb-2">{t("admin.serviceRequests.answerLabel")}</p>
                  {viewingRequest.answers && typeof viewingRequest.answers === "object" ? (
                    <div className="space-y-2">
                      {Object.entries(viewingRequest.answers as Record<string, Json>)
                        .filter(([, v]) => v !== "" && v !== null && v !== undefined && JSON.stringify(v) !== "{}")
                        .map(([key, value]) => (
                          <div key={key} className="rounded-xl bg-[var(--color-overlay)] p-3">
                            <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-fg-tertiary)]/60">{key.replace(/_/g, " ")}</p>
                            <pre className="mt-1 text-xs text-[var(--color-fg-primary)] whitespace-pre-wrap">{stringifyAnswer(value)}</pre>
                          </div>
                        ))}
                    </div>
                  ) : <p className="text-sm text-[var(--color-fg-tertiary)]">No answers provided.</p>}
                </div>
                <div className="text-[10px] text-[var(--color-fg-tertiary)]/50">Submitted: {formatDate(viewingRequest.created_at)}</div>
              </div>
              <div className="px-6 py-4 border-t border-[var(--color-border-primary)] flex items-center justify-end gap-3">
                <button onClick={() => setShowDeleteConfirm(viewingRequest.id)} className="inline-flex items-center gap-1.5 px-4 h-9 rounded-xl text-xs font-medium text-red-500/70 hover:text-red-500 hover:bg-red-500/5 transition-all cursor-pointer"><Trash2 size={14} />{t("admin.serviceRequests.delete")}</button>
                <button onClick={() => setViewingRequest(null)} className="px-4 h-9 rounded-xl text-xs font-medium bg-[var(--color-accent)] text-[var(--color-accent-foreground)] hover:scale-[1.02] transition-all cursor-pointer">{t("admin.serviceRequests.close")}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteConfirm(null); }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-bg-primary)] p-6 max-w-sm mx-4 shadow-2xl">
              <h3 className="text-lg font-semibold text-[var(--color-fg-primary)]">{t("admin.serviceRequests.deleteConfirm")}</h3>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button onClick={() => setShowDeleteConfirm(null)} className="px-4 h-10 rounded-xl text-sm font-medium text-[var(--color-fg-tertiary)] hover:text-[var(--color-fg-primary)] border border-[var(--color-border-primary)] hover:bg-[var(--color-overlay)] transition-all cursor-pointer">Cancel</button>
                <button onClick={() => handleDelete(showDeleteConfirm)} className="px-4 h-10 rounded-xl text-sm font-medium bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all cursor-pointer">{t("admin.serviceRequests.delete")}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailPill({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-[var(--color-fg-tertiary)] bg-[var(--color-overlay)] rounded-lg px-2.5 py-1.5 truncate">
      <span className="shrink-0 opacity-60">{icon}</span>
      <span className="truncate">{value || "-"}</span>
    </div>
  );
}

function DetailCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[var(--color-overlay)] p-3">
      <div className="flex items-center gap-2">
        <span className="text-[var(--color-fg-tertiary)]/60">{icon}</span>
        <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-fg-tertiary)]/60">{label}</p>
      </div>
      <p className="mt-1 text-sm text-[var(--color-fg-primary)]">{value}</p>
    </div>
  );
}
