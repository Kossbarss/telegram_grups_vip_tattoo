"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { deleteCalculatorOption, updateCalculatorOption } from "@/app/(app)/settings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CalculatorOptionRow({
  id,
  label: initialLabel,
  multiplier: initialMultiplier,
}: {
  id: string;
  label: string;
  multiplier: number;
}) {
  const [label, setLabel] = useState(initialLabel);
  const [multiplier, setMultiplier] = useState(String(initialMultiplier));
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const result = await updateCalculatorOption(id, label, Number(multiplier));
      if (!result.ok) toast.error(result.error ?? "Не вдалося зберегти");
    });
  }

  function remove() {
    if (!confirm("Видалити цей варіант?")) return;
    startTransition(async () => {
      const result = await deleteCalculatorOption(id);
      if (result && !result.ok) toast.error(result.error ?? "Не вдалося видалити");
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onBlur={save}
        disabled={pending}
        className="flex-1"
      />
      <Input
        value={multiplier}
        onChange={(e) => setMultiplier(e.target.value)}
        onBlur={save}
        disabled={pending}
        type="number"
        step="0.01"
        min="0"
        className="w-24"
      />
      <Button variant="ghost" size="sm" onClick={remove} disabled={pending}>
        Видалити
      </Button>
    </div>
  );
}
