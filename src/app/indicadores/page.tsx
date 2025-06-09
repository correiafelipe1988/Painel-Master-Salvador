
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export default function IndicadoresPage() {
  return (
    <DashboardLayout>
      <PageHeader
        title="Indicadores Chave de Performance"
        description="Acompanhe as principais métricas e KPIs do sistema."
        icon={TrendingUp}
        iconContainerClassName="bg-primary"
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <TrendingUp className="h-6 w-6 text-primary" />
            Painel de Indicadores
          </CardTitle>
          <CardDescription>
            Esta seção está em desenvolvimento e exibirá os principais indicadores.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg min-h-[300px] bg-muted/50">
            <TrendingUp className="h-24 w-24 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              A visualização dos indicadores será implementada aqui.
              <br />
              Em breve, você poderá acompanhar gráficos e dados detalhados.
            </p>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
