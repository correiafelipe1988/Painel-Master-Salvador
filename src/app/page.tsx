
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

// Mock data for filters - replace with actual logic if needed
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
    updateTimestamp(); // Initial call
    const intervalId = setInterval(updateTimestamp, 1000); // Update every second

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []);

  return (
    <DashboardLayout>
      {/* Page Header from Reference Image */}
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

      {/* Filters Section */}
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
                <CardDescription>Últimos 30 dias</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <RecoveryVolumeChart />
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
            <RentalVolumeChart />
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
            <RelocatedVolumeChart />
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
            <MaintenanceVolumeChart />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
