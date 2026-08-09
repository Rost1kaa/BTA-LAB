"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { verifyTokenIntegrity } from "@/lib/email/otp-utils";
import { requireAdminMutation } from "@/lib/auth/admin";
import type { CampaignApplicationStatus, CampaignApplication } from "@/lib/campaign-types";

// Helper to bypass strict typing for campaign tables not recognized by supabase-js types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function db(supabase: any) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { from: (t: string) => (supabase as any).from(t) };
}

// ── Submit Application ────────────────────────────────────────────────────

export async function submitCampaignApplication(formData: Record<string, unknown>) {
  const supabase = createServiceRoleClient();

  try {
    // ── Verification Token Enforcement ──────────────────────────────────
    const verificationToken = formData.verificationToken as string | undefined;
    const formEmail = (formData.email as string || "").toLowerCase().trim();

    if (!verificationToken) {
      throw new Error("ვერიფიკაციის ტოკენი არ მოიძებნა. გთხოვთ, თავიდან გაიაროთ ვერიფიკაცია.");
    }

    const tokenData = verifyTokenIntegrity(verificationToken);
    if (!tokenData) {
      throw new Error("ვერიფიკაციის ტოკენი არასწორია ან ვადაგასულია. გთხოვთ, თავიდან გაიაროთ ვერიფიკაცია.");
    }

    if (tokenData.email !== formEmail) {
      throw new Error("ელ-ფოსტა არ ემთხვევა დადასტურებულ მისამართს. გთხოვთ, თავიდან გაიაროთ ვერიფიკაცია.");
    }

    // ── Personal ID validation (11 digits, if provided) ─────────────────
    const personalId = formData.personalId as string | undefined;
    if (personalId && personalId.trim().length > 0 && !/^\d{11}$/.test(personalId.trim())) {
      throw new Error("პირადი ნომერი უნდა შეიცავდეს ზუსტად 11 ციფრს.");
    }

    // ── Duplicate email check ──────────────────────────────────────────
    const { data: existingApp, error: dupError } = await supabase
      .from("campaign_applications")
      .select("id")
      .eq("email", formEmail)
      .limit(1);

    if (dupError) {
      console.error("[campaign] duplicate check error:", dupError);
      throw new Error("განაცხადის გაგზავნა ვერ მოხერხდა. გთხოვთ, სცადოთ თავიდან.");
    }

    if (existingApp && existingApp.length > 0) {
      throw new Error("ამ ელ-ფოსტით განაცხადი უკვე მიღებულია.");
    }

    // Generate application number
    let applicationNumber: string;
    try {
      const { data: seqData, error: seqError } = await supabase.rpc('generate_campaign_application_number');
      if (seqError) {
        console.error("[campaign] sequence error:", seqError);
        applicationNumber = `BTA-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`;
      } else {
        applicationNumber = seqData || `BTA-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`;
      }
    } catch (seqErr) {
      console.error("[campaign] sequence exception:", seqErr);
      applicationNumber = `BTA-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`;
    }

    // Build a fallback business name from the applicant's full name when the field is empty
    const rawBusinessName = formData.businessName;
    const businessNameValue =
      rawBusinessName && typeof rawBusinessName === "string" && rawBusinessName.trim().length > 0
        ? rawBusinessName.trim()
        : `${formData.firstName || ""} ${formData.lastName || ""}`.trim() || "N/A";

    // Extract basic identifiable fields for admin search, store full wizard data as form_data JSONB
    const { data, error: insertError } = await db(supabase)
      .from("campaign_applications")
      .insert({
        application_number: applicationNumber,
        form_data: formData,
        first_name_ka: formData.firstName || null,
        first_name_en: formData.firstName || null,
        last_name_ka: formData.lastName || null,
        last_name_en: formData.lastName || null,
        email: formData.email || null,
        phone: formData.phone || null,
        business_name_ka: businessNameValue,
        business_name_en: businessNameValue,
        status: "UNOPENED",
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("[campaign] insert error:", insertError);
      throw new Error("განაცხადის გაგზავნა ვერ მოხერხდა. გთხოვთ, სცადოთ თავიდან.");
    }

    // Create initial status history
    try {
      await db(supabase).from("campaign_application_status_history").insert({
        application_id: data.id,
        previous_status: null,
        new_status: "UNOPENED",
        is_public: true,
        notes: "განაცხადი წარმატებით გაიგზავნა."
      });
    } catch (historyErr) {
      console.error("[campaign] status history error:", historyErr);
      // Non-critical — application was already created
    }

    revalidatePath("/entrepreneur-support");
    return data as CampaignApplication;
  } catch (err) {
    const message = err instanceof Error ? err.message : "განაცხადის გაგზავნა ვერ მოხერხდა";
    console.error("[campaign] submitCampaignApplication error:", err);
    throw new Error(message);
  }
}

// ── Admin: Get Applications ───────────────────────────────────────────────

export async function getCampaignApplications(options?: {
  status?: CampaignApplicationStatus;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}) {
  const supabase = createServiceRoleClient();
  let query = db(supabase)
    .from("campaign_applications")
    .select("*", { count: "exact" });

  if (options?.status) {
    query = query.eq("status", options.status);
  }

  if (options?.search) {
    query = query.or(
      `application_number.ilike.%${options.search}%,email.ilike.%${options.search}%,first_name_ka.ilike.%${options.search}%,first_name_en.ilike.%${options.search}%,last_name_ka.ilike.%${options.search}%,last_name_en.ilike.%${options.search}%`
    );
  }

  const sortCol = options?.sortBy || "submitted_at";
  const sortDir = options?.sortOrder || "desc";
  query = query.order(sortCol, { ascending: sortDir === "asc" });

  if (options?.limit) query = query.limit(options.limit);
  if (options?.offset) query = query.range(options.offset, options.offset + (options.limit || 20) - 1);

  const { data, error, count } = await query;
  if (error) {
    console.error("[campaign] getCampaignApplications error:", error);
    throw new Error(`Failed to get applications: ${error.message}`);
  }

  return { data: (data || []) as CampaignApplication[], count: count || 0 };
}

// ── Admin: Update Application Status ──────────────────────────────────────

export async function updateApplicationStatus(
  applicationId: string,
  newStatus: CampaignApplicationStatus,
  notes?: string,
  isPublic?: boolean
) {
  const admin = await requireAdminMutation("campaign:update-status");
  if (!admin) throw new Error("წვდომა აკრძალულია.");

  if (newStatus !== 'UNOPENED' && newStatus !== 'CHECKED') {
    throw new Error(`Invalid status: ${newStatus}. Allowed values: UNOPENED, CHECKED`);
  }
  const supabase = createServiceRoleClient();

  const { data: app } = await db(supabase)
    .from("campaign_applications")
    .select("status")
    .eq("id", applicationId)
    .single();

  const previousStatus = (app?.status as CampaignApplicationStatus) || null;

  const { error: updateError } = await db(supabase)
    .from("campaign_applications")
    .update({
      status: newStatus,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", applicationId);

  if (updateError) {
    console.error("[campaign] updateApplicationStatus error:", updateError);
    throw new Error("სტატუსის განახლება ვერ მოხერხდა.");
  }

  const { error: historyError } = await db(supabase)
    .from("campaign_application_status_history")
    .insert({
      application_id: applicationId,
      previous_status: previousStatus,
      new_status: newStatus,
      notes: notes || "",
      is_public: isPublic ?? true,
    });

  if (historyError) {
    console.error("[campaign] status history error:", historyError);
    throw new Error("სტატუსის ისტორიის შენახვა ვერ მოხერხდა.");
  }

  revalidatePath("/admin/campaign", "layout");
  return { previousStatus, newStatus };
}

// ── Admin: Delete Application ─────────────────────────────────────────────

export async function deleteCampaignApplication(applicationId: string) {
  const admin = await requireAdminMutation("campaign:delete");
  if (!admin) throw new Error("წვდომა აკრძალულია.");

  const supabase = createServiceRoleClient();
  const { error } = await db(supabase)
    .from("campaign_applications")
    .delete()
    .eq("id", applicationId);

  if (error) {
    console.error("[campaign] deleteCampaignApplication error:", error);
    throw new Error("განაცხადის წაშლა ვერ მოხერხდა.");
  }
  revalidatePath("/admin/campaign", "layout");
}

// ── Export CSV ────────────────────────────────────────────────────────────

export async function exportCampaignApplicationsCSV(status?: CampaignApplicationStatus) {
  const supabase = createServiceRoleClient();
  let query = db(supabase)
    .from("campaign_applications")
    .select("*")
    .order("submitted_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) {
    console.error("[campaign] export error:", error);
    throw new Error(`Failed to export: ${error.message}`);
  }

  const applications = (data || []) as CampaignApplication[];
  if (applications.length === 0) return "";

  const headers = [
    "Application Number", "Status", "Submitted At",
    "First Name (KA)", "First Name (EN)", "Last Name (KA)", "Last Name (EN)",
    "Email", "Phone", "Business Name (KA)", "Business Name (EN)",
    "Project Title (KA)", "Project Title (EN)", "Project Category",
    "Project Budget", "Project Timeline",
  ];

  const rows = applications.map((app) => [
    app.application_number,
    app.status,
    app.submitted_at,
    app.first_name_ka,
    app.first_name_en,
    app.last_name_ka,
    app.last_name_en,
    app.email,
    app.phone,
    app.business_name_ka,
    app.business_name_en,
    app.project_title_ka,
    app.project_title_en,
    app.project_category,
    app.project_budget_estimate,
    app.project_timeline,
  ].map((val) => `"${String(val || "").replace(/"/g, '""')}"`));

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

// ── Revalidate Campaign Content ───────────────────────────────────────────

export async function revalidateCampaignContent() {
  revalidatePath("/entrepreneur-support");
  revalidatePath("/entrepreneur-support/apply");
  revalidatePath("/entrepreneur-support/rules");
  revalidatePath("/admin/campaign/cms");

  const tags = [
    "campaign-pages",
    "campaign-sections",
    "campaign-faq",
    "campaign-cards",
    "campaign-timeline",
    "campaign-statistics",
    "campaign-cta",
    "campaign-settings",
    "campaign-seo",
  ];
  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 });
  }
}
