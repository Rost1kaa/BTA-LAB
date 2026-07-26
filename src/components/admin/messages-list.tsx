"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/use-dictionary";
import { deleteContactMessage } from "@/lib/actions/contact-messages";
import { Search, MessageSquare, Building2, ExternalLink, DollarSign, Trash2 } from "lucide-react";

export interface ContactMessageItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  budget: string;
  message: string;
  status: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  read: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  in_progress: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  closed: "bg-green-500/10 text-green-500 border-green-500/20",
  spam: "bg-red-500/10 text-red-500 border-red-500/20",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  }).format(new Date(value));
}

export function MessagesList({ messages: initialMessages, error }: { messages: ContactMessageItem[]; error?: string | null }) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [items, setItems] = useState(initialMessages);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const filtered = items.filter((msg) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || msg.name.toLowerCase().includes(q) || msg.email.toLowerCase().includes(q);
    const matchesStatus = selectedStatus === "all" || msg.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = useCallback(async (id: string) => {
    const result = await deleteContactMessage(id);
    if (result.success) {
      setItems((prev) => prev.filter((m) => m.id !== id));
    }
    setShowDeleteConfirm(null);
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-fg-primary)]">Contact Requests</h1>
          <p className="mt-1 text-sm text-[var(--color-fg-tertiary)]">Messages submitted through the contact form</p>
        </div>
        <div className="text-xs text-[var(--color-fg-tertiary)] bg-[var(--color-overlay)] px-3 py-1.5 rounded-full">{items.length} total</div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-fg-tertiary)]/50" />
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full h-10 pl-9 pr-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] placeholder:text-[var(--color-fg-tertiary)]/30 focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 transition-all" />
        </div>
        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}
          className="h-10 px-4 bg-[var(--color-overlay)] border border-[var(--color-border-primary)] rounded-xl text-sm text-[var(--color-fg-primary)] focus:outline-none focus:border-[var(--color-fg-tertiary)]/30 transition-all appearance-none">
          <option value="all">All Status</option>
          {Object.keys(statusColors).map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>
      </div>

      {error ? (
        <div className="rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] p-6 text-sm text-red-500">Messages could not be loaded.</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] p-10 text-center">
          <MessageSquare size={32} className="mx-auto text-[var(--color-fg-tertiary)]/30 mb-3" />
          <p className="text-sm text-[var(--color-fg-tertiary)]">No contact messages yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((message) => (
            <motion.div key={message.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] overflow-hidden hover:border-[var(--color-fg-tertiary)]/20 transition-all">
              <div className="p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-[var(--color-fg-primary)]">{message.name}</h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-[var(--color-fg-tertiary)]">
                      <span>{message.email}</span>
                      {message.phone && <span>· {message.phone}</span>}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium border", statusColors[message.status])}>{message.status.replace("_", " ")}</span>
                    <span className="text-xs text-[var(--color-fg-tertiary)]/70 whitespace-nowrap">{formatDate(message.created_at)}</span>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {message.company && <Pill icon={<Building2 size={12} />} value={message.company} />}
                  {message.service && <Pill icon={<ExternalLink size={12} />} value={message.service} />}
                  {message.budget && <Pill icon={<DollarSign size={12} />} value={message.budget} />}
                </div>
                <p className="mt-3 text-sm text-[var(--color-fg-tertiary)] leading-relaxed line-clamp-2">{message.message}</p>
                <div className="mt-3">
                  <button onClick={() => setShowDeleteConfirm(message.id)} className="text-xs font-medium text-red-500/70 hover:text-red-500 cursor-pointer">Delete</button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteConfirm(null); }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-bg-primary)] p-6 max-w-sm mx-4 shadow-2xl">
              <h3 className="text-lg font-semibold text-[var(--color-fg-primary)]">Are you sure you want to delete this message?</h3>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button onClick={() => setShowDeleteConfirm(null)} className="px-4 h-10 rounded-xl text-sm font-medium text-[var(--color-fg-tertiary)] hover:text-[var(--color-fg-primary)] border border-[var(--color-border-primary)] hover:bg-[var(--color-overlay)] transition-all cursor-pointer">Cancel</button>
                <button onClick={() => handleDelete(showDeleteConfirm)} className="px-4 h-10 rounded-xl text-sm font-medium bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all cursor-pointer">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Pill({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-[var(--color-fg-tertiary)] bg-[var(--color-overlay)] rounded-lg px-2.5 py-1.5 truncate">
      <span className="shrink-0 opacity-60">{icon}</span>
      <span className="truncate">{value}</span>
    </div>
  );
}
