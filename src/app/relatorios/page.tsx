
"use client";

import { useEffect, useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, FileSpreadsheet, CalendarDays as PageCalendarIcon, Users, Bike, BarChartBig, SatelliteDish, DollarSign } from "lucide-react";
import type { Motorcycle, Kpi, MotorcycleStatus } from "@/lib/types";
import { subscribeToMotorcycles } from '@/lib/firebase/motorcycleService';
import { subscribeToRastreadores, RastreadorData } from '@/lib/firebase/rastreadorService';
import { useToast } from "@/hooks/use-toast";
import { RecoveryVolumeChart } from "@/components/charts/recovery-volume-chart";
import { TrackerInstallationRevenueChart } from "@/components/charts/tracker-installation-revenue-chart";
import { CombinedRentalChart } from "@/components/charts/combined-rental-chart";
import { translateMotorcycleStatus } from "@/lib/utils";
import { parseISO, isValid, getYear, getMonth } from "date-fns";

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => ({
  value: (currentYear - i).toString(),
  label: (currentYear - i).toString(),
}));

const statusColorsForChart: Record<string, string> = {
  'active': 'hsl(var(--chart-5))',
  'alugada': 'hsl(var(--chart-2))', // Kept for reference
  'inadimplente': 'hsl(var(--destructive))',
  'manutencao': 'hsl(var(--chart-4))',
  'recolhida': 'hsl(var(--chart-1))',
  'relocada': 'hsl(var(--chart-3))', // Kept for reference
  'locadas': 'hsl(var(--chart-2))', // New combined category uses blue
  'indisponivel_rastreador': 'hsl(25 95% 53%)', // Orange
  'indisponivel_emplacamento': 'hsl(271 81% 56%)', // Purple
  'N/Definido': 'hsl(var(--muted-foreground))',
};

const monthAbbreviations = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const monthFullNames = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

const processMotorcycleData = (motorcycles: Motorcycle[], year: number) => {
    const uniqueMotorcyclesByPlaca: { [placa: string]: Motorcycle } = {};
    motorcycles.forEach(moto => {
      if (!moto.placa) return;
      const existingMoto = uniqueMotorcyclesByPlaca[moto.placa];
      if (!existingMoto || (moto.data_ultima_mov && existingMoto.data_ultima_mov && new Date(moto.data_ultima_mov) > new Date(existingMoto.data_ultima_mov)) || (moto.data_ultima_mov && !existingMoto.data_ultima_mov)) {
        uniqueMotorcyclesByPlaca[moto.placa] = moto;
      }
    });
    const representativeMotorcycles = Object.values(uniqueMotorcyclesByPlaca);
    const totalUniqueMotorcycles = representativeMotorcycles.length;

    const motosAlugadasCount = representativeMotorcycles.filter(m => m.status === 'alugada').length;
    const motosRelocadasCount = representativeMotorcycles.filter(m => m.status === 'relocada').length;
    const totalLocacoesCount = motosAlugadasCount + motosRelocadasCount;
    const taxaLocacoes = totalUniqueMotorcycles > 0 ? (totalLocacoesCount / totalUniqueMotorcycles) * 100 : 0;

    // Aggregate 'alugada' and 'relocada' into 'locadas'
    const statusCounts: Record<string, number> = {};
    representativeMotorcycles.forEach(moto => {
      const statusKey = moto.status || 'N/Definido';
      if (statusKey === 'alugada' || statusKey === 'relocada') {
        statusCounts['locadas'] = (statusCounts['locadas'] || 0) + 1;
      } else {
        statusCounts[statusKey] = (statusCounts[statusKey] || 0) + 1;
      }
    });
    
    // Custom translation for the new combined status
    const translateAggregatedStatus = (status: string) => {
        if (status === 'locadas') return 'Locadas';
        return translateMotorcycleStatus(status as MotorcycleStatus | undefined);
    };

    const statusDistributionData = Object.entries(statusCounts).filter(([, count]) => count > 0).map(([statusKey, count]) => ({
        name: translateAggregatedStatus(statusKey),
        value: totalUniqueMotorcycles > 0 ? parseFloat(((count / totalUniqueMotorcycles) * 100).toFixed(1)) : 0,
        count: count,
        fill: statusColorsForChart[statusKey] || 'hsl(var(--muted-foreground))',
    }));
    
    const recoveryCounts = Array(12).fill(0);
    const rentalCounts = Array(12).fill(0);
    const relocatedCounts = Array(12).fill(0);

    motorcycles.forEach(moto => {
        if (moto.data_ultima_mov) {
            try {
                const movDate = parseISO(moto.data_ultima_mov);
                if (isValid(movDate) && getYear(movDate) === year) {
                    const monthIndex = getMonth(movDate);
                    if (moto.status === 'recolhida') recoveryCounts[monthIndex]++;
                    if (moto.status === 'alugada') rentalCounts[monthIndex]++;
                    if (moto.status === 'relocada') relocatedCounts[monthIndex]++;
                }
            } catch (e) { console.error("Error parsing date for motorcycle charts: ", moto.data_ultima_mov, e); }
        }
    });

    const combinedRentalData = monthAbbreviations.map((m, i) => {
      const total = rentalCounts[i] + relocatedCounts[i];
      return {
        month: m,
        alugadas: rentalCounts[i],
        relocadas: relocatedCounts[i],
        total: total,
      }
    });

    const earliestDateByPlaca = new Map<string, Date>();
    motorcycles.forEach(moto => {
        if (moto.placa) {
            const dateString = moto.data_criacao || moto.data_ultima_mov;
            if (dateString) {
                try {
                    const date = parseISO(dateString);
                    if (isValid(date)) {
                        const existingDate = earliestDateByPlaca.get(moto.placa);
                        if (!existingDate || date < existingDate) {
                            earliestDateByPlaca.set(moto.placa, date);
                        }
                    }
                } catch (e) { /* ignore invalid dates */ }
            }
        }
    });

    const monthlyNewMotorcycles = Array(12).fill(0);
    let baseCountForYearStart = 0;

    earliestDateByPlaca.forEach(date => {
        const entryYear = getYear(date);
        if (entryYear < year) {
            baseCountForYearStart++;
        } else if (entryYear === year) {
            const monthIndex = getMonth(date);
            monthlyNewMotorcycles[monthIndex]++;
        }
    });

    let cumulativeCount = baseCountForYearStart;
    const baseGrowthData = monthAbbreviations.map((month, index) => {
        cumulativeCount += monthlyNewMotorcycles[index];
        return { month, cumulativeCount };
    });

    return {
        kpi: {
            total: totalUniqueMotorcycles.toString(),
            locacoes: totalLocacoesCount.toString(),
            ocupacao: `${taxaLocacoes.toFixed(0)}%`,
        },
        statusDistribution: statusDistributionData,
        monthlyRecovery: monthAbbreviations.map((m, i) => ({ month: m, count: recoveryCounts[i] })),
        combinedRental: combinedRentalData,
        baseGrowth: baseGrowthData,
    };
};

