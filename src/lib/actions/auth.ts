"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  createServerSupabaseClient,
  createServiceRoleClient,
} from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export interface LoginState {
  error: string | null;
}

export async function login(
  _previousState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your credentials." };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: signInError,
  } = await supabase.auth.signInWithPassword(parsed.data);

  if (signInError || !user) {
    return {
      error: signInError?.message.includes("Invalid login credentials")
        ? "Invalid email or password."
        : "Authentication failed. Please try again.",
    };
  }

  const adminSupabase = createServiceRoleClient();
  const { data: profile, error: profileError } = await adminSupabase
    .from("admin_profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Admin profile verification failed:", profileError.message);
    await supabase.auth.signOut();
    return { error: "Admin authorization could not be verified. Please try again." };
  }

  if (!profile) {
    await supabase.auth.signOut();
    return { error: "This account is not authorized to access the Admin Panel." };
  }

  revalidatePath("/admin", "layout");
  redirect("/admin");
}

export async function logout() {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Admin logout failed:", error.message);
  }

  revalidatePath("/admin", "layout");
  redirect("/admin/login");
}
