import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderForm } from "@/components/orders/OrderForm";
import { updateOrder } from "@/app/(app)/orders/actions";

export default async function EditOrderPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const supabase = await createClient();

  const [{ data: order }, { data: clients }] = await Promise.all([
    supabase.from("orders").select("*").eq("id", orderId).single(),
    supabase.from("clients").select("id, full_name").order("full_name"),
  ]);

  if (!order) notFound();

  const boundAction = updateOrder.bind(null, orderId);

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Редагувати замовлення</CardTitle>
      </CardHeader>
      <CardContent>
        <OrderForm
          order={order}
          clients={clients ?? []}
          action={boundAction}
          submitLabel="Зберегти зміни"
        />
      </CardContent>
    </Card>
  );
}
