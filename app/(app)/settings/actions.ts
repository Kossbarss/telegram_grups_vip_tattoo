"use server";

import { revalidatePath } from "next/cache";

import { getProfile } from "@/lib/auth/getProfile";
import { createClient } from "@/lib/supabase/server";
import {
  calculatorOptionSchema,
  masterSettingsSchema,
  profileSchema,
} from "@/lib/validations/settings";
import type { CalculatorCategory } from "@/lib/supabase/types";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

export async function updateProfile(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await getProfile();
  const parsed = profileSchema.safeParse({
    display_name: formData.get("display_name"),
    business_name: formData.get("business_name") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update(parsed.data)
    .eq("id", profile.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/settings");
  return { ok: true };
}

export async function updateMasterSettings(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await getProfile();
  const parsed = masterSettingsSchema.safeParse({
    hourly_rate: formData.get("hourly_rate"),
    currency: formData.get("currency"),
    min_price: formData.get("min_price"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("master_settings")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("master_id", profile.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/settings/rates");
  revalidatePath("/calculator");
  return { ok: true };
}

export async function addCalculatorOption(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await getProfile();
  const parsed = calculatorOptionSchema.safeParse({
    category: formData.get("category"),
    label: formData.get("label"),
    multiplier: formData.get("multiplier"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();
  const { count } = await supabase
    .from("calculator_options")
    .select("id", { count: "exact", head: true })
    .eq("master_id", profile.id)
    .eq("category", parsed.data.category);

  const { error } = await supabase.from("calculator_options").insert({
    master_id: profile.id,
    ...parsed.data,
    sort_order: count ?? 0,
  });

  if (error) return { ok: false, error: error.message };
  revalidatePath("/settings/rates");
  revalidatePath("/calculator");
  return { ok: true };
}

export async function deleteCalculatorOption(optionId: string) {
  await getProfile();
  const supabase = await createClient();
  const { error } = await supabase.from("calculator_options").delete().eq("id", optionId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/settings/rates");
  revalidatePath("/calculator");
  return { ok: true };
}

export async function updateCalculatorOption(
  optionId: string,
  label: string,
  multiplier: number,
): Promise<ActionResult> {
  await getProfile();
  const parsed = calculatorOptionSchema
    .pick({ label: true, multiplier: true })
    .safeParse({ label, multiplier });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("calculator_options")
    .update(parsed.data)
    .eq("id", optionId);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/settings/rates");
  revalidatePath("/calculator");
  return { ok: true };
}

export type { CalculatorCategory };
