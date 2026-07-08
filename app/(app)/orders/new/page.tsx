import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderForm } from "@/components/orders/OrderForm";
import { createOrder } from "@/app/(app)/orders/actions";

export default async function NewOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const { clientId } = await searchParams;
  const supabase = await createClient();
  const { data: clients } = await supabase.from("clients").select("id, full_name").order("full_name");

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Нове замовлення</CardTitle>
      </CardHeader>
      <CardContent>
        <OrderForm
          clients={clients ?? []}
          defaultClientId={clientId}
          action={createOrder}
          submitLabel="Створити замовлення"
        />
      </CardContent>
    </Card>
  );
}
