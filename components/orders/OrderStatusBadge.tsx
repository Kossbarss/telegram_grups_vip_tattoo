import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_LABEL } from "@/lib/orders/status";
import type { OrderStatus } from "@/lib/supabase/types";

const VARIANT: Record<OrderStatus, "secondary" | "warning" | "success"> = {
  scheduled: "warning",
  done: "secondary",
  paid: "success",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={VARIANT[status]}>{ORDER_STATUS_LABEL[status]}</Badge>;
}
