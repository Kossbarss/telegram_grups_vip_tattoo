import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProvisionMasterForm } from "@/components/admin/ProvisionMasterForm";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: masters } = await supabase
    .from("profiles")
    .select("id, display_name, business_name, created_at")
    .eq("role", "master")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Надати доступ новому майстру</CardTitle>
          <CardDescription>
            Використовуйте після ручної перевірки оплати вступу до курсу. Майстер отримає
            лист-запрошення на вказаний email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProvisionMasterForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Майстри з доступом ({masters?.length ?? 0})</CardTitle>
          <CardDescription>
            Бізнес-дані кожного майстра (клієнти, замовлення, портфоліо) недоступні адміну —
            лише список акаунтів для провіжинінгу.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!masters || masters.length === 0 ? (
            <p className="text-sm text-neutral-500">Ще немає жодного запрошеного майстра.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ім&apos;я</TableHead>
                  <TableHead>Студія</TableHead>
                  <TableHead>Дата запрошення</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {masters.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>{m.display_name ?? "—"}</TableCell>
                    <TableCell>{m.business_name ?? "—"}</TableCell>
                    <TableCell>{new Date(m.created_at).toLocaleDateString("uk-UA")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
