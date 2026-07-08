"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import type { ActionResult } from "@/app/(app)/orders/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Database } from "@/lib/supabase/types";

type Order = Database["public"]["Tables"]["orders"]["Row"];

function toDatetimeLocal(value: string | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 16);
}

export function OrderForm({
  order,
  clients,
  defaultClientId,
  action,
  submitLabel,
}: {
  order?: Order;
  clients: { id: string; full_name: string }[];
  defaultClientId?: string;
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  submitLabel: string;
}) {
  const [clientId, setClientId] = useState(order?.client_id ?? defaultClientId ?? "");
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    action,
    null,
  );

  useEffect(() => {
    if (state && !state.ok && state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="client_id" value={clientId} />

      <div className="flex flex-col gap-1.5">
        <Label>Клієнт</Label>
        <Select value={clientId} onValueChange={setClientId}>
          <SelectTrigger>
            <SelectValue placeholder="Оберіть клієнта" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Назва замовлення</Label>
        <Input
          id="title"
          name="title"
          required
          defaultValue={order?.title}
          placeholder="Напр.: Рукав, реалізм"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="price">Ціна</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={order?.price ?? ""}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="scheduled_at">Дата сеансу</Label>
          <Input
            id="scheduled_at"
            name="scheduled_at"
            type="datetime-local"
            defaultValue={toDatetimeLocal(order?.scheduled_at ?? null)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Опис</Label>
        <Textarea id="description" name="description" rows={4} defaultValue={order?.description ?? ""} />
      </div>

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Збереження..." : submitLabel}
      </Button>
    </form>
  );
}
