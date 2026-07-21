import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import type { Database } from "../src/types/supabase";

export interface AdminCredentials {
  email: string;
  password: string;
  displayName: string;
}

export interface AdminSyncResult {
  userId: string;
  email: string;
  createdUser: boolean;
  updatedUser: boolean;
  profileSynced: boolean;
  staleProfilesRemoved: number;
}

type AdminClient = SupabaseClient<Database>;

const COMMON_PASSWORDS = new Set([
  "password",
  "password123",
  "admin123",
  "admin123456",
  "btalab123",
  "qwerty123",
  "letmein123",
]);

function requiredEnv(name: string, value: string | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed) {
    throw new Error(`Missing ${name}`);
  }
  return trimmed;
}

export function getAdminCredentialsFromEnv(env = process.env): AdminCredentials {
  return {
    email: requiredEnv("ADMIN_EMAIL", env.ADMIN_EMAIL).toLowerCase(),
    password: requiredEnv("ADMIN_PASSWORD", env.ADMIN_PASSWORD),
    displayName: requiredEnv("ADMIN_DISPLAY_NAME", env.ADMIN_DISPLAY_NAME),
  };
}

export function validateAdminPassword(password: string): string | null {
  const normalized = password.toLowerCase();
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  if (password.length < 12) {
    return "ADMIN_PASSWORD must be at least 12 characters.";
  }

  if (COMMON_PASSWORDS.has(normalized)) {
    return "ADMIN_PASSWORD is too common.";
  }

  if ([hasLowercase, hasUppercase, hasNumber, hasSymbol].filter(Boolean).length < 3) {
    return "ADMIN_PASSWORD must include at least three of: lowercase, uppercase, number, symbol.";
  }

  return null;
}

export function createSupabaseAdminClient(env = process.env): AdminClient {
  const url = requiredEnv("NEXT_PUBLIC_SUPABASE_URL", env.NEXT_PUBLIC_SUPABASE_URL);
  const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY", env.SUPABASE_SERVICE_ROLE_KEY);

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function findAuthUserByEmail(supabase: AdminClient, email: string): Promise<User | null> {
  const pageSize = 100;
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: pageSize,
    });

    if (error) {
      throw new Error(`Auth user lookup failed: ${error.message}`);
    }

    const users = data?.users ?? [];
    const found = users.find((user) => user.email?.toLowerCase().trim() === email);
    if (found) return found;

    if (users.length < pageSize) return null;
    page++;
  }
}

async function assertAdminProfilesTableReady(supabase: AdminClient) {
  const { error } = await supabase
    .from("admin_profiles")
    .select("id, email")
    .limit(1);

  if (error) {
    throw new Error(
      "admin_profiles table is not ready. Apply supabase/migrations/001_clean_initial_schema.sql first. " +
        `Supabase error: ${error.message}`
    );
  }
}

async function createOrUpdateAuthUser(
  supabase: AdminClient,
  credentials: AdminCredentials,
  log: (message: string) => void
) {
  const passwordError = validateAdminPassword(credentials.password);
  if (passwordError) {
    throw new Error(passwordError);
  }

  const existingUser = await findAuthUserByEmail(supabase, credentials.email);

  if (existingUser) {
    const { data, error } = await supabase.auth.admin.updateUserById(existingUser.id, {
      email: credentials.email,
      password: credentials.password,
      email_confirm: true,
      user_metadata: {
        display_name: credentials.displayName,
      },
    });

    if (error) {
      throw new Error(`Existing admin password/profile update failed: ${error.message}`);
    }

    log(`Admin Auth user updated: ${credentials.email}`);
    return {
      user: data.user ?? existingUser,
      createdUser: false,
      updatedUser: true,
    };
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: credentials.email,
    password: credentials.password,
    email_confirm: true,
    user_metadata: {
      display_name: credentials.displayName,
    },
  });

  if (error) {
    const message = error.message.toLowerCase();
    if (
      message.includes("already exists") ||
      message.includes("already registered") ||
      message.includes("duplicate")
    ) {
      const user = await findAuthUserByEmail(supabase, credentials.email);
      if (!user) {
        throw new Error(`Duplicate admin Auth user was reported but could not be resolved: ${credentials.email}`);
      }

      const { data: updated, error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
        email: credentials.email,
        password: credentials.password,
        email_confirm: true,
        user_metadata: {
          display_name: credentials.displayName,
        },
      });

      if (updateError) {
        throw new Error(`Duplicate admin Auth user recovery failed: ${updateError.message}`);
      }

      log(`Admin Auth user recovered and updated: ${credentials.email}`);
      return {
        user: updated.user ?? user,
        createdUser: false,
        updatedUser: true,
      };
    }

    throw new Error(`Admin Auth user creation failed: ${error.message}`);
  }

  if (!data.user) {
    throw new Error("Admin Auth user creation returned no user.");
  }

  log(`Admin Auth user created: ${credentials.email}`);
  return {
    user: data.user,
    createdUser: true,
    updatedUser: false,
  };
}

async function syncAdminProfile(
  supabase: AdminClient,
  userId: string,
  credentials: AdminCredentials,
  log: (message: string) => void
) {
  const { data: existingProfiles, error: lookupError } = await supabase
    .from("admin_profiles")
    .select("id")
    .eq("email", credentials.email);

  if (lookupError) {
    throw new Error(`Admin profile lookup failed: ${lookupError.message}`);
  }

  const profiles = (existingProfiles ?? []) as Array<{ id: string }>;
  const staleProfileIds = profiles
    .map((profile) => profile.id)
    .filter((id) => id !== userId);

  if (staleProfileIds.length > 0) {
    const { error: deleteError } = await supabase
      .from("admin_profiles")
      .delete()
      .in("id", staleProfileIds);

    if (deleteError) {
      throw new Error(`Stale admin profile cleanup failed: ${deleteError.message}`);
    }

    log(`Removed stale admin profile UUIDs for ${credentials.email}: ${staleProfileIds.length}`);
  }

  const { error: upsertError } = await supabase
    .from("admin_profiles")
    .upsert(
      {
        id: userId,
        email: credentials.email,
        display_name: credentials.displayName,
      } as never,
      { onConflict: "id" }
    );

  if (upsertError) {
    throw new Error(`Admin profile upsert failed: ${upsertError.message}`);
  }

  log(`Admin profile synced: ${credentials.email} (${userId})`);
  return staleProfileIds.length;
}

export async function syncAdminAccount({
  supabase,
  credentials,
  log = () => {},
}: {
  supabase: AdminClient;
  credentials: AdminCredentials;
  log?: (message: string) => void;
}): Promise<AdminSyncResult> {
  await assertAdminProfilesTableReady(supabase);

  const { user, createdUser, updatedUser } = await createOrUpdateAuthUser(
    supabase,
    credentials,
    log
  );

  const staleProfilesRemoved = await syncAdminProfile(
    supabase,
    user.id,
    credentials,
    log
  );

  return {
    userId: user.id,
    email: credentials.email,
    createdUser,
    updatedUser,
    profileSynced: true,
    staleProfilesRemoved,
  };
}
