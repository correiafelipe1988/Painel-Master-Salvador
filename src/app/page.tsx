
"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { KpiSection, kpiDataTop, kpiDataBottom } from "@/components/dashboard/kpi-section";
import { RecoveryVolumeChart } from "@/components/charts/recovery-volume-chart";
import { RentalVolumeChart } from "@/components/charts/rental-volume-chart";
import { RelocatedVolumeChart } from "@/components/charts/relocated-volume-chart";
import { MaintenanceVolumeChart } from "@/components/charts/maintenance-volume-chart";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CalendarDays, LineChart, BarChart3, PackagePlus, ChevronsRight, Wrench } from "lucide-react";
import type { Motorcycle, MotorcycleStatus, ChartDataPoint, RentalDataPoint } from "@/lib/types";
import { parse, subDays, format, isValid, startOfDay } from 'date-fns';

const LOCAL_STORAGE_KEY = 'motorcyclesData';

const months = [
  { value: "0", label: "Janeiro" }, { value: "1", label: "Fevereiro" }, { value: "2", label: "Março" },
  { value: "3", label: "Abril" }, { value: "4", label: "Maio" }, { value: "5", label: "Junho" },
  { value: "6", label: "Julho" }, { value: "7", label: "Agosto" }, { value: "8", label: "Setembro" },
  { value: "9", label: "Outubro" }, { value: "10", label: "Novembro" }, { value: "11", label: "Dezembro" },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => ({
  value: (currentYear - i).toString(),
  label: (currentYear - i).toString(),
}));


