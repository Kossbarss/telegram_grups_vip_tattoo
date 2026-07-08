import Link from "next/link";

import { getProfile } from "@/lib/auth/getProfile";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConvertToOrderButton } from "@/components/calculator/ConvertToOrderButton";

export default async function CalculatorHistoryPage() {
  const profile = await getProfile();
  const supabase = await createClient();

  const [{ data: calculations }, { data: orders }, { data: clients }] = await Promise.all([
    supabase
      .from("calculations")
      .select("*")
      .eq("master_id", profile.id)
      .order("created_at", { ascending: false }),
    supabase.from("orders").select("calculation_id").not("calculation_id", "is", null),
    supabase.from("clients").select("id, full_name"),
  ]);

  const convertedIds = new Set((orders ?? []).map((o) => o.calculation_id));
  const clientName = (id: string | null) => clients?.find((c) => c.id === id)?.full_name ?? "—";

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Історія розрахунків</h1>

      <Card>
        <CardContent className="p-0">
          {!calculations || calculations.length === 0 ? (
            <p className="p-6 text-sm text-neutral-500">Ще немає збережених розрахунків.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата</TableHead>
                  <TableHead>Клієнт</TableHead>
                  <TableHead>Параметри</TableHead>
                  <TableHead>Ціна</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {calculations.map((calc) => (
                  <TableRow key={calc.id}>
                    <TableCell>{new Date(calc.created_at).toLocaleDateString("uk-UA")}</TableCell>
                    <TableCell>{clientName(calc.client_id)}</TableCell>
                    <TableCell className="text-neutral-500">
                      {[calc.size_label, calc.style_label, calc.color_label]
                        .filter(Boolean)
                        .join(" · ")}{" "}
                      · {calc.hours} год
                    </TableCell>
                    <TableCell className="font-medium">{calc.computed_price}</TableCell>
                    <TableCell>
                      {convertedIds.has(calc.id) ? (
                        <span className="text-xs text-neutral-400">Вже замовлення</span>
                      ) : calc.client_id ? (
                        <ConvertToOrderButton calculationId={calc.id} />
                      ) : (
                        <span className="text-xs text-neutral-400">Без клієнта</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Link href="/calculator" className="text-sm text-neutral-500 hover:underline">
        ← Новий розрахунок
      </Link>
    </div>
  );
}
