
"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VendaMotosTable } from "@/components/venda-motos/venda-motos-table";
import { DashboardGeralView } from "@/components/venda-motos/dashboard-geral-view";
import { AnaliseFranqueadoView } from "@/components/venda-motos/analise-franqueado-view";
import { AnaliseProdutoView } from "@/components/venda-motos/analise-produto-view";
import { VendasKpiCards } from "@/components/venda-motos/kpi/vendas-kpi-cards";
import { DollarSign } from "lucide-react";

export default function VendaMotosPage() {
  return (
    <DashboardLayout>
      <PageHeader
        title="Venda de Motos"
        description="Analise as vendas, receitas e performance dos compradores."
        icon={DollarSign}
        iconContainerClassName="bg-green-600"
      />
      
      <div className="space-y-4 mb-6">
        <VendasKpiCards />
      </div>

      <Tabs defaultValue="dados" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dados">Dados</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard Geral</TabsTrigger>
          <TabsTrigger value="franqueado">Análise por Franqueado</TabsTrigger>
          <TabsTrigger value="produto">Análise de Produtos</TabsTrigger>
        </TabsList>
        <TabsContent value="dados">
          <VendaMotosTable />
        </TabsContent>
        <TabsContent value="dashboard">
          <DashboardGeralView />
        </TabsContent>
        <TabsContent value="franqueado">
          <AnaliseFranqueadoView />
        </TabsContent>
        <TabsContent value="produto">
          <AnaliseProdutoView />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
