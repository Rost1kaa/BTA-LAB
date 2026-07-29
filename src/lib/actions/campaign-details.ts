"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleClient } from "@/lib/supabase/server";

// ── Helper to bypass strict typing for campaign_details ───────────────────
// campaign_details is not in the generated Database types, so we cast at the
// call-site instead of polluting the generated type file.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function db(supabase: any) {
  return { from: (t: string) => (supabase as any).from(t) };
}

// ── Validate & Sanitize Input ─────────────────────────────────────────────
// These functions run BEFORE any DB operation, providing clear Georgian error
// messages so the admin never sees a raw PostgreSQL constraint violation.

const VALID_STEP_RANGE = { min: 1, max: 4 } as const;

function sanitizeTitle(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) {
    throw new Error("სათაური არ შეიძლება იყოს ცარიელი.");
  }
  return trimmed;
}

function sanitizeStep(step: number): number {
  if (!Number.isFinite(step)) {
    throw new Error("ეტაპი უნდა იყოს რიცხვი 1-დან 4-მდე.");
  }
  return Math.min(Math.max(Math.round(step), VALID_STEP_RANGE.min), VALID_STEP_RANGE.max);
}

// ── Update Campaign Details (title + content) ─────────────────────────────
// Used by:  /admin/campaign/details
// Revalidates: /entrepreneur-support/details, /admin/campaign
//
// Uses .update() (not .upsert()) because the row is guaranteed to exist — it
// is seeded by supabase/migrations/005_campaign_details.sql.  This avoids
// sending NULL for NOT NULL columns that the caller did not intend to change.

export async function updateCampaignDetails(title: string, content: string) {
  const supabase = createServiceRoleClient();

  // Validate before touching the database
  const cleanTitle = sanitizeTitle(title);

  const { error } = await db(supabase)
    .from("campaign_details")
    .update({
      title: cleanTitle,
      content,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) {
    throw new Error(`Failed to save campaign details: ${error.message}`);
  }

  revalidatePath("/entrepreneur-support/details");
  revalidatePath("/admin/campaign");

  return { success: true };
}

// ── Update Campaign Step (current_step) ───────────────────────────────────
// Used by:  /admin/campaign/steps
// Revalidates: /entrepreneur-support (landing-page stepper), /admin/campaign
//
// Only touches current_step and updated_at — never sends a value for the
// NOT NULL `title` column, which is why we must use .update() not .upsert().

export async function updateCampaignStep(currentStep: number) {
  const supabase = createServiceRoleClient();

  // Validate before touching the database
  const step = sanitizeStep(currentStep);

  const { error } = await db(supabase)
    .from("campaign_details")
    .update({
      current_step: step,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) {
    throw new Error(`Failed to save campaign step: ${error.message}`);
  }

  revalidatePath("/entrepreneur-support");
  revalidatePath("/admin/campaign");

  return { success: true, currentStep: step };
}
