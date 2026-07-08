"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getProfile } from "@/lib/auth/getProfile";
import { createClient } from "@/lib/supabase/server";
import { portfolioUploadSchema, parseTags } from "@/lib/validations/portfolio";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

const BUCKET = "portfolio";

export async function uploadPortfolioItem(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await getProfile();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Оберіть файл зображення" };
  }
  if (!file.type.startsWith("image/")) {
    return { ok: false, error: "Можна завантажувати лише зображення" };
  }

  const parsed = portfolioUploadSchema.safeParse({
    title: formData.get("title") || undefined,
    tags: formData.get("tags") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Невірні дані" };
  }

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${profile.id}/${randomUUID()}.${ext}`;

  const supabase = await createClient();
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type });

  if (uploadError) {
    return { ok: false, error: uploadError.message };
  }

  const { error: insertError } = await supabase.from("portfolio_items").insert({
    master_id: profile.id,
    storage_path: path,
    title: parsed.data.title || null,
    tags: parseTags(parsed.data.tags),
  });

  if (insertError) {
    await supabase.storage.from(BUCKET).remove([path]);
    return { ok: false, error: insertError.message };
  }

  revalidatePath("/portfolio");
  redirect("/portfolio");
}

export async function deletePortfolioItem(itemId: string) {
  await getProfile();
  const supabase = await createClient();

  const { data: item } = await supabase
    .from("portfolio_items")
    .select("storage_path")
    .eq("id", itemId)
    .single();

  if (!item) return { ok: false, error: "Не знайдено" };

  await supabase.storage.from(BUCKET).remove([item.storage_path]);
  const { error } = await supabase.from("portfolio_items").delete().eq("id", itemId);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/portfolio");
  return { ok: true };
}
