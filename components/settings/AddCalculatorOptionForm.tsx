"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";

import { addCalculatorOption, type ActionResult } from "@/app/(app)/settings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CalculatorCategory } from "@/lib/supabase/types";

export function AddCalculatorOptionForm({ category }: { category: CalculatorCategory }) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    addCalculatorOption,
    null,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) formRef.current?.reset();
    else if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="category" value={category} />
      <Input name="label" placeholder="Назва варіанту" required className="flex-1" />
      <Input
        name="multiplier"
        placeholder="Множник"
        type="number"
        step="0.01"
        min="0"
        defaultValue="1"
        required
        className="w-24"
      />
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        + Додати
      </Button>
    </form>
  );
}
