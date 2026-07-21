import { config } from "dotenv";
import {
  createSupabaseAdminClient,
  getAdminCredentialsFromEnv,
  syncAdminAccount,
} from "./admin-bootstrap";

config({ path: ".env" });

async function main() {
  console.log("");
  console.log("Admin sync");
  console.log("----------");

  const credentials = getAdminCredentialsFromEnv();
  const supabase = createSupabaseAdminClient();

  const result = await syncAdminAccount({
    supabase,
    credentials,
    log: (message) => console.log(`  ${message}`),
  });

  console.log("");
  console.log("Admin account is synchronized.");
  console.log(`  email: ${result.email}`);
  console.log(`  user id: ${result.userId}`);
  console.log(`  created user: ${result.createdUser ? "yes" : "no"}`);
  console.log(`  updated user: ${result.updatedUser ? "yes" : "no"}`);
  console.log(`  profile synced: ${result.profileSynced ? "yes" : "no"}`);
  console.log(`  stale profiles removed: ${result.staleProfilesRemoved}`);
}

main().catch((err) => {
  console.error("");
  console.error("Admin sync failed:", err instanceof Error ? err.message : String(err));
  process.exit(1);
});
