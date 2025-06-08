
"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, TrendingUp, BarChartBig, Clock, Download, FileSpreadsheet, PieChart, CalendarDays as PageCalendarIcon } from "lucide-react";
import type { Motorcycle, Kpi, MotorcycleStatus, ChartDataPoint } from "@/lib/types";
import { subscribeToMotorcycles } from '@/lib/firebase/motorcycleService';
import { useToast } from "@/hooks/use-toast";
import { StatusDistributionChart, type StatusDistributionDataPoint } from "@/components/charts/status-distribution-chart";
import { RecoveryVolumeChart } from "@/components/charts/recovery-volume-chart";
import { RentalVolumeChart, type MonthlyRentalDataPoint } from "@/components/charts/rental-volume-chart";
import { RelocatedVolumeChart } from "@/components/charts/relocated-volume-chart";
import { TotalRentalsVolumeChart } from "@/components/charts/total-rentals-volume-chart";
import { translateMotorcycleStatus } from "@/lib/utils";
import { parseISO, isValid, getYear, getMonth } from "date-fns";

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => ({
  value: (currentYear - i).toString(),
  label: (currentYear - i).toString(),
}));

const statusColorsForChart: Record<string, string> = {
  'active': 'hsl(var(--chart-5))',
  'alugada': 'hsl(var(--chart-2))',
  'inadimplente': 'hsl(var(--destructive))',
  'manutencao': 'hsl(var(--chart-4))',
  'recolhida': 'hsl(var(--chart-1))',
  'relocada': 'hsl(var(--chart-3))',
  'N/Definido': 'hsl(var(--muted-foreground))',
};