const processTrackerData = (rastreadores: RastreadorData[], year: number) => {
    const uniqueChassis = new Map<string, { valor: number }>();
    rastreadores.forEach(r => {
        if (r.chassi) {
            const valor = parseFloat(r.valor) || 0;
            if (!uniqueChassis.has(r.chassi) || valor > (uniqueChassis.get(r.chassi)?.valor || 0)) {
                uniqueChassis.set(r.chassi, { valor });
            }
        }
    });

    const totalInstallations = uniqueChassis.size;
    const totalRevenue = Array.from(uniqueChassis.values()).reduce((acc, r) => acc + r.valor, 0);

    const monthlyInstallations = Array(12).fill(0);
    const monthlyRevenue = Array(12).fill(0);
    const monthlyUniqueChassis: Map<string, number>[] = Array.from({ length: 12 }, () => new Map());

    rastreadores.forEach(rastreador => {
        const mesIndex = monthFullNames.indexOf(rastreador.mes.toLowerCase());
        if (mesIndex !== -1 && rastreador.chassi) {
            const valor = parseFloat(rastreador.valor) || 0;
            const currentMonthChassis = monthlyUniqueChassis[mesIndex];

            if (!currentMonthChassis.has(rastreador.chassi) || valor > (currentMonthChassis.get(rastreador.chassi) || 0)) {
                 currentMonthChassis.set(rastreador.chassi, valor);
            }
        }
    });

    monthlyUniqueChassis.forEach((monthChassis, mesIndex) => {
        monthlyInstallations[mesIndex] = monthChassis.size;
        monthlyRevenue[mesIndex] = Array.from(monthChassis.values()).reduce((acc, val) => acc + val, 0);
    });

    const monthlyInstallationRevenue = monthAbbreviations.map((m, i) => ({
      month: m,
      count: monthlyInstallations[i],
      revenue: monthlyRevenue[i],
    }));

    return {
        kpi: {
            totalInstallations: totalInstallations.toString(),
            totalRevenue: `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        },
        monthlyInstallationRevenue,
    };
};


export default function RelatoriosPage() {
  const [allMotorcycles, setAllMotorcycles] = useState<Motorcycle[]>([]);
  const [allRastreadores, setAllRastreadores] = useState<RastreadorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    const unsubMotorcycles = subscribeToMotorcycles((data) => {
      setAllMotorcycles(Array.isArray(data) ? data : []);
      setIsLoading(false); 
    });
    const unsubRastreadores = subscribeToRastreadores((data) => {
      setAllRastreadores(Array.isArray(data) ? data : []);
    });
    return () => {
      unsubMotorcycles();
      unsubRastreadores();
    };
  }, []);

  const motorcycleReport = useMemo(() => processMotorcycleData(allMotorcycles, parseInt(selectedYear, 10)), [allMotorcycles, selectedYear]);
  const trackerReport = useMemo(() => processTrackerData(allRastreadores, parseInt(selectedYear, 10)), [allRastreadores, selectedYear]);

  const kpiData: Kpi[] = [
    { title: "Total de Motos", value: motorcycleReport.kpi.total, icon: Users, description: "Frota ativa", color: "text-blue-700" },
    { title: "Total de Locações", value: motorcycleReport.kpi.locacoes, icon: Bike, description: `Ocupação: ${motorcycleReport.kpi.ocupacao}`, color: "text-green-700" },
    { title: "Rastreadores Instalados", value: trackerReport.kpi.totalInstallations, icon: SatelliteDish, description: "Total de unidades", color: "text-indigo-700" },
    { title: "Receita de Rastreadores", value: trackerReport.kpi.totalRevenue, icon: DollarSign, description: "Soma de todas instalações", color: "text-green-600" },
  ];

  const handleExportExcel = () => toast({ title: "Funcionalidade em Desenvolvimento" });
  
  const pageActions = (
    <div className="flex items-center gap-2">
      <Select value={selectedYear} onValueChange={setSelectedYear}>
        <SelectTrigger id="year-filter" className="w-[120px]"><SelectValue placeholder="Ano" /></SelectTrigger>
        <SelectContent>{years.map(year => <SelectItem key={year.value} value={year.value}>{year.label}</SelectItem>)}</SelectContent>
      </Select>
      <Button onClick={handleExportExcel} variant="default" className="bg-green-600 hover:bg-green-700 text-white">
        <FileSpreadsheet className="mr-2 h-4 w-4" /> Exportar
      </Button>
    </div>
  );

  if (isLoading) return <DashboardLayout><PageHeader title="Relatórios e Análises" description="Insights e métricas operacionais" actions={pageActions} /><div className="flex justify-center items-center h-96"><p>Carregando dados dos relatórios...</p></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <PageHeader title="Relatórios e Análises" description="Insights e métricas operacionais" icon={BarChart3} iconContainerClassName="bg-primary" actions={pageActions} />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-6">
        {kpiData.map((kpi) => <KpiCard key={kpi.title} {...kpi} />)}
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 mt-8">
        <Card className="shadow-lg lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChartBig className="h-6 w-6 text-blue-500" />
              <div>
                <CardTitle className="font-headline">Volume e Receita de Instalações de Rastreadores ({selectedYear})</CardTitle>
                <CardDescription>Volume de instalações (barras) e receita correspondente (linha).</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <TrackerInstallationRevenueChart data={trackerReport.monthlyInstallationRevenue} />
          </CardContent>
        </Card>
        <Card className="shadow-lg lg:col-span-2">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Bike className="h-6 w-6 text-blue-600" />
                    <div>
                        <CardTitle className="font-headline">Análise Mensal de Locações ({selectedYear})</CardTitle>
                        <CardDescription>Volume de motos alugadas e relocadas (barras) e o total de locações (linha).</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <CombinedRentalChart data={motorcycleReport.combinedRental} />
            </CardContent>
        </Card>
        <Card className="shadow-lg"><CardHeader><div className="flex items-center gap-2"><PageCalendarIcon className="h-6 w-6 text-primary" /><div><CardTitle className="font-headline">Volume Mensal - Motos Recuperadas ({selectedYear})</CardTitle><CardDescription>Contagem mensal (Status: Recolhida)</CardDescription></div></div></CardHeader><CardContent><RecoveryVolumeChart data={motorcycleReport.monthlyRecovery} /></CardContent></Card>
      </div>
    </DashboardLayout>
  );
}
