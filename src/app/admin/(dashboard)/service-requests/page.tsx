import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ServiceRequestsList, type ServiceRequestListItem } from "@/components/admin/service-requests-list";

export default async function AdminServiceRequestsPage() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("service_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  const requests = (data || []) as ServiceRequestListItem[];

  return (
    <ServiceRequestsList
      requests={requests}
      error={error?.message || null}
    />
  );
}