export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState('');
  const [allMotorcycles, setAllMotorcycles] = useState<Motorcycle[]>([]);

  const [recoveryData, setRecoveryData] = useState<ChartDataPoint[] | null>(null);
  const [rentalData, setRentalData] = useState<RentalDataPoint[] | null>(null);
  const [relocatedData, setRelocatedData] = useState<ChartDataPoint[] | null>(null);
  const [maintenanceData, setMaintenanceData] = useState<ChartDataPoint[] | null>(null);

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
    try {
      const storedMotorcycles = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedMotorcycles) {
        const parsedMotorcycles: Motorcycle[] = JSON.parse(storedMotorcycles);
        const updatedMotorcycles = parsedMotorcycles.map(moto =>
          moto.status === undefined ? { ...moto, status: 'alugada' as MotorcycleStatus } : moto
        );
        setAllMotorcycles(updatedMotorcycles);
      } else {
        setAllMotorcycles([]);
      }
    } catch (error) {
      console.error("Erro ao carregar motocicletas do localStorage para o dashboard:", error);
      setAllMotorcycles([]);
    }
  }, []);

  const getLast30DaysMap = (valueFn: () => any = () => 0) => {
    const map = new Map<string, any>();
    const today = startOfDay(new Date());
    for (let i = 29; i >= 0; i--) {
      const date = subDays(today, i);
      map.set(format(date, 'dd/MM/yyyy'), valueFn());
    }
    return map;
  };

  useEffect(() => {
    if (allMotorcycles.length === 0 && recoveryData !== null) { // If motorcycles are cleared, clear charts
        setRecoveryData([]);
        setRentalData([]);
        setRelocatedData([]);
        setMaintenanceData([]);
        return;
    }
    if (allMotorcycles.length > 0) {
      const today = startOfDay(new Date());
      const thirtyDaysAgo = subDays(today, 29);

      // Process Recovery Data (status: 'recolhida')
      const dailyRecoveryCounts = getLast30DaysMap(() => 0);
      allMotorcycles.forEach(moto => {
        if (moto.status === 'recolhida' && moto.data_ultima_mov) {
          try {
            const movDate = parse(moto.data_ultima_mov, 'yyyy-MM-dd', new Date());
            if (isValid(movDate) && movDate >= thirtyDaysAgo && movDate <= today) {
              const formattedDate = format(movDate, 'dd/MM/yyyy');
              dailyRecoveryCounts.set(formattedDate, (dailyRecoveryCounts.get(formattedDate) || 0) + 1);
            }
          } catch (e) { console.error("Error parsing date for recovery chart: ", moto.data_ultima_mov, e); }
        }
      });
      setRecoveryData(Array.from(dailyRecoveryCounts, ([date, count]) => ({ date, count })));

      // Process Rental Data (status: 'alugada')
      const dailyRentalCounts = getLast30DaysMap(() => ({ nova: 0, usada: 0 }));
      allMotorcycles.forEach(moto => {
        if (moto.status === 'alugada' && moto.data_ultima_mov) {
           try {
            const movDate = parse(moto.data_ultima_mov, 'yyyy-MM-dd', new Date());
            if (isValid(movDate) && movDate >= thirtyDaysAgo && movDate <= today) {
              const formattedDate = format(movDate, 'dd/MM/yyyy');
              const entry = dailyRentalCounts.get(formattedDate);
              if (moto.type === 'nova') entry.nova++;
              else if (moto.type === 'usada') entry.usada++;
              dailyRentalCounts.set(formattedDate, entry);
            }
          } catch (e) { console.error("Error parsing date for rental chart: ", moto.data_ultima_mov, e); }
        }
      });
      setRentalData(Array.from(dailyRentalCounts, ([date, counts]) => ({ date, nova: counts.nova, usada: counts.usada })));

      // Process Relocated Data (status: 'relocada')
      const dailyRelocatedCounts = getLast30DaysMap(() => 0);
      allMotorcycles.forEach(moto => {
        if (moto.status === 'relocada' && moto.data_ultima_mov) {
          try {
            const movDate = parse(moto.data_ultima_mov, 'yyyy-MM-dd', new Date());
            if (isValid(movDate) && movDate >= thirtyDaysAgo && movDate <= today) {
              const formattedDate = format(movDate, 'dd/MM/yyyy');
              dailyRelocatedCounts.set(formattedDate, (dailyRelocatedCounts.get(formattedDate) || 0) + 1);
            }
          } catch (e) { console.error("Error parsing date for relocated chart: ", moto.data_ultima_mov, e); }
        }
      });
      setRelocatedData(Array.from(dailyRelocatedCounts, ([date, count]) => ({ date, count })));

      // Process Maintenance Data (status: 'manutencao')
      const dailyMaintenanceCounts = getLast30DaysMap(() => 0);
      allMotorcycles.forEach(moto => {
        if (moto.status === 'manutencao' && moto.data_ultima_mov) {
          try {
            const movDate = parse(moto.data_ultima_mov, 'yyyy-MM-dd', new Date());
            if (isValid(movDate) && movDate >= thirtyDaysAgo && movDate <= today) {
              const formattedDate = format(movDate, 'dd/MM/yyyy');
              dailyMaintenanceCounts.set(formattedDate, (dailyMaintenanceCounts.get(formattedDate) || 0) + 1);
            }
          } catch (e) { console.error("Error parsing date for maintenance chart: ", moto.data_ultima_mov, e); }
        }
      });
      setMaintenanceData(Array.from(dailyMaintenanceCounts, ([date, count]) => ({ date, count })));

    }
  }, [allMotorcycles]);


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

      <KpiSection kpis={kpiDataTop} />

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
                  {months.map(month => (
                    <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select defaultValue={currentYear.toString()}>
                <SelectTrigger id="year-filter" className="w-full sm:w-[100px]">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
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
              <PackagePlus className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="font-headline">Volume Diário - Motos Recuperadas</CardTitle>
                <CardDescription>Últimos 30 dias (Status: Recolhida)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <RecoveryVolumeChart data={recoveryData} />
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
               <div>
                <CardTitle className="font-headline">Volume Diário - Motos Alugadas</CardTitle>
                <CardDescription>Últimos 30 dias (Novas vs. Usadas)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <RentalVolumeChart data={rentalData} />
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ChevronsRight className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="font-headline">Volume Diário - Motos Relocadas</CardTitle>
                <CardDescription>Últimos 30 dias</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <RelocatedVolumeChart data={relocatedData} />
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wrench className="h-6 w-6 text-primary" />
               <div>
                <CardTitle className="font-headline">Volume Diário - Motos em Manutenção</CardTitle>
                <CardDescription>Últimos 30 dias</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <MaintenanceVolumeChart data={maintenanceData} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
