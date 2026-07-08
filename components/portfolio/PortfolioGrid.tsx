"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useTransition } from "react";
import { toast } from "sonner";

import { deletePortfolioItem } from "@/app/(app)/portfolio/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface PortfolioItemView {
  id: string;
  title: string | null;
  tags: string[];
  url: string;
}

export function PortfolioGrid({ items }: { items: PortfolioItemView[] }) {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const allTags = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => i.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [items]);

  const filtered = activeTag ? items.filter((i) => i.tags.includes(activeTag)) : items;

  function handleDelete(id: string) {
    if (!confirm("Видалити це фото з портфоліо?")) return;
    startTransition(async () => {
      const result = await deletePortfolioItem(id);
      if (result && !result.ok) toast.error(result.error ?? "Не вдалося видалити");
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setActiveTag(null)}>
            <Badge variant={activeTag === null ? "default" : "outline"}>Усі</Badge>
          </button>
          {allTags.map((tag) => (
            <button key={tag} onClick={() => setActiveTag(tag)}>
              <Badge variant={activeTag === tag ? "default" : "outline"}>{tag}</Badge>
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-sm text-neutral-500">Немає фото за цим фільтром.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {filtered.map((item) => (
            <div key={item.id} className="group relative overflow-hidden rounded-lg border border-neutral-200">
              <div className="relative aspect-square w-full bg-neutral-100">
                <Image src={item.url} alt={item.title ?? "Робота"} fill className="object-cover" unoptimized />
              </div>
              <div className="p-2">
                {item.title && <p className="truncate text-xs font-medium">{item.title}</p>}
                <div className="mt-1 flex flex-wrap gap-1">
                  {item.tags.map((t) => (
                    <Badge key={t} variant="secondary" className="text-[10px]">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                size="sm"
                variant="destructive"
                className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => handleDelete(item.id)}
                disabled={pending}
              >
                ×
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
