import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function ClientsPage() {
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("id, full_name, phone, instagram, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Клієнти</h1>
        <Button asChild>
          <Link href="/clients/new">+ Новий клієнт</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {!clients || clients.length === 0 ? (
            <p className="p-6 text-sm text-neutral-500">
              Клієнтів ще немає. Додайте першого, щоб почати вести базу.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ім&apos;я</TableHead>
                  <TableHead>Телефон</TableHead>
                  <TableHead>Instagram / Telegram</TableHead>
                  <TableHead>Додано</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Link href={`/clients/${c.id}`} className="font-medium hover:underline">
                        {c.full_name}
                      </Link>
                    </TableCell>
                    <TableCell>{c.phone ?? "—"}</TableCell>
                    <TableCell>{c.instagram ?? "—"}</TableCell>
                    <TableCell>{new Date(c.created_at).toLocaleDateString("uk-UA")}</TableCell>
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
