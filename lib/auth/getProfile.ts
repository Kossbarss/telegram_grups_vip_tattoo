import "server-only";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/supabase/types";

export interface CurrentProfile {
  id: string;
  role: Role;
  display_name: string | null;
  business_name: string | null;
}

/** Returns the signed-in user's profile, or redirects to /login. */
export async function getProfile(): Promise<CurrentProfile> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, display_name, business_name")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  return profile;
}

/** Same as getProfile(), but redirects to /dashboard if role doesn't match. */
export async function requireRole(role: Role): Promise<CurrentProfile> {
  const profile = await getProfile();
  if (profile.role !== role) redirect("/dashboard");
  return profile;
}
