"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { uploadPortfolioItem, type ActionResult } from "@/app/(app)/portfolio/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function UploadForm() {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    uploadPortfolioItem,
    null,
  );

  useEffect(() => {
    if (state && !state.ok && state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="file">Фото роботи</Label>
        <Input id="file" name="file" type="file" accept="image/*" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Назва (опційно)</Label>
        <Input id="title" name="title" placeholder="Напр.: Рукав, японський стиль" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tags">Теги через кому</Label>
        <Input id="tags" name="tags" placeholder="реалізм, чорно-біле, рукав" />
      </div>
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Завантаження..." : "Завантажити"}
      </Button>
    </form>
  );
}