const monthAbbreviations = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export default function RelatoriosPage() {
  const [allMotorcycles, setAllMotorcycles] = useState<Motorcycle[]>([]);
  const [kpiData, setKpiData] = useState<Kpi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  const [statusDistributionData, setStatusDistributionData] = useState<StatusDistributionDataPoint[] | null>(null);
  const { toast } = useToast();

  const [monthlyRecoveryData, setMonthlyRecoveryData] = useState<ChartDataPoint[] | null>(null);
  const [monthlyRentalData, setMonthlyRentalData] = useState<MonthlyRentalDataPoint[] | null>(null);
  const [monthlyRelocatedData, setMonthlyRelocatedData] = useState<ChartDataPoint[] | null>(null);
  const [monthlyTotalRentalsData, setMonthlyTotalRentalsData] = useState<ChartDataPoint[] | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToMotorcycles((motosFromDB) => {
      if (Array.isArray(motosFromDB)) {
         const updatedMotorcycles = motosFromDB.map(moto =>
          moto.status === undefined ? { ...moto, status: 'alugada' as MotorcycleStatus } : moto
        );
        setAllMotorcycles(updatedMotorcycles);
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

    const numericSelectedYear = parseInt(selectedYear, 10);

    // KPIs calculation (geral, não depende do ano selecionado, exceto talvez para as descrições de tendência)
    const totalMotos = allMotorcycles.length;
    const motosAlugadas = allMotorcycles.filter(m => m.status === 'alugada').length;
    const motosInadimplentes = allMotorcycles.filter(m => m.status === 'inadimplente').length;
    const percInadimplencia = totalMotos > 0 ? (motosInadimplentes / totalMotos) * 100 : 0;
    const taxaAlugadas = totalMotos > 0 ? (motosAlugadas / totalMotos) * 100 : 0;
    const valorPendente = allMotorcycles
      .filter(m => m.status === 'inadimplente' && typeof m.valorDiaria === 'number')
      .reduce((sum, moto) => sum + (moto.valorDiaria || 0), 0);

    setKpiData([
      { title: "Total de Motos", value: totalMotos.toString(), icon: TrendingUp, description: "Frota ativa total", color: "text-blue-700", iconBgColor: "bg-blue-100", iconColor: "text-blue-700" },
      { title: "Motos Alugadas", value: motosAlugadas.toString(), icon: BarChartBig, description: `Taxa de Ocupação: ${taxaAlugadas.toFixed(0)}%`, color: "text-green-700", iconBgColor: "bg-green-100", iconColor: "text-green-700" },
      { title: "% Inadimplência", value: `${percInadimplencia.toFixed(1)}%`, icon: Clock, description: "Percentual de inadimplentes", color: "text-red-700", iconBgColor: "bg-red-100", iconColor: "text-red-700" },
      { title: "Valor Pendente", value: `R$ ${valorPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: Download, description: "Total de diárias em aberto", color: "text-orange-700", iconBgColor: "bg-orange-100", iconColor: "text-orange-700" },
    ]);

    // Status Distribution Chart (geral, não depende do ano selecionado)
    const statusCounts: Record<string, number> = {};
    allMotorcycles.forEach(moto => {
      const statusKey = moto.status || 'N/Definido';
      statusCounts[statusKey] = (statusCounts[statusKey] || 0) + 1;
    });
    const distData = Object.entries(statusCounts).map(([status, count]) => ({
      status: translateMotorcycleStatus(status as MotorcycleStatus | undefined),
      count: count,
      fill: statusColorsForChart[status as MotorcycleStatus || 'N/Definido'] || 'hsl(var(--muted-foreground))',
    }));
    setStatusDistributionData(distData);


    // Monthly Charts Data (depende do ano selecionado)
    const recoveryCounts = Array(12).fill(0);
    const rentalNovasCounts = Array(12).fill(0);
    const rentalUsadasCounts = Array(12).fill(0);
    const relocatedCounts = Array(12).fill(0);
    const totalRentalsCounts = Array(12).fill(0);

    allMotorcycles.forEach(moto => {
      if (moto.data_ultima_mov) {
        try {
          const movDate = parseISO(moto.data_ultima_mov);
          if (isValid(movDate) && getYear(movDate) === numericSelectedYear) {
            const monthIndex = getMonth(movDate); 

            if (moto.status === 'recolhida') recoveryCounts[monthIndex]++;
            if (moto.status === 'alugada') {
              if (moto.type === 'nova') rentalNovasCounts[monthIndex]++;
              else if (moto.type === 'usada') rentalUsadasCounts[monthIndex]++;
              else rentalNovasCounts[monthIndex]++; // Default to nova if type undefined
              totalRentalsCounts[monthIndex]++;
            }
            if (moto.status === 'relocada') {
              relocatedCounts[monthIndex]++;
              totalRentalsCounts[monthIndex]++; 
            }
          }
        } catch (e) { console.error("Error parsing date for monthly charts (Relatorios): ", moto.data_ultima_mov, e); }
      }
    });

    setMonthlyRecoveryData(monthAbbreviations.map((m, i) => ({ month: m, count: recoveryCounts[i] })));
    setMonthlyRentalData(monthAbbreviations.map((m, i) => ({ month: m, novas: rentalNovasCounts[i], usadas: rentalUsadasCounts[i] })));
    setMonthlyRelocatedData(monthAbbreviations.map((m, i) => ({ month: m, count: relocatedCounts[i] })));
    setMonthlyTotalRentalsData(monthAbbreviations.map((m, i) => ({ month: m, count: totalRentalsCounts[i] })));


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
        <SelectTrigger id="year-filter" className="w-[120px]">
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

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 mt-8">
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieChart className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="font-headline">Distribuição de Motos por Status</CardTitle>
                <CardDescription>Contagem de motocicletas em cada status (geral).</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <StatusDistributionChart data={statusDistributionData} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <PageCalendarIcon className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="font-headline">Volume Mensal - Motos Recuperadas ({selectedYear})</CardTitle>
                <CardDescription>Contagem mensal para o ano selecionado (Status: Recolhida)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <RecoveryVolumeChart data={monthlyRecoveryData} />
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <PageCalendarIcon className="h-6 w-6 text-green-600" />
               <div>
                <CardTitle className="font-headline">Volume Mensal - Motos Alugadas ({selectedYear})</CardTitle>
                <CardDescription>Novas vs. Usadas para o ano selecionado</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <RentalVolumeChart data={monthlyRentalData} />
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <PageCalendarIcon className="h-6 w-6 text-orange-500" />
              <div>
                <CardTitle className="font-headline">Volume Mensal - Motos Relocadas ({selectedYear})</CardTitle>
                <CardDescription>Contagem mensal para o ano selecionado</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <RelocatedVolumeChart data={monthlyRelocatedData} />
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-teal-500" />
               <div>
                <CardTitle className="font-headline">Volume Total de Locações ({selectedYear})</CardTitle>
                <CardDescription>Alugadas + Relocadas para o ano selecionado</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <TotalRentalsVolumeChart data={monthlyTotalRentalsData} />
          </CardContent>
        </Card>
      </div>

    </DashboardLayout>
  );
}
    