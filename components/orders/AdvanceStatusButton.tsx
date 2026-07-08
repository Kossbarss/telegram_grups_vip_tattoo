"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { advanceOrderStatus } from "@/app/(app)/orders/actions";
import { Button } from "@/components/ui/button";
import { ORDER_STATUS_LABEL, nextStatus } from "@/lib/orders/status";
import type { OrderStatus } from "@/lib/supabase/types";

export function AdvanceStatusButton({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const [pending, startTransition] = useTransition();
  const target = nextStatus(status);
  if (!target) return null;

  function handleClick() {
    startTransition(async () => {
      const result = await advanceOrderStatus(orderId, status);
      if (!result.ok) toast.error(result.error ?? "Не вдалося оновити статус");
    });
  }

  return (
    <Button onClick={handleClick} disabled={pending}>
      {pending ? "..." : `Позначити «${ORDER_STATUS_LABEL[target]}»`}
    </Button>
  );
}
