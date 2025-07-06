"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, CalendarDays, TrendingUp, Bike, BarChart3, PieChart as PagePieIcon, Users, CheckCircle, ArrowRight, Wrench } from "lucide-react";
import type { Motorcycle, Kpi, MotorcycleStatus } from "@/lib/types";
import { format, parseISO, isValid, getYear, getMonth, subDays, startOfDay, isSameDay, startOfMonth, endOfMonth } from 'date-fns';
import { subscribeToMotorcycles } from '@/lib/firebase/motorcycleService';
import { StatusDistributionChart } from "@/components/charts/status-distribution-chart";
import { BaseGrowthChart } from "@/components/charts/base-growth-chart";
import { CombinedRentalChart } from "@/components/charts/combined-rental-chart";
import { DailyRentalChart } from "@/components/charts/daily-rental-chart";
import { translateMotorcycleStatus } from "@/lib/utils";

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth();

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Juli', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const statusColorsForChart: Record<string, string> = {
  'active': 'hsl(var(--chart-5))',
  'locadas': 'hsl(var(--chart-2))',
  'inadimplente': 'hsl(var(--destructive))',
  'manutencao': 'hsl(var(--chart-4))',
  'recolhida': 'hsl(var(--chart-1))',
  'indisponivel_rastreador': 'hsl(25 95% 53%)', // Orange
  'indisponivel_emplacamento': 'hsl(271 81% 56%)', // Purple
  'N/Definido': 'hsl(var(--muted-foreground))',
};

const monthAbbreviations = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

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

    const statusCounts: Record<string, number> = {};
    representativeMotorcycles.forEach(moto => {
      const statusKey = moto.status || 'N/Definido';
      if (statusKey === 'alugada' || statusKey === 'relocada') {
        statusCounts['locadas'] = (statusCounts['locadas'] || 0) + 1;
      } else {
        statusCounts[statusKey] = (statusCounts[statusKey] || 0) + 1;
      }
    });
    
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
    
    const rentalCounts = Array(12).fill(0);
    const relocatedCounts = Array(12).fill(0);

    motorcycles.forEach(moto => {
        if (moto.data_ultima_mov) {
            try {
                const movDate = parseISO(moto.data_ultima_mov);
                if (isValid(movDate) && getYear(movDate) === year) {
                    const monthIndex = getMonth(movDate);
                    if (moto.status === 'alugada') rentalCounts[monthIndex]++;
                    if (moto.status === 'relocada') relocatedCounts[monthIndex]++;
                }
            } catch (e) { console.error("Error parsing date for motorcycle charts: ", moto.data_ultima_mov, e); }
        }
    });

    const combinedRentalData = monthAbbreviations.map((m, i) => ({
      month: m,
      alugadas: rentalCounts[i],
      relocadas: relocatedCounts[i],
      total: rentalCounts[i] + relocatedCounts[i],
    }));

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
        },
        statusDistribution: statusDistributionData,
        combinedRental: combinedRentalData,
        baseGrowth: baseGrowthData,
    };
};

const processDailyMotorcycleData = (motorcycles: Motorcycle[]) => {
    const today = new Date();
    const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = subDays(today, 29 - i);
        return startOfDay(date);
    });

    const dailyRentalData = last30Days.map(date => {
        const dayString = format(date, 'dd/MM');
        let alugadasCount = 0;
        let relocadasCount = 0;

        motorcycles.forEach(moto => {
            if (moto.data_ultima_mov) {
                try {
                    const movDate = parseISO(moto.data_ultima_mov);
                    if (isValid(movDate) && isSameDay(startOfDay(movDate), date)) {
                        if (moto.status === 'alugada') alugadasCount++;
                        if (moto.status === 'relocada') relocadasCount++;
                    }
                } catch (e) {
                    console.error("Error parsing date for daily motorcycle charts: ", moto.data_ultima_mov, e);
                }
            }
        });

        return {
            day: dayString,
            alugadas: alugadasCount,
            relocadas: relocadasCount,
            total: alugadasCount + relocadasCount,
        };
    });

    return dailyRentalData;
};

