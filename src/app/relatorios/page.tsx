
"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, TrendingUp, BarChartBig, Clock, Download, FileSpreadsheet, PieChart } from "lucide-react";
import type { Motorcycle, Kpi, MotorcycleStatus } from "@/lib/types";
import { subscribeToMotorcycles } from '@/lib/firebase/motorcycleService';
import { useToast } from "@/hooks/use-toast";
import { StatusDistributionChart, type StatusDistributionDataPoint } from "@/components/charts/status-distribution-chart";
import { translateMotorcycleStatus } from "@/lib/utils";


const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => ({
  value: (currentYear - i).toString(),
  label: (currentYear - i).toString(),
}));

// Mapeamento de status para cores do tema para o gráfico
const statusColorsForChart: Record<string, string> = {
  'active': 'hsl(var(--chart-5))',
  'alugada': 'hsl(var(--chart-2))',
  'inadimplente': 'hsl(var(--destructive))',
  'manutencao': 'hsl(var(--chart-4))',
  'recolhida': 'hsl(var(--chart-1))',
  'relocada': 'hsl(var(--chart-3))',
  'N/Definido': 'hsl(var(--muted-foreground))',
};


export default function RelatoriosPage() {
  const [allMotorcycles, setAllMotorcycles] = useState<Motorcycle[]>([]);
  const [kpiData, setKpiData] = useState<Kpi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  const [statusDistributionData, setStatusDistributionData] = useState<StatusDistributionDataPoint[] | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToMotorcycles((motosFromDB) => {
      if (Array.isArray(motosFromDB)) {
        setAllMotorcycles(motosFromDB);
      } else {
        console.warn("Data from subscribeToMotorcycles (relatorios page) was not an array:", motosFromDB);
        setAllMotorcycles([]);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isLoading || !Array.isArray(allMotorcycles)) return;

    const totalMotos = allMotorcycles.length;
    const motosAlugadas = allMotorcycles.filter(m => m.status === 'alugada').length;
    const motosInadimplentes = allMotorcycles.filter(m => m.status === 'inadimplente').length;

    const percInadimplencia = totalMotos > 0 ? (motosInadimplentes / totalMotos) * 100 : 0;
    const taxaAlugadas = totalMotos > 0 ? (motosAlugadas / totalMotos) * 100 : 0;

    const valorPendente = allMotorcycles
      .filter(m => m.status === 'inadimplente' && typeof m.valorDiaria === 'number')
      .reduce((sum, moto) => sum + (moto.valorDiaria || 0), 0);

    setKpiData([
      {
        title: "Total de Motos",
        value: totalMotos.toString(),
        icon: TrendingUp,
        description: "+5% vs mês anterior", 
        color: "text-blue-700",
        iconBgColor: "bg-blue-100",
        iconColor: "text-blue-700",
      },
      {
        title: "Motos Alugadas",
        value: motosAlugadas.toString(),
        icon: BarChartBig,
        description: `Taxa: ${taxaAlugadas.toFixed(0)}%`,
        color: "text-green-700",
        iconBgColor: "bg-green-100",
        iconColor: "text-green-700",
      },
      {
        title: "% Inadimplência",
        value: `${percInadimplencia.toFixed(1)}%`,
        icon: Clock,
        description: "-2.1% vs mês anterior", 
        color: "text-red-700",
        iconBgColor: "bg-red-100",
        iconColor: "text-red-700",
      },
      {
        title: "Valor Pendente",
        value: `R$ ${valorPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        icon: Download,
        description: "-R$ 2.5k vs mês anterior", 
        color: "text-orange-700",
        iconBgColor: "bg-orange-100",
        iconColor: "text-orange-700",
      },
    ]);

    // Process data for StatusDistributionChart
    const statusCounts: Record<string, number> = {};
    allMotorcycles.forEach(moto => {
      const statusKey = moto.status || 'N/Definido';
      statusCounts[statusKey] = (statusCounts[statusKey] || 0) + 1;
    });

    const chartData = Object.entries(statusCounts).map(([status, count]) => ({
      status: translateMotorcycleStatus(status as MotorcycleStatus | undefined),
      count: count,
      fill: statusColorsForChart[status as MotorcycleStatus || 'N/Definido'] || 'hsl(var(--muted-foreground))',
    }));
    setStatusDistributionData(chartData);

  }, [allMotorcycles, isLoading, selectedYear]);

  const handleExportExcel = () => {
    toast({
      title: "Funcionalidade em Desenvolvimento",
      description: "A exportação para Excel será implementada em breve.",
    });
  };
  
  const pageActions = (
    <div className="flex items-center gap-2">
      <Select value={selectedYear} onValueChange={setSelectedYear}>
        <SelectTrigger id="year-filter" className="w-[100px]">
          <SelectValue placeholder="Ano" />
        </SelectTrigger>
        <SelectContent>
          {years.map(year => (
            <SelectItem key={year.value} value={year.value}>{year.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={handleExportExcel} variant="default" className="bg-green-600 hover:bg-green-700 text-white">
        <FileSpreadsheet className="mr-2 h-4 w-4" />
        Exportar Excel
      </Button>
    </div>
  );

  if (isLoading && kpiData.length === 0) {
    return (
      <DashboardLayout>
        <PageHeader
          title="Relatórios e Análises"
          description="Insights e métricas operacionais"
          icon={BarChart3}
          iconContainerClassName="bg-primary"
          actions={pageActions}
        />
        <div className="flex justify-center items-center h-64">
          <p>Carregando dados dos relatórios...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Relatórios e Análises"
        description="Insights e métricas operacionais"
        icon={BarChart3}
        iconContainerClassName="bg-primary"
        actions={pageActions}
      />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-6">
        {kpiData.map((kpi) => (
          <KpiCard 
            key={kpi.title} 
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            description={kpi.description}
            color={kpi.color}
            iconBgColor={kpi.iconBgColor}
            iconColor={kpi.iconColor}
          />
        ))}
      </div>

      <Card className="mt-8 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <PieChart className="h-6 w-6 text-primary" /> {/* Ícone para o novo gráfico */}
            <div>
              <CardTitle className="font-headline">Distribuição de Motos por Status</CardTitle>
              <CardDescription>Contagem de motocicletas em cada status atual.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0"> {/* Ajustado padding para alinhar com outros gráficos */}
          <StatusDistributionChart data={statusDistributionData} />
        </CardContent>
      </Card>

      <div className="mt-8 p-6 border rounded-lg bg-card shadow-lg min-h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">
            Área reservada para mais gráficos e tabelas detalhadas dos relatórios.
            <br />
            (Em desenvolvimento)
        </p>
      </div>

    </DashboardLayout>
  );
}
