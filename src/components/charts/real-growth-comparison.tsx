"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, BarChart3, LineChart } from "lucide-react";
import { BaseGrowthChart, type MonthlyBaseGrowthDataPoint } from "./base-growth-chart";
import type { Motorcycle } from "@/lib/types";
import { parseISO, isValid, getYear, getMonth } from 'date-fns';

// Constantes baseadas no dashboard existente
const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const monthAbbreviations = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

interface RealGrowthData {
  month: string;
  monthName: string;
  newMotorcycles: number;
  cumulativeCount: number;
  growthRate: string;
}

interface ComparisonData {
  month: string;
  real: number;
  projected: number;
  difference: number;
  percentDifference: string;
  status: 'Acima' | 'Abaixo' | 'Igual';
}

interface GrowthSummary {
  totalNewMotorcycles: number;
  currentTotal: number;
  overallGrowthRate: string;
  bestMonth: {
    month: string;
    count: number;
  };
  averageMonthlyGrowth: string;
}

/**
 * Função principal para analisar o crescimento real mensal das motos
 * Baseada na lógica existente do dashboard (linhas 102-137)
 */
function analyzeRealMotorcycleGrowth(motorcycles: Motorcycle[], year: number = 2025) {
  // Lógica baseada nas linhas 102-118 do dashboard
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
        } catch (e) {
          // Ignora datas inválidas conforme lógica original
        }
      }
    }
  });

  // Lógica baseada nas linhas 120-131 do dashboard
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

  // Lógica baseada nas linhas 133-137 do dashboard
  let cumulativeCount = baseCountForYearStart;
  const realGrowthData: RealGrowthData[] = monthAbbreviations.map((month, index) => {
    const newMotosThisMonth = monthlyNewMotorcycles[index];
    cumulativeCount += newMotosThisMonth;
    
    return {
      month,
      monthName: monthNames[index],
      newMotorcycles: newMotosThisMonth,
      cumulativeCount,
      growthRate: baseCountForYearStart > 0 ? ((cumulativeCount - baseCountForYearStart) / baseCountForYearStart * 100).toFixed(1) : '0'
    };
  });

  const summary = generateGrowthSummary(realGrowthData, baseCountForYearStart);

  return {
    year,
    baseCount: baseCountForYearStart,
    totalUniqueMotorcycles: earliestDateByPlaca.size,
    monthlyNewMotorcycles,
    realGrowthData,
    summary
  };
}

function generateGrowthSummary(growthData: RealGrowthData[], baseCount: number): GrowthSummary {
  const currentMonth = new Date().getMonth();
  const dataUpToCurrentMonth = growthData.slice(0, currentMonth + 1);
  
  const totalNewMotorcycles = dataUpToCurrentMonth.reduce((sum, month) => sum + month.newMotorcycles, 0);
  const currentTotal = dataUpToCurrentMonth[dataUpToCurrentMonth.length - 1]?.cumulativeCount || baseCount;
  const overallGrowthRate = baseCount > 0 ? ((currentTotal - baseCount) / baseCount * 100).toFixed(1) : '0';
  
  const bestMonth = growthData.reduce((best, current) => 
    current.newMotorcycles > best.newMotorcycles ? current : best
  );
  
  const averageMonthlyGrowth = (totalNewMotorcycles / (currentMonth + 1)).toFixed(1);

  return {
    totalNewMotorcycles,
    currentTotal,
    overallGrowthRate: `${overallGrowthRate}%`,
    bestMonth: {
      month: bestMonth.monthName,
      count: bestMonth.newMotorcycles
    },
    averageMonthlyGrowth: `${averageMonthlyGrowth} motos/mês`
  };
}

