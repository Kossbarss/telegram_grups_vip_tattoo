import Link from "next/link";

import { getProfile } from "@/lib/auth/getProfile";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalculatorForm } from "@/components/calculator/CalculatorForm";

export default async function CalculatorPage() {
  const profile = await getProfile();
  const supabase = await createClient();

  const [{ data: settings }, { data: options }, { data: clients }] = await Promise.all([
    supabase.from("master_settings").select("*").eq("master_id", profile.id).single(),
    supabase
      .from("calculator_options")
      .select("id, category, label, multiplier")
      .eq("master_id", profile.id)
      .order("sort_order"),
    supabase.from("clients").select("id, full_name").order("full_name"),
  ]);

  const byCategory = (category: string) =>
    (options ?? []).filter((o) => o.category === category);

  if (!settings) {
    return (
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Спочатку налаштуйте ставки</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-neutral-500">
            Щоб користуватись калькулятором, встановіть базову ставку за годину в налаштуваннях.
          </p>
          <Button asChild>
            <Link href="/settings/rates">Перейти до налаштувань</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Калькулятор вартості</h1>
        <Button asChild variant="outline">
          <Link href="/calculator/history">Історія розрахунків →</Link>
        </Button>
      </div>

      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <CalculatorForm
            hourlyRate={settings.hourly_rate}
            minPrice={settings.min_price}
            currency={settings.currency}
            sizeOptions={byCategory("size")}
            styleOptions={byCategory("style")}
            colorOptions={byCategory("color_complexity")}
            clients={clients ?? []}
          />
        </CardContent>
      </Card>
    </div>
  );
}
