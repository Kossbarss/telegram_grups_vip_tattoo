import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./types";

// Service-role client — bypasses RLS entirely. Only ever call this from
// Server Actions/Route Handlers that have already verified the caller is
// role='admin' (see lib/auth/requireRole.ts). SUPABASE_SERVICE_ROLE_KEY
// must never be exposed with a NEXT_PUBLIC_ prefix or imported from
// client code; the `server-only` import above makes any accidental
// client-side import fail the build.
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
