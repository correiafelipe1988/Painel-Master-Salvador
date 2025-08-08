"use client";

import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wrench, Database, BarChart3, DollarSign, Users } from "lucide-react";
import { ManutencaoDataTab } from "@/components/manutencao/manutencao-data-tab";
import { ManutencaoGraficosTab } from "@/components/manutencao/manutencao-graficos-tab";
import { ManutencaoData } from "@/lib/types";
import { subscribeToManutencao } from "@/lib/firebase/manutencaoService";
import { KpiCard } from "@/components/dashboard/kpi-card";

const currentYear = new Date().getFullYear();

const years = Array.from({ length: 3 }, (_, i) => ({
  value: (currentYear - i).toString(),
  label: (currentYear - i).toString(),
}));

const months = [
  { value: "all", label: "Todos os Meses" },
  { value: "1", label: "Janeiro" },
  { value: "2", label: "Fevereiro" },
  { value: "3", label: "Março" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Maio" },
  { value: "6", label: "Junho" },
  { value: "7", label: "Julho" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];

export default function ManutencaoPage() {
  const [activeTab, setActiveTab] = useState("graficos");
  const [allData, setAllData] = useState<ManutencaoData[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  useEffect(() => {
    const unsubscribe = subscribeToManutencao((manutencaoData) => {
      setAllData(manutencaoData);
    });

    return () => unsubscribe();
  }, []);

  // Filtrar dados por ano e mês
  const filteredData = useMemo(() => {
    let filtered = allData;

    // Filtro por ano
    if (selectedYear !== "all") {
      const targetYear = parseInt(selectedYear);
      filtered = filtered.filter(item => {
        try {
          const itemDate = new Date(item.data);
          return itemDate.getFullYear() === targetYear;
        } catch {
          return false;
        }
      });
    }

    // Filtro por mês
    if (selectedMonth !== "all") {
      const targetMonth = parseInt(selectedMonth);
      filtered = filtered.filter(item => {
        try {
          const itemDate = new Date(item.data);
          return itemDate.getMonth() + 1 === targetMonth;
        } catch {
          return false;
        }
      });
    }

    return filtered;
  }, [allData, selectedYear, selectedMonth]);

  // KPIs de manutenção no novo padrão visual (usando dados filtrados)
  const totalFaturamento = filteredData.reduce((sum, item) => sum + item.faturamento_pecas, 0);
  const totalCusto = filteredData.reduce((sum, item) => sum + item.custo_pecas, 0);
  const totalLiquido = filteredData.reduce((sum, item) => sum + item.liquido, 0);
  const totalClientes = new Set(filteredData.map(item => item.nome_cliente)).size;

  const kpis = [
    {
      title: 'Total de Manutenções',
      value: filteredData.length.toString(),
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

  const pageActions = (
    <div className="flex items-center gap-2">
      <Select value={selectedYear} onValueChange={setSelectedYear}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Ano" />
        </SelectTrigger>
        <SelectContent>
          {years.map(year => (
            <SelectItem key={year.value} value={year.value}>
              {year.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={selectedMonth} onValueChange={setSelectedMonth}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Mês" />
        </SelectTrigger>
        <SelectContent>
          {months.map(month => (
            <SelectItem key={month.value} value={month.value}>
              {month.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <DashboardLayout>
      <PageHeader
        title="Manutenção"
        description="Gestão e análise de manutenção da frota"
        icon={Wrench}
        iconContainerClassName="bg-purple-600"
        actions={pageActions}
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
          <ManutencaoDataTab data={filteredData} />
        </TabsContent>
        
        <TabsContent value="graficos" className="space-y-6">
          <ManutencaoGraficosTab data={filteredData} hideKpis />
        </TabsContent>
      </Tabs>
      </div>
    </DashboardLayout>
  );
}