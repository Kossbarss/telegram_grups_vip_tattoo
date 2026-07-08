"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getProfile } from "@/lib/auth/getProfile";
import { createClient } from "@/lib/supabase/server";
import { computeEstimate } from "@/lib/calculator/pricing";
import { saveCalculationSchema } from "@/lib/validations/calculation";

export interface ActionResult {
  ok: boolean;
  error?: string;
  calculationId?: string;
}

export async function saveCalculation(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await getProfile();
  const parsed = saveCalculationSchema.safeParse({
    client_id: formData.get("client_id") || undefined,
    hours: formData.get("hours"),
    size_option_id: formData.get("size_option_id") || undefined,
    style_option_id: formData.get("style_option_id") || undefined,
    color_option_id: formData.get("color_option_id") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Невірні дані" };
  }

  const supabase = await createClient();

  const [{ data: settings }, { data: options }] = await Promise.all([
    supabase.from("master_settings").select("*").eq("master_id", profile.id).single(),
    supabase
      .from("calculator_options")
      .select("*")
      .eq("master_id", profile.id)
      .in(
        "id",
        [parsed.data.size_option_id, parsed.data.style_option_id, parsed.data.color_option_id].filter(
          (v): v is string => Boolean(v),
        ),
      ),
  ]);

  if (!settings) return { ok: false, error: "Спочатку налаштуйте базову ставку в Налаштуваннях" };

  const sizeOpt = options?.find((o) => o.id === parsed.data.size_option_id);
  const styleOpt = options?.find((o) => o.id === parsed.data.style_option_id);
  const colorOpt = options?.find((o) => o.id === parsed.data.color_option_id);

  const computed_price = computeEstimate({
    hourlyRate: settings.hourly_rate,
    minPrice: settings.min_price,
    hours: parsed.data.hours,
    sizeMultiplier: sizeOpt?.multiplier ?? 1,
    styleMultiplier: styleOpt?.multiplier ?? 1,
    colorMultiplier: colorOpt?.multiplier ?? 1,
  });

  const { data, error } = await supabase
    .from("calculations")
    .insert({
      master_id: profile.id,
      client_id: parsed.data.client_id || null,
      hours: parsed.data.hours,
      size_label: sizeOpt?.label ?? null,
      size_multiplier: sizeOpt?.multiplier ?? 1,
      style_label: styleOpt?.label ?? null,
      style_multiplier: styleOpt?.multiplier ?? 1,
      color_label: colorOpt?.label ?? null,
      color_multiplier: colorOpt?.multiplier ?? 1,
      hourly_rate_snapshot: settings.hourly_rate,
      computed_price,
      notes: parsed.data.notes || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Не вдалося зберегти розрахунок" };
  }

  revalidatePath("/calculator/history");
  return { ok: true, calculationId: data.id };
}

export async function convertCalculationToOrder(calculationId: string) {
  const profile = await getProfile();
  const supabase = await createClient();

  const { data: calc } = await supabase
    .from("calculations")
    .select("*")
    .eq("id", calculationId)
    .single();

  if (!calc) return { ok: false, error: "Розрахунок не знайдено" };
  if (!calc.client_id) {
    return { ok: false, error: "Оберіть клієнта в розрахунку, перш ніж створювати замовлення" };
  }

  const title = [calc.size_label, calc.style_label, calc.color_label]
    .filter(Boolean)
    .join(" · ") || "Тату";

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      master_id: profile.id,
      client_id: calc.client_id,
      calculation_id: calc.id,
      title,
      price: calc.computed_price,
      status: "scheduled",
    })
    .select("id")
    .single();

  if (error || !order) {
    return { ok: false, error: error?.message ?? "Не вдалося створити замовлення" };
  }

  revalidatePath("/orders");
  redirect(`/orders/${order.id}`);
}
