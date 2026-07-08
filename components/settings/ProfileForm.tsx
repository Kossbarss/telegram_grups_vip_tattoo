"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { updateProfile, type ActionResult } from "@/app/(app)/settings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfileForm({
  displayName,
  businessName,
}: {
  displayName: string | null;
  businessName: string | null;
}) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    updateProfile,
    null,
  );

  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success("Профіль оновлено");
    else if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="display_name">Ім&apos;я</Label>
        <Input id="display_name" name="display_name" required defaultValue={displayName ?? ""} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="business_name">Назва студії</Label>
        <Input id="business_name" name="business_name" defaultValue={businessName ?? ""} />
      </div>
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Збереження..." : "Зберегти"}
      </Button>
    </form>
  );
}
