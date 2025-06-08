
"use client";

import { useEffect, useState } from "react";
import Link from "next/link"; // Added import for Link
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { KpiSection, kpiDataTop, kpiDataBottom } from "@/components/dashboard/kpi-section";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { LineChart, CalendarDays } from "lucide-react"; 
import type { Motorcycle, MotorcycleStatus, Kpi } from "@/lib/types";
import { format, isValid, parseISO, getMonth, getYear } from 'date-fns';
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

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState('');
  const [allMotorcycles, setAllMotorcycles] = useState<Motorcycle[]>([]);
  const [dynamicKpiDataTop, setDynamicKpiDataTop] = useState<Kpi[]>(kpiDataTop);
  const [dynamicKpiDataBottom, setDynamicKpiDataBottom] = useState<Kpi[]>(kpiDataBottom);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState<string>(currentFullYear.toString());


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
        const movDate = parseISO(moto.data_ultima_mov);
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
      
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>Próximos Passos</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">
                Esta é a visão principal do dashboard. Para análises mensais detalhadas e outros relatórios, 
                acesse a página de <Link href="/relatorios" className="text-primary hover:underline">Relatórios</Link>.
            </p>
             <div className="mt-6 p-6 border rounded-lg bg-muted/30 shadow-inner min-h-[200px] flex items-center justify-center">
                <p className="text-muted-foreground text-center">
                    Outros componentes e visualizações de dados podem ser adicionados aqui conforme necessário.
                    <br />
                    (Ex: Alertas importantes, atalhos rápidos, etc.)
                </p>
            </div>
        </CardContent>
      </Card>

    </DashboardLayout>
  );
}
    
