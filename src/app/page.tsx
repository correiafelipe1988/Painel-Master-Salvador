
"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { KpiSection, kpiDataTop, kpiDataBottom } from "@/components/dashboard/kpi-section";
import { RecoveryVolumeChart } from "@/components/charts/recovery-volume-chart";
import { RentalVolumeChart, type MonthlyRentalDataPoint } from "@/components/charts/rental-volume-chart";
import { RelocatedVolumeChart } from "@/components/charts/relocated-volume-chart";
import { TotalRentalsVolumeChart } from "@/components/charts/total-rentals-volume-chart";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { LineChart, CalendarDays, TrendingUp } from "lucide-react"; 
import type { Motorcycle, MotorcycleStatus, ChartDataPoint, Kpi } from "@/lib/types";
import { format, isValid, parseISO } from 'date-fns';
import { subscribeToMotorcycles } from '@/lib/firebase/motorcycleService';


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

const monthAbbreviations = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];


export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState('');
  const [allMotorcycles, setAllMotorcycles] = useState<Motorcycle[]>([]);
  const [dynamicKpiDataTop, setDynamicKpiDataTop] = useState<Kpi[]>(kpiDataTop);
  const [isLoading, setIsLoading] = useState(true);

  const [monthlyRecoveryData, setMonthlyRecoveryData] = useState<ChartDataPoint[] | null>(null);
  const [monthlyRentalData, setMonthlyRentalData] = useState<MonthlyRentalDataPoint[] | null>(null);
  const [monthlyRelocatedData, setMonthlyRelocatedData] = useState<ChartDataPoint[] | null>(null);
  const [monthlyTotalRentalsData, setMonthlyTotalRentalsData] = useState<ChartDataPoint[] | null>(null);

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


  useEffect(() => {
    if (isLoading || !Array.isArray(allMotorcycles) || allMotorcycles.length === 0) {
      // Set empty state for charts if no data or loading
      const emptyMonthlyData = monthAbbreviations.map(m => ({ month: m, count: 0 }));
      const emptyMonthlyRentalData = monthAbbreviations.map(m => ({ month: m, novas: 0, usadas: 0 }));
      setMonthlyRecoveryData(emptyMonthlyData);
      setMonthlyRentalData(emptyMonthlyRentalData);
      setMonthlyRelocatedData(emptyMonthlyData);
      setMonthlyTotalRentalsData(emptyMonthlyData);
      return;
    }

    const yearToProcess = new Date().getFullYear();

    const recoveryCounts = Array(12).fill(0);
    const rentalNovasCounts = Array(12).fill(0);
    const rentalUsadasCounts = Array(12).fill(0);
    const relocatedCounts = Array(12).fill(0);
    const totalRentalsCounts = Array(12).fill(0);

    allMotorcycles.forEach(moto => {
      if (moto.data_ultima_mov) {
        try {
          const movDate = parseISO(moto.data_ultima_mov); // data_ultima_mov is YYYY-MM-DD
          if (isValid(movDate) && movDate.getFullYear() === yearToProcess) {
            const monthIndex = movDate.getMonth(); // 0 for January, 11 for December

            if (moto.status === 'recolhida') {
              recoveryCounts[monthIndex]++;
            }
            if (moto.status === 'alugada') {
              if (moto.type === 'nova') {
                rentalNovasCounts[monthIndex]++;
              } else if (moto.type === 'usada') {
                rentalUsadasCounts[monthIndex]++;
              } else { // Count as 'nova' if type is undefined for an alugada moto
                rentalNovasCounts[monthIndex]++;
              }
              totalRentalsCounts[monthIndex]++;
            }
            if (moto.status === 'relocada') {
              relocatedCounts[monthIndex]++;
              totalRentalsCounts[monthIndex]++;
            }
          }
        } catch (e) { console.error("Error parsing date for monthly charts: ", moto.data_ultima_mov, e); }
      }
    });

    setMonthlyRecoveryData(monthAbbreviations.map((m, i) => ({ month: m, count: recoveryCounts[i] })));
    setMonthlyRentalData(monthAbbreviations.map((m, i) => ({ month: m, novas: rentalNovasCounts[i], usadas: rentalUsadasCounts[i] })));
    setMonthlyRelocatedData(monthAbbreviations.map((m, i) => ({ month: m, count: relocatedCounts[i] })));
    setMonthlyTotalRentalsData(monthAbbreviations.map((m, i) => ({ month: m, count: totalRentalsCounts[i] })));

  }, [allMotorcycles, isLoading]);

  if (isLoading && !monthlyRecoveryData) { // Check one of the data states
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-screen">
          <p>Carregando dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }
  
  const currentYearStr = new Date().getFullYear().toString();

  return (
    <DashboardLayout>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <LineChart className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground font-headline">Dashboard Master Salvador</h1>
            <p className="text-muted-foreground">Gestão completa da frota de motos</p>
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
              <Select defaultValue={new Date().getMonth().toString()}>
                <SelectTrigger id="month-filter" className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  {pageMonths.map(month => (
                    <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select defaultValue={currentFullYear.toString()}>
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

      <KpiSection kpis={kpiDataBottom} />

      <Separator className="my-8" />

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="font-headline">Volume Mensal - Motos Recuperadas ({currentYearStr})</CardTitle>
                <CardDescription>Contagem mensal para o ano corrente (Status: Recolhida)</CardDescription>
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
              <CalendarDays className="h-6 w-6 text-green-600" />
               <div>
                <CardTitle className="font-headline">Volume Mensal - Motos Alugadas ({currentYearStr})</CardTitle>
                <CardDescription>Novas vs. Usadas para o ano corrente</CardDescription>
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
              <CalendarDays className="h-6 w-6 text-orange-500" />
              <div>
                <CardTitle className="font-headline">Volume Mensal - Motos Relocadas ({currentYearStr})</CardTitle>
                <CardDescription>Contagem mensal para o ano corrente</CardDescription>
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
                <CardTitle className="font-headline">Volume Total de Locações ({currentYearStr})</CardTitle>
                <CardDescription>Alugadas + Relocadas para o ano corrente</CardDescription>
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

