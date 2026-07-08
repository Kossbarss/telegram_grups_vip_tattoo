// One-time bootstrap: creates the very first admin account.
// There's no admin yet to use the in-app "invite master" flow for this,
// so this script talks to Supabase directly with the service-role key.
//
// Usage:
//   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
//     node scripts/create-first-admin.mjs admin@example.com "S3curePassw0rd!" "Admin Name"

import { createClient } from "@supabase/supabase-js";

const [, , email, password, displayName] = process.argv;

if (!email || !password) {
  console.error(
    'Usage: node scripts/create-first-admin.mjs <email> <password> ["Display Name"]',
  );
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment first.",
  );
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { role: "admin", display_name: displayName ?? "Admin" },
});

if (error) {
  console.error("Failed to create admin:", error.message);
  process.exit(1);
}

console.log(`Admin created: ${data.user.email} (${data.user.id})`);
console.log("The on_auth_user_created trigger has created their profiles row with role=admin.");
console.log("They can now log in at /login with the email/password above.");
