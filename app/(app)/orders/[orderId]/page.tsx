import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { AdvanceStatusButton } from "@/components/orders/AdvanceStatusButton";
import { DeleteOrderButton } from "@/components/orders/DeleteOrderButton";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).single();
  if (!order) notFound();

  const { data: client } = await supabase
    .from("clients")
    .select("id, full_name")
    .eq("id", order.client_id)
    .single();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{order.title}</h1>
          {client && (
            <Link href={`/clients/${client.id}`} className="text-sm text-neutral-500 hover:underline">
              {client.full_name}
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={order.status} />
          <Button asChild variant="outline">
            <Link href={`/orders/${order.id}/edit`}>Редагувати</Link>
          </Button>
          <DeleteOrderButton orderId={order.id} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Деталі</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <span className="text-neutral-500">Ціна: </span>
            {order.price ?? "—"}
          </div>
          <div>
            <span className="text-neutral-500">Дата сеансу: </span>
            {order.scheduled_at ? new Date(order.scheduled_at).toLocaleString("uk-UA") : "—"}
          </div>
          <div>
            <span className="text-neutral-500">Виконано: </span>
            {order.completed_at ? new Date(order.completed_at).toLocaleString("uk-UA") : "—"}
          </div>
          <div>
            <span className="text-neutral-500">Оплачено: </span>
            {order.paid_at ? new Date(order.paid_at).toLocaleString("uk-UA") : "—"}
          </div>
          {order.description && (
            <div className="col-span-full whitespace-pre-wrap">
              <span className="text-neutral-500">Опис: </span>
              {order.description}
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <AdvanceStatusButton orderId={order.id} status={order.status} />
      </div>
    </div>
  );
}
