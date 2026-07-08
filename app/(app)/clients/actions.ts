"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getProfile } from "@/lib/auth/getProfile";
import { createClient } from "@/lib/supabase/server";
import { clientSchema } from "@/lib/validations/client";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

function readClientForm(formData: FormData) {
  return clientSchema.safeParse({
    full_name: formData.get("full_name"),
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
    instagram: formData.get("instagram") || undefined,
    notes: formData.get("notes") || undefined,
  });
}

export async function createClientRecord(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await getProfile();
  const parsed = readClientForm(formData);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Невірні дані" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .insert({ master_id: profile.id, ...parsed.data })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Не вдалося створити клієнта" };
  }

  revalidatePath("/clients");
  redirect(`/clients/${data.id}`);
}

export async function updateClientRecord(
  clientId: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await getProfile();
  const parsed = readClientForm(formData);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Невірні дані" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("clients")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", clientId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
  redirect(`/clients/${clientId}`);
}

export async function deleteClientRecord(clientId: string) {
  await getProfile();
  const supabase = await createClient();
  const { error } = await supabase.from("clients").delete().eq("id", clientId);
  if (error) {
    return { ok: false, error: error.message };
  }
  revalidatePath("/clients");
  redirect("/clients");
}
