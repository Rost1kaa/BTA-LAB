import { createServerSupabaseClient } from "@/lib/supabase/server";
import { MessagesList, type ContactMessageItem } from "@/components/admin/messages-list";

export default async function AdminMessagesPage() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  const messages = (data || []) as ContactMessageItem[];

  return (
    <MessagesList
      messages={messages}
      error={error?.message || null}
    />
  );
}
