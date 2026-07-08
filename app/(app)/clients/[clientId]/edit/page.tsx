import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientForm } from "@/components/clients/ClientForm";
import { updateClientRecord } from "@/app/(app)/clients/actions";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const supabase = await createClient();

  const { data: client } = await supabase.from("clients").select("*").eq("id", clientId).single();

  if (!client) notFound();

  const boundAction = updateClientRecord.bind(null, clientId);

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Редагувати клієнта</CardTitle>
      </CardHeader>
      <CardContent>
        <ClientForm client={client} action={boundAction} submitLabel="Зберегти зміни" />
      </CardContent>
    </Card>
  );
}
