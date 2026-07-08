"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import type { ActionResult } from "@/app/(app)/clients/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Database } from "@/lib/supabase/types";

type Client = Database["public"]["Tables"]["clients"]["Row"];

export function ClientForm({
  client,
  action,
  submitLabel,
}: {
  client?: Client;
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    action,
    null,
  );

  useEffect(() => {
    if (state && !state.ok && state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="full_name">Ім&apos;я клієнта</Label>
        <Input id="full_name" name="full_name" required defaultValue={client?.full_name} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">Телефон</Label>
          <Input id="phone" name="phone" defaultValue={client?.phone ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={client?.email ?? ""} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="instagram">Instagram / Telegram</Label>
        <Input id="instagram" name="instagram" defaultValue={client?.instagram ?? ""} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Нотатки</Label>
        <Textarea id="notes" name="notes" rows={4} defaultValue={client?.notes ?? ""} />
      </div>
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Збереження..." : submitLabel}
      </Button>
    </form>
  );
}
