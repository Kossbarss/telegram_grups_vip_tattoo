"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { saveCalculation, convertCalculationToOrder, type ActionResult } from "@/app/(app)/calculator/actions";
import { computeEstimate } from "@/lib/calculator/pricing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface Option {
  id: string;
  label: string;
  multiplier: number;
}

export function CalculatorForm({
  hourlyRate,
  minPrice,
  currency,
  sizeOptions,
  styleOptions,
  colorOptions,
  clients,
}: {
  hourlyRate: number;
  minPrice: number;
  currency: string;
  sizeOptions: Option[];
  styleOptions: Option[];
  colorOptions: Option[];
  clients: { id: string; full_name: string }[];
}) {
  const [hours, setHours] = useState("1");
  const [sizeId, setSizeId] = useState(sizeOptions[0]?.id ?? "");
  const [styleId, setStyleId] = useState(styleOptions[0]?.id ?? "");
  const [colorId, setColorId] = useState(colorOptions[0]?.id ?? "");
  const [clientId, setClientId] = useState<string>("");

  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    saveCalculation,
    null,
  );

  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success("Розрахунок збережено");
    else if (state.error) toast.error(state.error);
  }, [state]);

  const estimate = useMemo(() => {
    const h = Number(hours) || 0;
    const size = sizeOptions.find((o) => o.id === sizeId)?.multiplier ?? 1;
    const style = styleOptions.find((o) => o.id === styleId)?.multiplier ?? 1;
    const color = colorOptions.find((o) => o.id === colorId)?.multiplier ?? 1;
    return computeEstimate({
      hourlyRate,
      minPrice,
      hours: h,
      sizeMultiplier: size,
      styleMultiplier: style,
      colorMultiplier: color,
    });
  }, [hours, sizeId, styleId, colorId, hourlyRate, minPrice, sizeOptions, styleOptions, colorOptions]);

  return (
    <div className="flex flex-col gap-6">
      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="size_option_id" value={sizeId} />
        <input type="hidden" name="style_option_id" value={styleId} />
        <input type="hidden" name="color_option_id" value={colorId} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="hours">Орієнтовний час (год)</Label>
            <Input
              id="hours"
              name="hours"
              type="number"
              step="0.5"
              min="0.5"
              required
              value={hours}
              onChange={(e) => setHours(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Клієнт (опційно)</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Без клієнта" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="client_id" value={clientId} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <Label>Розмір</Label>
            <Select value={sizeId} onValueChange={setSizeId}>
              <SelectTrigger>
                <SelectValue placeholder="Оберіть розмір" />
              </SelectTrigger>
              <SelectContent>
                {sizeOptions.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Стиль</Label>
            <Select value={styleId} onValueChange={setStyleId}>
              <SelectTrigger>
                <SelectValue placeholder="Оберіть стиль" />
              </SelectTrigger>
              <SelectContent>
                {styleOptions.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Кольоровість</Label>
            <Select value={colorId} onValueChange={setColorId}>
              <SelectTrigger>
                <SelectValue placeholder="Оберіть варіант" />
              </SelectTrigger>
              <SelectContent>
                {colorOptions.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="notes">Нотатки до розрахунку</Label>
          <Textarea id="notes" name="notes" rows={3} />
        </div>

        <Card className="bg-neutral-900 text-white">
          <CardContent className="flex items-center justify-between p-6">
            <span className="text-sm text-neutral-300">Орієнтовна вартість</span>
            <span className="text-3xl font-semibold">
              {estimate} {currency}
            </span>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Збереження..." : "Зберегти розрахунок"}
          </Button>
          {state?.ok && state.calculationId && clientId && (
            <Button
              type="button"
              variant="outline"
              onClick={() => convertCalculationToOrder(state.calculationId!)}
            >
              Перетворити на замовлення
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
