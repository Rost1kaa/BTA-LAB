import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getAdminContext } from "@/lib/auth/admin";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function db(supabase: any) {
  return { from: (t: string) => (supabase as any).from(t) };
}

export const dynamic = "force-dynamic";

const VALID_STATUSES = ["UNOPENED", "CHECKED"] as const;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verify admin authentication
  const admin = await getAdminContext();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Parse and validate request body
  let body: { status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const newStatus = body.status;
  if (!newStatus || !VALID_STATUSES.includes(newStatus as typeof VALID_STATUSES[number])) {
    return NextResponse.json(
      { error: `Invalid status. Allowed values: ${VALID_STATUSES.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    const supabase = createServiceRoleClient();

    // Get current status for history
    const { data: app, error: fetchError } = await db(supabase)
      .from("campaign_applications")
      .select("status")
      .eq("id", id)
      .maybeSingle();

    if (fetchError || !app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const previousStatus = String((app as any).status);

    // Update the status
    const { error: updateError } = await db(supabase)
      .from("campaign_applications")
      .update({
        status: newStatus,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json({ error: `Failed to update status: ${updateError.message}` }, { status: 500 });
    }

    // Record status history
    const { error: historyError } = await db(supabase)
      .from("campaign_application_status_history")
      .insert({
        application_id: id,
        previous_status: previousStatus,
        new_status: newStatus,
        notes: "Status updated by admin",
        is_public: true,
      });

    if (historyError) {
      console.error("Failed to record status history:", historyError.message);
      // Don't fail the request — the status update itself succeeded
    }

    return NextResponse.json({
      success: true,
      previousStatus,
      newStatus,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
