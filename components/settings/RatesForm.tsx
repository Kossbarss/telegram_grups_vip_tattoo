"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { updateMasterSettings, type ActionResult } from "@/app/(app)/settings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Database } from "@/lib/supabase/types";

type MasterSettings = Database["public"]["Tables"]["master_settings"]["Row"];

export function RatesForm({ settings }: { settings: MasterSettings }) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    updateMasterSettings,
    null,
  );

  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success("Ставки оновлено");
    else if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="hourly_rate">Ставка за годину</Label>
          <Input
            id="hourly_rate"
            name="hourly_rate"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={settings.hourly_rate}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="currency">Валюта</Label>
          <Input id="currency" name="currency" required defaultValue={settings.currency} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="min_price">Мінімальна ціна</Label>
          <Input
            id="min_price"
            name="min_price"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={settings.min_price}
          />
        </div>
      </div>
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Збереження..." : "Зберегти ставки"}
      </Button>
    </form>
  );
}
