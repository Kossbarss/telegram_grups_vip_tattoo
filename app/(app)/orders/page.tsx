import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { ORDER_STATUSES, ORDER_STATUS_LABEL } from "@/lib/orders/status";

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("id, title, status, price, scheduled_at, clients(full_name)")
    .order("scheduled_at", { ascending: true, nullsFirst: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Замовлення</h1>
        <Button asChild>
          <Link href="/orders/new">+ Нове замовлення</Link>
        </Button>
      </div>

      <Tabs defaultValue="scheduled">
        <TabsList>
          {ORDER_STATUSES.map((status) => (
            <TabsTrigger key={status} value={status}>
              {ORDER_STATUS_LABEL[status]}
            </TabsTrigger>
          ))}
        </TabsList>

        {ORDER_STATUSES.map((status) => {
          const filtered = (orders ?? []).filter((o) => o.status === status);
          return (
            <TabsContent key={status} value={status}>
              <Card>
                <CardContent className="flex flex-col gap-2 p-4">
                  {filtered.length === 0 ? (
                    <p className="p-2 text-sm text-neutral-500">Немає замовлень у цьому статусі.</p>
                  ) : (
                    filtered.map((o) => (
                      <Link
                        key={o.id}
                        href={`/orders/${o.id}`}
                        className="flex items-center justify-between rounded-md border border-neutral-200 p-3 text-sm hover:bg-neutral-50"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{o.title}</span>
                          <span className="text-neutral-500">
                            {(o.clients as unknown as { full_name: string } | null)?.full_name ?? "—"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          {o.price != null && <span className="text-neutral-500">{o.price}</span>}
                          <OrderStatusBadge status={o.status} />
                        </div>
                      </Link>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
