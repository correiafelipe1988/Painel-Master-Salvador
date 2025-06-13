
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

// ... (constantes pageMonths e pageYears permanecem as mesmas)
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

  // Estado dos gráficos
  const [dailyRecoveryData, setDailyRecoveryData] = useState<ChartDataPoint[]>([]);
  const [dailyRentalData, setDailyRentalData] = useState<MonthlyRentalDataPoint[]>([]);
  const [dailyRelocatedData, setDailyRelocatedData] = useState<ChartDataPoint[]>([]);
  const [dailyTotalRentalsData, setDailyTotalRentalsData] = useState<ChartDataPoint[]>([]);


  useEffect(() => {
    const updateTimestamp = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
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
        setAllMotorcycles(motosFromDB);
      } else {
        setAllMotorcycles([]);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Efeito para KPIs e Gráficos
  useEffect(() => {
    if (isLoading || !Array.isArray(allMotorcycles)) {
        // Garante que os gráficos mostrem "carregando" se não houver dados
        setDailyRecoveryData([]);
        setDailyRentalData([]);
        setDailyRelocatedData([]);
        setDailyTotalRentalsData([]);
        return;
    };

    // --- Lógica de KPIs ---
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const motosAlugadasHoje = allMotorcycles.filter(m => m.status === 'alugada' && m.data_ultima_mov === todayStr).length;
    const motosRecuperadasHoje = allMotorcycles.filter(m => m.status === 'recolhida' && m.data_ultima_mov === todayStr).length;
    const motosRelocadasHoje = allMotorcycles.filter(m => m.status === 'relocada' && m.data_ultima_mov === todayStr).length;
    const motosParadas7Dias = allMotorcycles.filter(m => typeof m.tempo_ocioso_dias === 'number' && m.tempo_ocioso_dias >= 7).length;

    setDynamicKpiDataTop(prev => prev.map(kpi => {
        if (kpi.title === "Motos Alugadas Hoje") return { ...kpi, value: motosAlugadasHoje.toString() };
        if (kpi.title === "Motos Recuperadas Hoje") return { ...kpi, value: motosRecuperadasHoje.toString() };
        if (kpi.title === "Motos Relocadas Hoje") return { ...kpi, value: motosRelocadasHoje.toString() };
        if (kpi.title === "Motos Paradas +7 Dias") return { ...kpi, value: motosParadas7Dias.toString() };
        return kpi;
    }));

    // --- Lógica de Gráficos (Últimos 30 dias) ---
    const endDate = new Date();
    const startDate = subDays(endDate, 29);
    const dateInterval = eachDayOfInterval({ start: startDate, end: endDate });

    const dailyData = dateInterval.map(date => {
        const formattedDate = format(date, 'yyyy-MM-dd');
        const displayDate = format(date, 'dd/MM');

        const motosDoDia = allMotorcycles.filter(m => m.data_ultima_mov === formattedDate);

        const recoveryCount = motosDoDia.filter(m => m.status === 'recolhida').length;
        const rentalNovasCount = motosDoDia.filter(m => m.status === 'alugada' && (m.type === 'nova' || !m.type)).length;
        const rentalUsadasCount = motosDoDia.filter(m => m.status === 'alugada' && m.type === 'usada').length;
        const relocatedCount = motosDoDia.filter(m => m.status === 'relocada').length;
        const totalRentalsCount = rentalNovasCount + rentalUsadasCount + relocatedCount;
        
        return {
            displayDate,
            recoveryCount,
            rentalNovasCount,
            rentalUsadasCount,
            relocatedCount,
            totalRentalsCount,
        };
    });

    setDailyRecoveryData(dailyData.map(d => ({ month: d.displayDate, count: d.recoveryCount })));
    setDailyRentalData(dailyData.map(d => ({ month: d.displayDate, novas: d.rentalNovasCount, usadas: d.rentalUsadasCount })));
    setDailyRelocatedData(dailyData.map(d => ({ month: d.displayDate, count: d.relocatedCount })));
    setDailyTotalRentalsData(dailyData.map(d => ({ month: d.displayDate, count: d.totalRentalsCount })));

  }, [allMotorcycles, isLoading]);
  
  // Efeito para KPIs de período (separado para clareza)
  useEffect(() => {
    if (isLoading || !Array.isArray(allMotorcycles)) return;

    const numericMonth = parseInt(selectedMonth, 10);
    const numericYear = parseInt(selectedYear, 10);

    const motosFiltradasPeriodo = allMotorcycles.filter(moto => {
        if (!moto.data_ultima_mov) return false;
        try {
            const movDate = parseISO(moto.data_ultima_mov);
            return isValid(movDate) && getMonth(movDate) === numericMonth && getYear(movDate) === numericYear;
        } catch { return false; }
    });
    
    setDynamicKpiDataBottom(prev => prev.map(kpi => {
        const desc = `em ${pageMonths[numericMonth].label}/${numericYear}`;
        if (kpi.title === "Motos Disponíveis") return { ...kpi, value: motosFiltradasPeriodo.filter(m => m.status === 'active').length.toString(), description: desc };
        if (kpi.title === "Motos Alugadas") return { ...kpi, value: motosFiltradasPeriodo.filter(m => m.status === 'alugada').length.toString(), description: desc };
        if (kpi.title === "Em Manutenção") return { ...kpi, value: motosFiltradasPeriodo.filter(m => m.status === 'manutencao').length.toString(), description: desc };
        if (kpi.title === "Motos Relocadas") return { ...kpi, value: motosFiltradasPeriodo.filter(m => m.status === 'relocada').length.toString(), description: desc };
        return kpi;
    }));

  }, [allMotorcycles, isLoading, selectedMonth, selectedYear]);


  if (isLoading) { 
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
    </DashboardLayout>
  );
}
