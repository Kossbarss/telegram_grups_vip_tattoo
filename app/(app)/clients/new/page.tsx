import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientForm } from "@/components/clients/ClientForm";
import { createClientRecord } from "@/app/(app)/clients/actions";

export default function NewClientPage() {
  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Новий клієнт</CardTitle>
      </CardHeader>
      <CardContent>
        <ClientForm action={createClientRecord} submitLabel="Створити клієнта" />
      </CardContent>
    </Card>
  );
}
