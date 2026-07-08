import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteClientButton } from "@/components/clients/DeleteClientButton";
import { ORDER_STATUS_LABEL } from "@/lib/orders/status";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const supabase = await createClient();

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .single();

  if (!client) notFound();

  const { data: orders } = await supabase
    .from("orders")
    .select("id, title, status, price, scheduled_at")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{client.full_name}</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/clients/${client.id}/edit`}>Редагувати</Link>
          </Button>
          <DeleteClientButton clientId={client.id} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Контакти</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <span className="text-neutral-500">Телефон: </span>
            {client.phone ?? "—"}
          </div>
          <div>
            <span className="text-neutral-500">Email: </span>
            {client.email ?? "—"}
          </div>
          <div>
            <span className="text-neutral-500">Instagram/Telegram: </span>
            {client.instagram ?? "—"}
          </div>
          {client.notes && (
            <div className="col-span-full whitespace-pre-wrap">
              <span className="text-neutral-500">Нотатки: </span>
              {client.notes}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Замовлення ({orders?.length ?? 0})</CardTitle>
            <Button asChild size="sm">
              <Link href={`/orders/new?clientId=${client.id}`}>+ Нове замовлення</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {!orders || orders.length === 0 ? (
            <p className="text-sm text-neutral-500">Замовлень ще немає.</p>
          ) : (
            orders.map((o) => (
              <Link
                key={o.id}
                href={`/orders/${o.id}`}
                className="flex items-center justify-between rounded-md border border-neutral-200 p-3 text-sm hover:bg-neutral-50"
              >
                <span>{o.title}</span>
                <div className="flex items-center gap-3">
                  {o.price != null && <span className="text-neutral-500">{o.price}</span>}
                  <Badge variant="secondary">{ORDER_STATUS_LABEL[o.status]}</Badge>
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
