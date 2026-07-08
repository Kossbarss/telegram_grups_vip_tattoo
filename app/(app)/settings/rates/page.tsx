import { getProfile } from "@/lib/auth/getProfile";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RatesForm } from "@/components/settings/RatesForm";
import { CalculatorOptionRow } from "@/components/settings/CalculatorOptionRow";
import { AddCalculatorOptionForm } from "@/components/settings/AddCalculatorOptionForm";
import type { CalculatorCategory } from "@/lib/supabase/types";

const CATEGORY_LABEL: Record<CalculatorCategory, string> = {
  size: "Розмір",
  style: "Стиль",
  color_complexity: "Кольоровість",
};

export default async function RatesPage() {
  const profile = await getProfile();
  const supabase = await createClient();

  const [{ data: settings }, { data: options }] = await Promise.all([
    supabase.from("master_settings").select("*").eq("master_id", profile.id).single(),
    supabase
      .from("calculator_options")
      .select("*")
      .eq("master_id", profile.id)
      .order("category")
      .order("sort_order"),
  ]);

  const categories: CalculatorCategory[] = ["size", "style", "color_complexity"];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Ставки та калькулятор</h1>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Базова ставка</CardTitle>
          <CardDescription>
            Використовується як основа для розрахунку в калькуляторі вартості.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {settings ? (
            <RatesForm settings={settings} />
          ) : (
            <p className="text-sm text-neutral-500">Налаштування ставок не знайдено.</p>
          )}
        </CardContent>
      </Card>

      {categories.map((category) => {
        const items = options?.filter((o) => o.category === category) ?? [];
        return (
          <Card key={category} className="max-w-2xl">
            <CardHeader>
              <CardTitle>{CATEGORY_LABEL[category]}</CardTitle>
              <CardDescription>
                Множники, які додаються до розрахунку залежно від обраного варіанту.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {items.map((item) => (
                <CalculatorOptionRow
                  key={item.id}
                  id={item.id}
                  label={item.label}
                  multiplier={item.multiplier}
                />
              ))}
              <AddCalculatorOptionForm category={category} />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
