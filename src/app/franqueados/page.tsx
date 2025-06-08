
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function FranqueadosPage() {
  return (
    <DashboardLayout>
      <PageHeader
        title="Franqueados"
        description="Análise e gestão de franqueados."
        icon={Users}
        iconContainerClassName="bg-primary"
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <Users className="h-6 w-6 text-primary" />
            Informações dos Franqueados
          </CardTitle>
          <CardDescription>
            Este recurso está em desenvolvimento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg min-h-[300px] bg-muted/50">
            <Users className="h-24 w-24 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              A funcionalidade de gestão e análise de franqueados será implementada aqui.
              <br />
              Em breve você poderá visualizar dados detalhados por franqueado.
            </p>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