// Função para processar dados do dia atual
const processTodayData = (motorcycles: Motorcycle[]) => {
    const today = new Date();
    const todayStart = startOfDay(today);
    
    let motosAlugadasHoje = 0;
    let motosRecuperadasHoje = 0;
    let motosRelocadasHoje = 0;
    
    // Contar motos em manutenção (status atual, não necessariamente de hoje)
    const motosEmManutencao = motorcycles.filter(moto => {
        const uniqueMotorcyclesByPlaca: { [placa: string]: Motorcycle } = {};
        motorcycles.forEach(m => {
            if (!m.placa) return;
            const existingMoto = uniqueMotorcyclesByPlaca[m.placa];
            if (!existingMoto || (m.data_ultima_mov && existingMoto.data_ultima_mov && new Date(m.data_ultima_mov) > new Date(existingMoto.data_ultima_mov)) || (m.data_ultima_mov && !existingMoto.data_ultima_mov)) {
                uniqueMotorcyclesByPlaca[m.placa] = m;
            }
        });
        const representativeMotorcycles = Object.values(uniqueMotorcyclesByPlaca);
        return representativeMotorcycles.filter(m => m.status === 'manutencao').length;
    });
    
    motorcycles.forEach(moto => {
        if (moto.data_ultima_mov) {
            try {
                const movDate = parseISO(moto.data_ultima_mov);
                if (isValid(movDate) && isSameDay(startOfDay(movDate), todayStart)) {
                    if (moto.status === 'alugada') motosAlugadasHoje++;
                    if (moto.status === 'recolhida') motosRecuperadasHoje++;
                    if (moto.status === 'relocada') motosRelocadasHoje++;
                }
            } catch (e) {
                console.error("Error parsing date for today data: ", moto.data_ultima_mov, e);
            }
        }
    });
    
    // Para manutenção, vamos contar as motos que estão atualmente em manutenção
    const uniqueMotorcyclesByPlaca: { [placa: string]: Motorcycle } = {};
    motorcycles.forEach(moto => {
        if (!moto.placa) return;
        const existingMoto = uniqueMotorcyclesByPlaca[moto.placa];
        if (!existingMoto || (moto.data_ultima_mov && existingMoto.data_ultima_mov && new Date(moto.data_ultima_mov) > new Date(existingMoto.data_ultima_mov)) || (moto.data_ultima_mov && !existingMoto.data_ultima_mov)) {
            uniqueMotorcyclesByPlaca[moto.placa] = moto;
        }
    });
    const representativeMotorcycles = Object.values(uniqueMotorcyclesByPlaca);
    const motosManutencaoAtual = representativeMotorcycles.filter(m => m.status === 'manutencao').length;
    
    return {
        motosAlugadasHoje,
        motosRecuperadasHoje,
        motosRelocadasHoje,
        motosEmManutencao: motosManutencaoAtual
    };
};

