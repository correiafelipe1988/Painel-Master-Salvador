import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode } from "lucide-react";

export default function QrScannerPage() {
  return (
    <DashboardLayout>
      <PageHeader
        title="QR Code Scanner"
        description="Scan motorcycle QR codes for quick identification and actions."
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <QrCode className="h-6 w-6 text-primary" />
            Scanner Interface
          </CardTitle>
          <CardDescription>
            This feature is under development.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg min-h-[300px] bg-muted/50">
            <QrCode className="h-24 w-24 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              QR Code scanning functionality will be implemented here.
              <br />
              For now, please use the motorcycle list to manage items.
            </p>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
