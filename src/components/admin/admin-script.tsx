"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/actions/auth";
import {
  LayoutDashboard,
  FileText,
  FolderKanban,
  Users,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Package,
  MessageSquare,
  ClipboardList,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Content", href: "/admin/content", icon: FileText },
  { label: "Portfolio", href: "/admin/portfolio", icon: FolderKanban },
  { label: "Team", href: "/admin/team", icon: Users },
  { label: "Services", href: "/admin/services", icon: Package },
  { label: "Messages", href: "/admin/messages", icon: MessageSquare },
  { label: "Service Requests", href: "/admin/service-requests", icon: ClipboardList },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 flex lg:hidden items-center justify-center w-10 h-10 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] text-[var(--color-fg-primary)] shadow-sm"
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-64 bg-[var(--color-bg-surface)] border-r border-[var(--color-border-primary)] flex flex-col transition-transform duration-300",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 h-16 border-b border-[var(--color-border-primary)]">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold tracking-tight text-[var(--color-fg-primary)]">
              BTA
            </span>
            <span className="w-4 h-[1px] bg-[var(--color-fg-tertiary)]/50" />
            <span className="text-xs font-light tracking-[0.15em] text-[var(--color-fg-tertiary)]/70 uppercase">
              ADMIN
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-[var(--color-accent)] text-[var(--color-accent-foreground)]"
                    : "text-[var(--color-fg-tertiary)] hover:text-[var(--color-fg-primary)] hover:bg-[var(--color-overlay)]"
                )}
              >
                <Icon size={18} className="shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="border-t border-[var(--color-border-primary)] p-3 space-y-1">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-[var(--color-fg-tertiary)] hover:text-[var(--color-fg-primary)] hover:bg-[var(--color-overlay)] rounded-xl transition-all duration-200"
          >
            <ExternalLink size={18} className="shrink-0" />
            View Website
          </a>
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-red-500/80 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all duration-200"
            >
              <LogOut size={18} className="shrink-0" />
              Log Out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