// Função para processar dados do mês selecionado (movimentações que aconteceram no mês filtrado)
const processMonthData = (motorcycles: Motorcycle[], selectedMonth: number, selectedYear: number) => {
    let motosDisponiveis = 0;
    let motosAlugadas = 0;
    let emManutencao = 0;
    let motosRelocadas = 0;
    
    // Contar movimentações que aconteceram durante o mês/ano selecionado
    motorcycles.forEach(moto => {
        if (moto.data_ultima_mov) {
            try {
                const movDate = parseISO(moto.data_ultima_mov);
                if (isValid(movDate)) {
                    const movYear = getYear(movDate);
                    const movMonth = getMonth(movDate);
                    
                    // Verificar se a movimentação aconteceu no mês/ano selecionado
                    if (movYear === selectedYear && movMonth === selectedMonth) {
                        switch (moto.status) {
                            case 'active':
                                motosDisponiveis++;
                                break;
                            case 'alugada':
                                motosAlugadas++;
                                break;
                            case 'manutencao':
                                emManutencao++;
                                break;
                            case 'relocada':
                                motosRelocadas++;
                                break;
                            case 'indisponivel_rastreador':
                            case 'indisponivel_emplacamento':
                                // Estes status são contados separadamente se necessário
                                break;
                        }
                    }
                }
            } catch (e) {
                console.error("Error parsing date for month data: ", moto.data_ultima_mov, e);
            }
        }
    });
    
    return {
        motosDisponiveis,
        motosAlugadas,
        emManutencao,
        motosRelocadas
    };
};

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState('');
  const [allMotorcycles, setAllMotorcycles] = useState<Motorcycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [motorcycleReport, setMotorcycleReport] = useState<any>(null);
  const [dailyRentalData, setDailyRentalData] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [todayData, setTodayData] = useState<any>(null);
  const [monthData, setMonthData] = useState<any>(null);

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
    const unsubMotorcycles = subscribeToMotorcycles((data) => {
      const motorcyclesData = Array.isArray(data) ? data : [];
      setAllMotorcycles(motorcyclesData);
      setMotorcycleReport(processMotorcycleData(motorcyclesData, currentYear));
      setDailyRentalData(processDailyMotorcycleData(motorcyclesData));
      setTodayData(processTodayData(motorcyclesData));
      setMonthData(processMonthData(motorcyclesData, selectedMonth, selectedYear));
      setIsLoading(false);
    });
    return () => {
      unsubMotorcycles();
    };
  }, [selectedMonth, selectedYear]);
  
  if (isLoading || !motorcycleReport || !todayData || !monthData) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex justify-center items-center h-screen">
            <p>Carregando dashboard...</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }
  
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <BarChart3 className="h-8 w-8 text-primary" />
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

        {/* Cards de dados do dia (hoje) */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
          <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Novas Alugadas Hoje</p>
                <p className="text-2xl font-bold text-blue-500">{todayData.motosAlugadasHoje}</p>
                <p className="text-xs text-muted-foreground">unidades</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500">
                <Bike className="h-6 w-6 text-white" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Motos Recuperadas Hoje</p>
                <p className="text-2xl font-bold text-green-500">{todayData.motosRecuperadasHoje}</p>
                <p className="text-xs text-muted-foreground">unidades</p>
              </div>
              <div className="p-3 rounded-lg bg-green-500">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-gray-400 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Usadas Alugadas Hoje</p>
                <p className="text-2xl font-bold text-gray-600">{todayData.motosRelocadasHoje}</p>
                <p className="text-xs text-muted-foreground">unidades</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-400">
                <ArrowRight className="h-6 w-6 text-white" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-violet-500 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Motos em Manutenção</p>
                <p className="text-2xl font-bold text-violet-500">{todayData.motosEmManutencao}</p>
                <p className="text-xs text-muted-foreground">unidades</p>
              </div>
              <div className="p-3 rounded-lg bg-violet-500">
                <Wrench className="h-6 w-6 text-white" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros para dados mensais */}
        <div className="mt-8 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground">Filtrar Status da Frota por Período:</span>
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthNames.map((month, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2023, 2024, 2025, 2026].map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Card>
        </div>

        {/* Cards de dados do mês selecionado */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
          <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Moto Nova Alugada</p>
                <p className="text-2xl font-bold text-blue-500">{monthData.motosAlugadas}</p>
                <p className="text-xs text-muted-foreground">em {monthNames[selectedMonth]}/{selectedYear}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500">
                <Bike className="h-6 w-6 text-white" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Motos Disponíveis</p>
                <p className="text-2xl font-bold text-green-500">{monthData.motosDisponiveis}</p>
                <p className="text-xs text-muted-foreground">em {monthNames[selectedMonth]}/{selectedYear}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-500">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-gray-400 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Motos Usadas Alugadas</p>
                <p className="text-2xl font-bold text-gray-600">{monthData.motosRelocadas}</p>
                <p className="text-xs text-muted-foreground">em {monthNames[selectedMonth]}/{selectedYear}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-400">
                <ArrowRight className="h-6 w-6 text-white" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-violet-500 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Em Manutenção</p>
                <p className="text-2xl font-bold text-violet-500">{monthData.emManutencao}</p>
                <p className="text-xs text-muted-foreground">em {monthNames[selectedMonth]}/{selectedYear}</p>
              </div>
              <div className="p-3 rounded-lg bg-violet-500">
                <Wrench className="h-6 w-6 text-white" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Separator className="my-8" />

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 mt-8">
          <Card className="shadow-lg">
            <CardHeader><div className="flex items-center gap-2"><PagePieIcon className="h-6 w-6 text-primary" /><div><CardTitle className="font-headline">Distribuição de Motos por Status (%)</CardTitle><CardDescription>Percentual de motocicletas únicas em cada status ({currentYear}).</CardDescription></div></div></CardHeader>
            <CardContent className="p-4 pt-0"><StatusDistributionChart data={motorcycleReport.statusDistribution} /></CardContent>
          </Card>
          <Card className="shadow-lg">
             <CardHeader><div className="flex items-center gap-2"><TrendingUp className="h-6 w-6 text-primary" /><div><CardTitle className="font-headline">Crescimento da Base de Motos ({currentYear})</CardTitle><CardDescription>Contagem cumulativa de placas únicas por mês.</CardDescription></div></div></CardHeader>
             <CardContent className="p-4 pt-0">
               <BaseGrowthChart data={motorcycleReport.baseGrowth} />
             </CardContent>
          </Card>
          <Card className="shadow-lg lg:col-span-2">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Bike className="h-6 w-6 text-blue-600" />
                    <div>
                        <CardTitle className="font-headline">Análise Mensal de Locações ({currentYear})</CardTitle>
                        <CardDescription>Volume de motos alugadas e relocadas (barras) e o total de locações (linha).</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <CombinedRentalChart data={motorcycleReport.combinedRental} />
            </CardContent>
          </Card>
          <Card className="shadow-lg lg:col-span-2">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Bike className="h-6 w-6 text-green-600" />
                    <div>
                        <CardTitle className="font-headline">Análise Diária de Locações (Últimos 30 Dias)</CardTitle>
                        <CardDescription>Volume de motos alugadas e relocadas (barras) e o total de locações (linha).</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <DailyRentalChart data={dailyRentalData} />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
