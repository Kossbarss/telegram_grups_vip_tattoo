"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getProfile } from "@/lib/auth/getProfile";
import { createClient } from "@/lib/supabase/server";
import { orderSchema } from "@/lib/validations/order";
import { nextStatus } from "@/lib/orders/status";
import type { OrderStatus } from "@/lib/supabase/types";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

export async function createOrder(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await getProfile();
  const parsed = orderSchema.safeParse({
    client_id: formData.get("client_id"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    price: formData.get("price") || undefined,
    scheduled_at: formData.get("scheduled_at") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Невірні дані" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .insert({
      master_id: profile.id,
      client_id: parsed.data.client_id,
      title: parsed.data.title,
      description: parsed.data.description || null,
      price: parsed.data.price === "" || parsed.data.price == null ? null : Number(parsed.data.price),
      scheduled_at: parsed.data.scheduled_at
        ? new Date(parsed.data.scheduled_at).toISOString()
        : null,
      status: "scheduled",
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Не вдалося створити замовлення" };
  }

  revalidatePath("/orders");
  redirect(`/orders/${data.id}`);
}

export async function updateOrder(
  orderId: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await getProfile();
  const parsed = orderSchema.safeParse({
    client_id: formData.get("client_id"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    price: formData.get("price") || undefined,
    scheduled_at: formData.get("scheduled_at") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Невірні дані" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({
      client_id: parsed.data.client_id,
      title: parsed.data.title,
      description: parsed.data.description || null,
      price: parsed.data.price === "" || parsed.data.price == null ? null : Number(parsed.data.price),
      scheduled_at: parsed.data.scheduled_at
        ? new Date(parsed.data.scheduled_at).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  redirect(`/orders/${orderId}`);
}

/** Advances an order to the next status in scheduled -> done -> paid. Rejects any other transition. */
export async function advanceOrderStatus(orderId: string, currentStatus: OrderStatus) {
  await getProfile();
  const target = nextStatus(currentStatus);
  if (!target) return { ok: false, error: "Замовлення вже в кінцевому статусі" };

  const supabase = await createClient();
  const patch: { status: OrderStatus; updated_at: string; completed_at?: string; paid_at?: string } = {
    status: target,
    updated_at: new Date().toISOString(),
  };
  if (target === "done") patch.completed_at = new Date().toISOString();
  if (target === "paid") patch.paid_at = new Date().toISOString();

  const { error } = await supabase
    .from("orders")
    .update(patch)
    .eq("id", orderId)
    .eq("status", currentStatus);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  return { ok: true };
}

export async function deleteOrder(orderId: string) {
  await getProfile();
  const supabase = await createClient();
  const { error } = await supabase.from("orders").delete().eq("id", orderId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/orders");
  redirect("/orders");
}
