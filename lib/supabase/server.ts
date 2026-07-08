import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import type { Database } from "./types";

// Server Component / Server Action / Route Handler client. Reads/writes
// the Supabase session via Next.js cookies, respects RLS as the signed-in
// user (never use this for admin-only operations — see admin.ts).
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component with no response to attach
            // to — middleware.ts refreshes the session on every request,
            // so this can be safely ignored here.
          }
        },
      },
    },
  );
}
