"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { convertCalculationToOrder } from "@/app/(app)/calculator/actions";
import { Button } from "@/components/ui/button";

export function ConvertToOrderButton({ calculationId }: { calculationId: string }) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await convertCalculationToOrder(calculationId);
      if (result && !result.ok) toast.error(result.error ?? "Не вдалося створити замовлення");
    });
  }

  return (
    <Button size="sm" variant="outline" onClick={handleClick} disabled={pending}>
      {pending ? "..." : "→ Замовлення"}
    </Button>
  );
}
