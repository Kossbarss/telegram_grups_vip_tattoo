"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRole } from "@/lib/auth/getProfile";
import { createAdminClient } from "@/lib/supabase/admin";

const provisionSchema = z.object({
  email: z.string().email("Введіть коректний email"),
  display_name: z.string().min(1, "Вкажіть ім'я майстра"),
  business_name: z.string().optional(),
});

export interface ProvisionResult {
  ok: boolean;
  error?: string;
}

/**
 * Called by the admin after they've manually confirmed payment outside
 * this system. Creates the auth user + sends the invite email in one
 * call; the on_auth_user_created trigger (0004_trigger_seed.sql) creates
 * profiles/master_settings/calculator_options from the metadata below.
 */
export async function provisionMaster(
  _prev: ProvisionResult | null,
  formData: FormData,
): Promise<ProvisionResult> {
  await requireRole("admin");

  const parsed = provisionSchema.safeParse({
    email: formData.get("email"),
    display_name: formData.get("display_name"),
    business_name: formData.get("business_name") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Невірні дані" };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.inviteUserByEmail(parsed.data.email, {
    data: {
      role: "master",
      display_name: parsed.data.display_name,
      business_name: parsed.data.business_name ?? null,
    },
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin");
  return { ok: true };
}
