import type { OrderStatus } from "@/lib/supabase/types";

export const ORDER_STATUSES: OrderStatus[] = ["scheduled", "done", "paid"];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  scheduled: "Заплановано",
  done: "Виконано",
  paid: "Оплачено",
};

const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  scheduled: "done",
  done: "paid",
  paid: null,
};

export function nextStatus(current: OrderStatus): OrderStatus | null {
  return NEXT_STATUS[current];
}