function compareWithLinearProjection(realData: RealGrowthData[], baseCount: number): ComparisonData[] {
  const currentMonth = new Date().getMonth();
  const totalNewSoFar = realData.slice(0, currentMonth + 1).reduce((sum, month) => sum + month.newMotorcycles, 0);
  const avgMonthlyGrowth = totalNewSoFar / (currentMonth + 1);
  
  return realData.map((realMonth, index) => {
    const projectedCumulative = baseCount + (avgMonthlyGrowth * (index + 1));
    const difference = realMonth.cumulativeCount - projectedCumulative;
    const percentDifference = projectedCumulative > 0 ? ((difference / projectedCumulative) * 100).toFixed(1) : '0';
    
    return {
      month: realMonth.monthName,
      real: realMonth.cumulativeCount,
      projected: Math.round(projectedCumulative),
      difference: Math.round(difference),
      percentDifference: `${percentDifference}%`,
      status: difference > 0 ? 'Acima' : difference < 0 ? 'Abaixo' : 'Igual'
    };
  });
}

function generateChartData(realData: RealGrowthData[]): MonthlyBaseGrowthDataPoint[] {
  return realData.map(month => ({
    month: month.month,
    cumulativeCount: month.cumulativeCount
  }));
}

export function RealGrowthComparison({ motorcycles }: { motorcycles: Motorcycle[] }) {
  const [analysis, setAnalysis] = useState<ReturnType<typeof analyzeRealMotorcycleGrowth> | null>(null);
  const [comparison, setComparison] = useState<ComparisonData[] | null>(null);
  const [chartData, setChartData] = useState<MonthlyBaseGrowthDataPoint[] | null>(null);

  useEffect(() => {
    if (motorcycles && motorcycles.length > 0) {
      const analysisResult = analyzeRealMotorcycleGrowth(motorcycles, 2025);
      const comparisonResult = compareWithLinearProjection(analysisResult.realGrowthData, analysisResult.baseCount);
      const chartDataResult = generateChartData(analysisResult.realGrowthData);

      setAnalysis(analysisResult);
      setComparison(comparisonResult);
      setChartData(chartDataResult);
    }
  }, [motorcycles]);

  if (!analysis || !comparison || !chartData) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center text-muted-foreground">
        Carregando análise de crescimento...
      </div>
    );
  }

  const getTrendIcon = (status: string) => {
    switch (status) {
      case 'Acima':
        return <TrendingUp className="h-4 w-4" />;
      case 'Abaixo':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Acima':
        return 'bg-green-500';
      case 'Abaixo':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Resumo Executivo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Análise de Crescimento Real - {analysis.year}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{analysis.summary.currentTotal}</div>
              <div className="text-sm text-muted-foreground">Total Atual</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{analysis.summary.overallGrowthRate}</div>
              <div className="text-sm text-muted-foreground">Crescimento Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{analysis.summary.bestMonth.count}</div>
              <div className="text-sm text-muted-foreground">Melhor Mês ({analysis.summary.bestMonth.month})</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{analysis.summary.averageMonthlyGrowth}</div>
              <div className="text-sm text-muted-foreground">Média Mensal</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs com visualizações */}
      <Tabs defaultValue="chart" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chart">Gráfico</TabsTrigger>
          <TabsTrigger value="comparison">Comparação</TabsTrigger>
          <TabsTrigger value="monthly">Detalhes Mensais</TabsTrigger>
        </TabsList>

        <TabsContent value="chart" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Crescimento Real da Base de Motos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BaseGrowthChart data={chartData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real vs Projeção Linear</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {comparison.map((comp, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(comp.status)}`} />
                      <span className="font-medium">{comp.month}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div>Real: <span className="font-semibold">{comp.real}</span></div>
                      <div>Projeção: <span className="font-semibold">{comp.projected}</span></div>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(comp.status)}
                        <span className={`font-semibold ${comp.status === 'Acima' ? 'text-green-600' : comp.status === 'Abaixo' ? 'text-red-600' : 'text-gray-600'}`}>
                          {comp.difference > 0 ? '+' : ''}{comp.difference}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes Mensais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.realGrowthData.map((month, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{month.monthName}</span>
                      {month.newMotorcycles > 0 && (
                        <Badge variant="secondary">+{month.newMotorcycles}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div>Total: <span className="font-semibold">{month.cumulativeCount}</span></div>
                      <div>Crescimento: <span className="font-semibold text-green-600">{month.growthRate}%</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}