import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Json, ServiceRequest, ServiceRequestType } from "@/types/supabase";

const REQUEST_SECTIONS: Array<{ type: ServiceRequestType; title: string }> = [
  { type: "website_creation", title: "Website Requests" },
  { type: "social_media", title: "Social Media Requests" },
  { type: "advertising", title: "Advertising Requests" },
  { type: "seo_services", title: "SEO Requests" },
];

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
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return JSON.stringify(value, null, 2);
}

function Answers({ answers }: { answers: Json }) {
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
    return (
      <pre className="mt-3 overflow-x-auto rounded-xl bg-[var(--color-overlay)] p-4 text-xs text-[var(--color-fg-tertiary)]">
        {stringifyAnswer(answers)}
      </pre>
    );
  }

  const entries = Object.entries(answers).filter(([, value]) => value !== "" && value !== null);

  if (entries.length === 0) {
    return <p className="mt-3 text-sm text-[var(--color-fg-tertiary)]">No answers provided.</p>;
  }

  return (
    <div className="mt-4 grid grid-cols-1 gap-3">
      {entries.map(([key, value]) => (
        <div key={key} className="rounded-xl bg-[var(--color-overlay)] p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-fg-tertiary)]/60">
            {key}
          </p>
          <pre className="mt-2 whitespace-pre-wrap text-xs leading-5 text-[var(--color-fg-primary)]">
            {stringifyAnswer(value)}
          </pre>
        </div>
      ))}
    </div>
  );
}

export default async function AdminServiceRequestsPage() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("service_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  const requests = (data || []) as ServiceRequest[];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-fg-primary)]">
            Service Requests
          </h1>
          <p className="mt-1 text-sm text-[var(--color-fg-tertiary)]">
            Questionnaire submissions by service category
          </p>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] p-6 text-sm text-red-500">
          Service requests could not be loaded.
        </div>
      ) : (
        <div className="space-y-6">
          {REQUEST_SECTIONS.map((section) => {
            const sectionRequests = requests.filter((request) => request.service_type === section.type);

            return (
              <section
                key={section.type}
                className="rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-primary)] overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-[var(--color-border-primary)] bg-[var(--color-overlay)]">
                  <h2 className="text-sm font-semibold text-[var(--color-fg-primary)]">
                    {section.title}
                  </h2>
                </div>

                {sectionRequests.length === 0 ? (
                  <div className="p-6 text-sm text-[var(--color-fg-tertiary)]">
                    No submissions yet.
                  </div>
                ) : (
                  <div className="divide-y divide-[var(--color-border-primary)]">
                    {sectionRequests.map((request) => (
                      <article key={request.id} className="p-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h3 className="text-sm font-semibold text-[var(--color-fg-primary)]">
                              {request.customer_name}
                            </h3>
                            <p className="mt-1 text-xs text-[var(--color-fg-tertiary)]">
                              {request.customer_email || "No email"}
                              {request.customer_phone ? ` · ${request.customer_phone}` : ""}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-fg-tertiary)]">
                            <span className="rounded-full bg-[var(--color-overlay)] px-2.5 py-1">
                              {request.status}
                            </span>
                            <span>{formatDate(request.created_at)}</span>
                          </div>
                        </div>

                        <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                          <div>
                            <dt className="text-xs uppercase tracking-wider text-[var(--color-fg-tertiary)]/60">
                              Package
                            </dt>
                            <dd className="mt-1 text-[var(--color-fg-primary)]">
                              {request.service_package || "-"}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs uppercase tracking-wider text-[var(--color-fg-tertiary)]/60">
                              Company
                            </dt>
                            <dd className="mt-1 text-[var(--color-fg-primary)]">
                              {request.customer_company || "-"}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs uppercase tracking-wider text-[var(--color-fg-tertiary)]/60">
                              Preferred Contact
                            </dt>
                            <dd className="mt-1 text-[var(--color-fg-primary)]">
                              {request.preferred_contact || "-"}
                            </dd>
                          </div>
                        </dl>

                        <Answers answers={request.answers} />
                      </article>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
