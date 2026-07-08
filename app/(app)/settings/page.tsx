import Link from "next/link";

import { getProfile } from "@/lib/auth/getProfile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/settings/ProfileForm";

export default async function SettingsPage() {
  const profile = await getProfile();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Налаштування</h1>
        <Button asChild variant="outline">
          <Link href="/settings/rates">Ставки та калькулятор →</Link>
        </Button>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Профіль</CardTitle>
          <CardDescription>Ім&apos;я та назва студії, які бачите тільки ви.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm displayName={profile.display_name} businessName={profile.business_name} />
        </CardContent>
      </Card>
    </div>
  );
}
