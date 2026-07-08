import Link from "next/link";

import { getProfile } from "@/lib/auth/getProfile";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";

export default async function DashboardPage() {
  const profile = await getProfile();
  const supabase = await createClient();

  const [{ count: clientsCount }, { count: scheduledCount }, { count: portfolioCount }, { data: upcoming }] =
    await Promise.all([
      supabase.from("clients").select("id", { count: "exact", head: true }),
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("status", "scheduled"),
      supabase.from("portfolio_items").select("id", { count: "exact", head: true }),
      supabase
        .from("orders")
        .select("id, title, status, scheduled_at, clients(full_name)")
        .eq("status", "scheduled")
        .not("scheduled_at", "is", null)
        .order("scheduled_at", { ascending: true })
        .limit(5),
    ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">
        Привіт, {profile.display_name ?? "майстре"}!
      </h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-neutral-500">Клієнтів у базі</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{clientsCount ?? 0}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-neutral-500">Заплановано сеансів</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{scheduledCount ?? 0}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-neutral-500">Робіт у портфоліо</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{portfolioCount ?? 0}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Найближчі сеанси</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {!upcoming || upcoming.length === 0 ? (
            <p className="text-sm text-neutral-500">Немає запланованих сеансів з датою.</p>
          ) : (
            upcoming.map((o) => (
              <Link
                key={o.id}
                href={`/orders/${o.id}`}
                className="flex items-center justify-between rounded-md border border-neutral-200 p-3 text-sm hover:bg-neutral-50"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{o.title}</span>
                  <span className="text-neutral-500">
                    {(o.clients as unknown as { full_name: string } | null)?.full_name ?? "—"} ·{" "}
                    {o.scheduled_at ? new Date(o.scheduled_at).toLocaleString("uk-UA") : ""}
                  </span>
                </div>
                <OrderStatusBadge status={o.status} />
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
