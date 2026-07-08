"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";

import { provisionMaster, type ProvisionResult } from "@/app/(admin)/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ProvisionResult | null = null;

export function ProvisionMasterForm() {
  const [state, formAction, pending] = useActionState(provisionMaster, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success("Запрошення надіслано майстру.");
      formRef.current?.reset();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email майстра</Label>
        <Input id="email" name="email" type="email" required placeholder="master@example.com" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="display_name">Ім&apos;я майстра</Label>
        <Input id="display_name" name="display_name" required placeholder="Олена Тату" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="business_name">Назва студії (опційно)</Label>
        <Input id="business_name" name="business_name" placeholder="Ink Studio" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Надсилання..." : "Надіслати запрошення"}
      </Button>
    </form>
  );
}
