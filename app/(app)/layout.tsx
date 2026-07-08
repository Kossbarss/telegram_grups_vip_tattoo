import Link from "next/link";

import { getProfile } from "@/lib/auth/getProfile";
import { SignOutButton } from "@/components/auth/SignOutButton";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Огляд" },
  { href: "/clients", label: "Клієнти" },
  { href: "/orders", label: "Замовлення" },
  { href: "/calculator", label: "Калькулятор" },
  { href: "/portfolio", label: "Портфоліо" },
  { href: "/settings", label: "Налаштування" },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <nav className="flex flex-wrap items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
              >
                {item.label}
              </Link>
            ))}
            {profile.role === "admin" && (
              <Link
                href="/admin"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
              >
                Адмін
              </Link>
            )}
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-500">
              {profile.display_name ?? profile.business_name ?? "Майстер"}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
