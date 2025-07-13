"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wrench, Database, BarChart3, DollarSign, Users } from "lucide-react";
import { ManutencaoDataTab } from "@/components/manutencao/manutencao-data-tab";
import { ManutencaoGraficosTab } from "@/components/manutencao/manutencao-graficos-tab";
import { ManutencaoData } from "@/lib/types";
import { subscribeToManutencao } from "@/lib/firebase/manutencaoService";
import { KpiCard } from "@/components/dashboard/kpi-card";

export default function ManutencaoPage() {
  const [activeTab, setActiveTab] = useState("graficos");
  const [data, setData] = useState<ManutencaoData[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToManutencao((manutencaoData) => {
      setData(manutencaoData);
    });

    return () => unsubscribe();
  }, []);

  // KPIs de manutenção no novo padrão visual
  const totalFaturamento = data.reduce((sum, item) => sum + item.faturamento_pecas, 0);
  const totalCusto = data.reduce((sum, item) => sum + item.custo_pecas, 0);
  const totalLiquido = data.reduce((sum, item) => sum + item.liquido, 0);
  const totalClientes = new Set(data.map(item => item.nome_cliente)).size;

  const kpis = [
    {
      title: 'Total de Manutenções',
      value: data.length.toString(),
      icon: Wrench,
      iconBgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      color: 'text-purple-600',
      description: 'Quantidade total de manutenções registradas no período.',
    },
    {
      title: 'Faturamento Total',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalFaturamento),
      icon: DollarSign,
      iconBgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      color: 'text-green-600',
      description: 'Total de faturamento com peças nas manutenções.',
    },
    {
      title: 'Líquido Total',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalLiquido),
      icon: BarChart3,
      iconBgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      color: 'text-blue-600',
      description: 'Total líquido (faturamento - custo) das manutenções.',
    },
    {
      title: 'Clientes Únicos',
      value: totalClientes.toString(),
      icon: Users,
      iconBgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
      color: 'text-orange-600',
      description: 'Número de clientes distintos que realizaram manutenções.',
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Manutenção"
        description="Gestão e análise de manutenção da frota"
        icon={Wrench}
        iconContainerClassName="bg-purple-600"
      />

      {/* KPIs de Manutenção - sempre visíveis */}
      <div className="mt-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <KpiCard key={kpi.title} {...kpi} className="h-32" />
          ))}
        </div>
      </div>

      {/* Tabs com diferentes visões */}
      <div className="mt-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dados" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Dados
          </TabsTrigger>
          <TabsTrigger value="graficos" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Gráficos
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dados" className="space-y-6">
          <ManutencaoDataTab />
        </TabsContent>
        
        <TabsContent value="graficos" className="space-y-6">
          <ManutencaoGraficosTab data={data} hideKpis />
        </TabsContent>
      </Tabs>
      </div>
    </DashboardLayout>
  );
}