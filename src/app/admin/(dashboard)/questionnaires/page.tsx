import { requireAdmin } from "@/lib/auth/admin";
import { QuestionnairesManager } from "@/components/admin/questionnaires-manager";

export const dynamic = "force-dynamic";

interface InvitationRow {
  id: string;
  full_name: string;
  token: string;
  status: "pending" | "submitted";
  is_viewed: boolean;
  created_at: string;
  submitted_at: string | null;
  answers: Record<string, unknown>;
}

export default async function AdminQuestionnairesPage() {
  const admin = await requireAdmin();

  const { data, error } = (await admin.supabase
    .from("questionnaire_invitations")
    .select("id, full_name, token, status, is_viewed, created_at, submitted_at, answers")
    .order("created_at", { ascending: false })) as unknown as {
    data: InvitationRow[] | null;
    error: unknown;
  };

  if (error) {
    console.error(
      "Questionnaire invitations load failed:",
      error instanceof Error ? error.message : error
    );
    throw new Error("Questionnaire invitations could not be loaded.");
  }

  const invitations = (data || []).map((row) => ({
    id: row.id,
    full_name: row.full_name,
    token: row.token,
    status: row.status,
    is_viewed: row.is_viewed,
    created_at: row.created_at,
    submitted_at: row.submitted_at,
    answers:
      row.answers && typeof row.answers === "object" && !Array.isArray(row.answers)
        ? row.answers
        : {},
  }));

  return <QuestionnairesManager invitations={invitations} />;
}
