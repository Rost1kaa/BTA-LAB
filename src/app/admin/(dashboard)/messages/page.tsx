import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ContactMessage } from "@/types/supabase";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function AdminMessagesPage() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  const messages = (data || []) as ContactMessage[];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-fg-primary)]">
            Messages
          </h1>
          <p className="mt-1 text-sm text-[var(--color-fg-tertiary)]">
            Contact form submissions
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] overflow-hidden">
        {error ? (
          <div className="p-6 text-sm text-red-500">
            Messages could not be loaded.
          </div>
        ) : messages.length === 0 ? (
          <div className="p-6 text-sm text-[var(--color-fg-tertiary)]">
            No contact messages yet.
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border-primary)]">
            {messages.map((message) => (
              <article key={message.id} className="p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-[var(--color-fg-primary)]">
                      {message.name}
                    </h2>
                    <p className="mt-1 text-xs text-[var(--color-fg-tertiary)]">
                      {message.email}
                      {message.phone ? ` · ${message.phone}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-fg-tertiary)]">
                    <span className="rounded-full bg-[var(--color-overlay)] px-2.5 py-1">
                      {message.status}
                    </span>
                    <span>{formatDate(message.created_at)}</span>
                  </div>
                </div>

                <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-[var(--color-fg-tertiary)]/60">
                      Company
                    </dt>
                    <dd className="mt-1 text-[var(--color-fg-primary)]">
                      {message.company || "-"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-[var(--color-fg-tertiary)]/60">
                      Service
                    </dt>
                    <dd className="mt-1 text-[var(--color-fg-primary)]">
                      {message.service || "-"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-[var(--color-fg-tertiary)]/60">
                      Budget
                    </dt>
                    <dd className="mt-1 text-[var(--color-fg-primary)]">
                      {message.budget || "-"}
                    </dd>
                  </div>
                </dl>

                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[var(--color-fg-tertiary)]">
                  {message.message}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
