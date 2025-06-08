
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { KpiSection, kpiDataTop, kpiDataBottom } from "@/components/dashboard/kpi-section";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { LineChart, CalendarDays, TrendingUp } from "lucide-react"; 
import type { Motorcycle, MotorcycleStatus, Kpi } from "@/lib/types";
import { format, isValid, parseISO, getMonth, getYear, subDays, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { subscribeToMotorcycles } from '@/lib/firebase/motorcycleService';
import { RecoveryVolumeChart } from "@/components/charts/recovery-volume-chart";
import { RentalVolumeChart, type MonthlyRentalDataPoint } from "@/components/charts/rental-volume-chart";
import { RelocatedVolumeChart } from "@/components/charts/relocated-volume-chart";
import { TotalRentalsVolumeChart } from "@/components/charts/total-rentals-volume-chart";
import type { ChartDataPoint } from "@/lib/types";


const pageMonths = [
  { value: "0", label: "Janeiro" }, { value: "1", label: "Fevereiro" }, { value: "2", label: "Março" },
  { value: "3", label: "Abril" }, { value: "4", label: "Maio" }, { value: "5", label: "Junho" },
  { value: "6", label: "Julho" }, { value: "7", label: "Agosto" }, { value: "8", label: "Setembro" },
  { value: "9", label: "Outubro" }, { value: "10", label: "Novembro" }, { value: "11", label: "Dezembro" },
];

const currentFullYear = new Date().getFullYear();
const pageYears = Array.from({ length: 5 }, (_, i) => ({
  value: (currentFullYear - i).toString(),
  label: (currentFullYear - i).toString(),
}));

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState('');
  const [allMotorcycles, setAllMotorcycles] = useState<Motorcycle[]>([]);
  const [dynamicKpiDataTop, setDynamicKpiDataTop] = useState<Kpi[]>(kpiDataTop);
  const [dynamicKpiDataBottom, setDynamicKpiDataBottom] = useState<Kpi[]>(kpiDataBottom);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState<string>(currentFullYear.toString());

  const [dailyRecoveryData, setDailyRecoveryData] = useState<ChartDataPoint[] | null>(null);
  const [dailyRentalData, setDailyRentalData] = useState<MonthlyRentalDataPoint[] | null>(null);
  const [dailyRelocatedData, setDailyRelocatedData] = useState<ChartDataPoint[] | null>(null);
  const [dailyTotalRentalsData, setDailyTotalRentalsData] = useState<ChartDataPoint[] | null>(null);


  useEffect(() => {
    const updateTimestamp = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }));
    };
    updateTimestamp();
    const intervalId = setInterval(updateTimestamp, 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToMotorcycles((motosFromDB) => {
      if (Array.isArray(motosFromDB)) {
        const updatedMotorcycles = motosFromDB.map(moto =>
          moto.status === undefined ? { ...moto, status: 'alugada' as MotorcycleStatus } : moto
        );
        setAllMotorcycles(updatedMotorcycles);
      } else {
        console.warn("Data from subscribeToMotorcycles (dashboard page) was not an array:", motosFromDB);
        setAllMotorcycles([]);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Update Top KPIs (Daily focus)
  useEffect(() => {
    if (isLoading || !Array.isArray(allMotorcycles)) return;

    const todayStr = format(new Date(), 'yyyy-MM-dd');

    const motosAlugadasHojeCount = allMotorcycles.filter(
      moto => moto.status === 'alugada' && moto.data_ultima_mov === todayStr
    ).length;

    const motosRecuperadasHojeCount = allMotorcycles.filter(
      moto => moto.status === 'recolhida' && moto.data_ultima_mov === todayStr
    ).length;

    const motosRelocadasHojeCount = allMotorcycles.filter(
      moto => moto.status === 'relocada' && moto.data_ultima_mov === todayStr
    ).length;

    const motosParadas7DiasCount = allMotorcycles.filter(
      moto => typeof moto.tempo_ocioso_dias === 'number' && moto.tempo_ocioso_dias >= 7
    ).length;

    setDynamicKpiDataTop(prevKpis => prevKpis.map(kpi => {
      if (kpi.title === "Motos Alugadas Hoje") {
        return { ...kpi, value: motosAlugadasHojeCount.toString() };
      }
      if (kpi.title === "Motos Recuperadas Hoje") {
        return { ...kpi, value: motosRecuperadasHojeCount.toString() };
      }
      if (kpi.title === "Motos Relocadas Hoje") {
        return { ...kpi, value: motosRelocadasHojeCount.toString() };
      }
      if (kpi.title === "Motos Paradas +7 Dias") {
        return { ...kpi, value: motosParadas7DiasCount.toString() };
      }
      return kpi;
    }));
    
  }, [allMotorcycles, isLoading]);

  // Update Bottom KPIs (Period focus)
  useEffect(() => {
    if (isLoading || !Array.isArray(allMotorcycles)) return;

    const numericMonth = parseInt(selectedMonth, 10);
    const numericYear = parseInt(selectedYear, 10);

    const motosFiltradasPeriodo = allMotorcycles.filter(moto => {
      if (!moto.data_ultima_mov) return false;
      try {
        const movDate = parseISO(moto.data_ultima_mov); // data_ultima_mov is YYYY-MM-DD
        return isValid(movDate) && getMonth(movDate) === numericMonth && getYear(movDate) === numericYear;
      } catch {
        return false;
      }
    });

    const disponiveisPeriodo = motosFiltradasPeriodo.filter(m => m.status === 'active').length;
    const alugadasPeriodo = motosFiltradasPeriodo.filter(m => m.status === 'alugada').length;
    const manutencaoPeriodo = motosFiltradasPeriodo.filter(m => m.status === 'manutencao').length;
    const relocadasPeriodo = motosFiltradasPeriodo.filter(m => m.status === 'relocada').length;

    setDynamicKpiDataBottom(prevKpis => prevKpis.map(kpi => {
      if (kpi.title === "Motos Disponíveis") {
        return { ...kpi, value: disponiveisPeriodo.toString(), description: `disponíveis em ${pageMonths[numericMonth].label}/${numericYear}` };
      }
      if (kpi.title === "Motos Alugadas") {
        return { ...kpi, value: alugadasPeriodo.toString(), description: `alugadas em ${pageMonths[numericMonth].label}/${numericYear}` };
      }
      if (kpi.title === "Em Manutenção") {
        return { ...kpi, value: manutencaoPeriodo.toString(), description: `manutenção em ${pageMonths[numericMonth].label}/${numericYear}` };
      }
      if (kpi.title === "Motos Relocadas") {
        return { ...kpi, value: relocadasPeriodo.toString(), description: `relocadas em ${pageMonths[numericMonth].label}/${numericYear}` };
      }
      return kpi;
    }));

  }, [allMotorcycles, isLoading, selectedMonth, selectedYear]);

  // Update Daily Charts Data (Last 30 days)
  useEffect(() => {
    if (isLoading || !Array.isArray(allMotorcycles) || allMotorcycles.length === 0) {
      setDailyRecoveryData([]);
      setDailyRentalData([]);
      setDailyRelocatedData([]);
      setDailyTotalRentalsData([]);
      return;
    }

    const endDate = new Date();
    const startDate = subDays(endDate, 29); // 30 days including today
    const dateInterval = eachDayOfInterval({ start: startDate, end: endDate });

    const dailyDatesFormatted = dateInterval.map(d => format(d, 'yyyy-MM-dd'));
    // Use 'dd/MM' for display, matching the ChartDataPoint type expectation for 'month' field in this context
    const dailyDisplayDates = dateInterval.map(d => format(d, 'dd/MM', { locale: ptBR }));


    const dailyRecoveryCounts: { [date: string]: number } = {};
    const dailyRentalNovasCounts: { [date: string]: number } = {};
    const dailyRentalUsadasCounts: { [date: string]: number } = {};
    const dailyRelocatedCounts: { [date: string]: number } = {};
    const dailyTotalRentalsCounts: { [date: string]: number } = {};

    dailyDatesFormatted.forEach(dateStr => {
      dailyRecoveryCounts[dateStr] = 0;
      dailyRentalNovasCounts[dateStr] = 0;
      dailyRentalUsadasCounts[dateStr] = 0;
      dailyRelocatedCounts[dateStr] = 0;
      dailyTotalRentalsCounts[dateStr] = 0;
    });

    allMotorcycles.forEach(moto => {
      if (moto.data_ultima_mov && dailyDatesFormatted.includes(moto.data_ultima_mov)) {
        const movDateStr = moto.data_ultima_mov;
        if (moto.status === 'recolhida') {
          dailyRecoveryCounts[movDateStr]++;
        }
        if (moto.status === 'alugada') {
          if (moto.type === 'nova') dailyRentalNovasCounts[movDateStr]++;
          else if (moto.type === 'usada') dailyRentalUsadasCounts[movDateStr]++;
          else dailyRentalNovasCounts[movDateStr]++; 
          dailyTotalRentalsCounts[movDateStr]++;
        }
        if (moto.status === 'relocada') {
          dailyRelocatedCounts[movDateStr]++;
          dailyTotalRentalsCounts[movDateStr]++;
        }
      }
    });
    
    // For daily charts, the 'month' property of ChartDataPoint/MonthlyRentalDataPoint will hold 'dd/MM'
    setDailyRecoveryData(dailyDisplayDates.map((displayDate, i) => ({ month: displayDate, count: dailyRecoveryCounts[dailyDatesFormatted[i]] })));
    setDailyRentalData(dailyDisplayDates.map((displayDate, i) => ({ month: displayDate, novas: dailyRentalNovasCounts[dailyDatesFormatted[i]], usadas: dailyRentalUsadasCounts[dailyDatesFormatted[i]] })));
    setDailyRelocatedData(dailyDisplayDates.map((displayDate, i) => ({ month: displayDate, count: dailyRelocatedCounts[dailyDatesFormatted[i]] })));
    setDailyTotalRentalsData(dailyDisplayDates.map((displayDate, i) => ({ month: displayDate, count: dailyTotalRentalsCounts[dailyDatesFormatted[i]] })));

  }, [allMotorcycles, isLoading]);


  if (isLoading && allMotorcycles.length === 0) { 
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-screen">
          <p>Carregando dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <LineChart className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground font-headline">Dashboard Master Salvador</h1>
            <p className="text-muted-foreground">Visão geral da frota de motos</p>
          </div>
        </div>
        {currentTime && (
          <p className="text-sm text-muted-foreground flex items-center">
            <CalendarDays className="h-4 w-4 mr-1.5" /> 
            Atualizado em {currentTime}
          </p>
        )}
      </div>

      <KpiSection kpis={dynamicKpiDataTop} />

      <Card className="my-6 shadow">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <Label htmlFor="month-filter" className="text-sm font-medium whitespace-nowrap pt-2 sm:pt-0">
              Filtrar Status da Frota por Período:
            </Label>
            <div className="grid grid-cols-2 gap-4 sm:flex sm:flex-row">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger id="month-filter" className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  {pageMonths.map(month => (
                    <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger id="year-filter" className="w-full sm:w-[100px]">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  {pageYears.map(year => (
                    <SelectItem key={year.value} value={year.value}>{year.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <KpiSection kpis={dynamicKpiDataBottom} />

      <Separator className="my-8" />

      {/* Daily Charts Section */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 mt-8">
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="font-headline">Volume Diário - Motos Recuperadas</CardTitle>
                <CardDescription className="flex items-center gap-1 text-sm">
                  <TrendingUp className="h-4 w-4" /> Últimos 30 dias
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <RecoveryVolumeChart data={dailyRecoveryData} />
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-6 w-6 text-blue-600" /> 
               <div>
                <CardTitle className="font-headline">Volume Diário - Motos Alugadas</CardTitle>
                <CardDescription className="flex items-center gap-1 text-sm">
                  <TrendingUp className="h-4 w-4" /> Últimos 30 dias (Novas vs. Usadas)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <RentalVolumeChart data={dailyRentalData} />
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-6 w-6 text-orange-500" />
              <div>
                <CardTitle className="font-headline">Volume Diário - Motos Relocadas</CardTitle>
                 <CardDescription className="flex items-center gap-1 text-sm">
                  <TrendingUp className="h-4 w-4" /> Últimos 30 dias
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <RelocatedVolumeChart data={dailyRelocatedData} />
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-6 w-6 text-teal-500" />
               <div>
                <CardTitle className="font-headline">Volume Diário - Total de Locações</CardTitle>
                <CardDescription className="flex items-center gap-1 text-sm">
                  <TrendingUp className="h-4 w-4" /> Últimos 30 dias (Alugadas + Relocadas)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <TotalRentalsVolumeChart data={dailyTotalRentalsData} />
          </CardContent>
        </Card>
      </div>
      
      <Separator className="my-8" />
      
      {/* Próximos Passos Card Removido */}

    </DashboardLayout>
  );
}
    
