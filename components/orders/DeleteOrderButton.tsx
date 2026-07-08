"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { deleteOrder } from "@/app/(app)/orders/actions";
import { Button } from "@/components/ui/button";

export function DeleteOrderButton({ orderId }: { orderId: string }) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Видалити це замовлення?")) return;
    startTransition(async () => {
      const result = await deleteOrder(orderId);
      if (result && !result.ok) toast.error(result.error ?? "Не вдалося видалити замовлення");
    });
  }

  return (
    <Button variant="destructive" onClick={handleDelete} disabled={pending}>
      {pending ? "..." : "Видалити"}
    </Button>
  );
}
