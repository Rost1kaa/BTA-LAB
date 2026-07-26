import { getContentMapServer, getTeamMembersServer } from "@/lib/cms-server";
import { getServerLocale } from "@/lib/locale";
import { TeamPageClient } from "./team-client";

export default async function TeamPage() {
  const locale = await getServerLocale();
  const [content, members] = await Promise.all([
    getContentMapServer("team", locale),
    getTeamMembersServer(true, locale),
  ]);

  return (
    <TeamPageClient
      content={content}
      members={members}
    />
  );
}
