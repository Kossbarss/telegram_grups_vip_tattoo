import Link from "next/link";

import { getProfile } from "@/lib/auth/getProfile";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { PortfolioGrid, type PortfolioItemView } from "@/components/portfolio/PortfolioGrid";

const BUCKET = "portfolio";
const SIGNED_URL_TTL_SECONDS = 60 * 60;

export default async function PortfolioPage() {
  const profile = await getProfile();
  const supabase = await createClient();

  const { data: items } = await supabase
    .from("portfolio_items")
    .select("id, title, tags, storage_path")
    .eq("master_id", profile.id)
    .order("created_at", { ascending: false });

  let views: PortfolioItemView[] = [];
  if (items && items.length > 0) {
    const { data: signed } = await supabase.storage
      .from(BUCKET)
      .createSignedUrls(
        items.map((i) => i.storage_path),
        SIGNED_URL_TTL_SECONDS,
      );

    views = items.map((item, idx) => ({
      id: item.id,
      title: item.title,
      tags: item.tags,
      url: signed?.[idx]?.signedUrl ?? "",
    }));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Портфоліо</h1>
        <Button asChild>
          <Link href="/portfolio/upload">+ Завантажити фото</Link>
        </Button>
      </div>

      <PortfolioGrid items={views} />
    </div>
  );
}
