import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode } from "lucide-react";

export default function QrScannerPage() {
  return (
    <DashboardLayout>
      <PageHeader
        title="Leitor de Código QR"
        description="Escaneie códigos QR de motocicletas para identificação e ações rápidas."
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <QrCode className="h-6 w-6 text-primary" />
            Interface do Leitor
          </CardTitle>
          <CardDescription>
            Este recurso está em desenvolvimento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg min-h-[300px] bg-muted/50">
            <QrCode className="h-24 w-24 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              A funcionalidade de leitura de Código QR será implementada aqui.
              <br />
              Por enquanto, utilize a lista de motocicletas para gerenciar os itens.
            </p>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
