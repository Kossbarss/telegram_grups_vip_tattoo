import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadForm } from "@/components/portfolio/UploadForm";

export default function UploadPortfolioPage() {
  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Завантажити фото в портфоліо</CardTitle>
      </CardHeader>
      <CardContent>
        <UploadForm />
      </CardContent>
    </Card>
  );
}
