"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { deleteClientRecord } from "@/app/(app)/clients/actions";
import { Button } from "@/components/ui/button";

export function DeleteClientButton({ clientId }: { clientId: string }) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Видалити цього клієнта? Дію не можна скасувати.")) return;
    startTransition(async () => {
      const result = await deleteClientRecord(clientId);
      if (result && !result.ok) toast.error(result.error ?? "Не вдалося видалити клієнта");
    });
  }

  return (
    <Button variant="destructive" onClick={handleDelete} disabled={pending}>
      {pending ? "Видалення..." : "Видалити"}
    </Button>
  );
}
