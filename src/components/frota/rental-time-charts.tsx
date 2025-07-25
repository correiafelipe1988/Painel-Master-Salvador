"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter
} from "recharts";
import { BarChart3, PieChart as PieChartIcon, Zap, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { ModelRentalStats } from "@/lib/services/rentalAnalysisService";

interface RentalTimeChartsProps {
  modelStats: ModelRentalStats[];
}

const CHART_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#F97316", // Orange
  "#06B6D4", // Cyan
  "#84CC16", // Lime
  "#EC4899", // Pink
  "#6B7280", // Gray
];

export function RentalTimeCharts({ modelStats }: RentalTimeChartsProps) {
  // Preparar dados para gráfico de barras
  const barChartData = useMemo(() => {
    return modelStats
      .filter(model => model.averageDays > 0)
      .map((model, index) => ({
        modelo: model.modelo.length > 15 ? model.modelo.substring(0, 15) + "..." : model.modelo,
        fullModelo: model.modelo,
        dias: model.averageDays,
        periodos: model.completedPeriods,
        motos: model.totalMotorcycles,
        manutencoes: model.totalMaintenances,
        fill: CHART_COLORS[index % CHART_COLORS.length]
      }))
      .sort((a, b) => b.dias - a.dias);
  }, [modelStats]);

  // Preparar dados para gráfico de pizza
  const pieChartData = useMemo(() => {
    const totalPeriods = modelStats.reduce((sum, model) => sum + model.completedPeriods, 0);
    
    return modelStats
      .filter(model => model.completedPeriods > 0)
      .map((model, index) => ({
        name: model.modelo.length > 20 ? model.modelo.substring(0, 20) + "..." : model.modelo,
        fullName: model.modelo,
        value: model.completedPeriods,
        percentage: totalPeriods > 0 ? Math.round((model.completedPeriods / totalPeriods) * 100) : 0,
        fill: CHART_COLORS[index % CHART_COLORS.length]
      }))
      .sort((a, b) => b.value - a.value);
  }, [modelStats]);

  // Preparar dados para gráfico de dispersão
  const scatterData = useMemo(() => {
    return modelStats
      .filter(model => model.averageDays > 0)
      .map((model, index) => ({
        x: model.averageDays,
        y: model.averageMaintenancesPerPeriod,
        z: model.totalMotorcycles,
        modelo: model.modelo,
        fill: CHART_COLORS[index % CHART_COLORS.length]
      }));
  }, [modelStats]);

  // Top 3 modelos
  const topModels = useMemo(() => {
    const sorted = [...modelStats]
      .filter(model => model.averageDays > 0)
      .sort((a, b) => b.averageDays - a.averageDays); // Maior tempo = melhor
    
    return {
      melhor: sorted.slice(0, 3), // Maiores tempos = melhor rotatividade
      pior: sorted.slice(-3).reverse() // Menores tempos = pior rotatividade
    };
  }, [modelStats]);

  const getTimeIcon = (days: number) => {
    if (days > 60) return <TrendingUp className="h-4 w-4 text-green-500" />; // Excelente - muito tempo alugada
    if (days > 30) return <TrendingUp className="h-4 w-4 text-blue-500" />; // Bom - tempo adequado
    if (days > 15) return <TrendingDown className="h-4 w-4 text-yellow-500" />; // Médio
    return <Minus className="h-4 w-4 text-red-500" />; // Ruim - pouco tempo alugada
  };

  const getTimeBadgeColor = (days: number) => {
    if (days > 60) return "bg-green-100 text-green-700"; // Excelente
    if (days > 30) return "bg-blue-100 text-blue-700"; // Bom  
    if (days > 15) return "bg-yellow-100 text-yellow-700"; // Médio
    return "bg-red-100 text-red-700"; // Ruim
  };

  if (modelStats.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Sem dados para gráficos
          </h3>
          <p className="mt-2 text-gray-500">
            Não há períodos completos suficientes para gerar visualizações.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards Top 3 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Melhor Rotatividade
            </CardTitle>
            <CardDescription>Modelos que ficam alugados por mais tempo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topModels.melhor.map((model, index) => (
                <div key={model.modelo} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                    <span className="text-sm font-medium">{model.modelo}</span>
                  </div>
                  <Badge className={getTimeBadgeColor(model.averageDays)}>
                    {model.averageDays} dias
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Pior Rotatividade
            </CardTitle>
            <CardDescription>Modelos que ficam alugados por menos tempo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topModels.pior.map((model, index) => (
                <div key={model.modelo} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                    <span className="text-sm font-medium">{model.modelo}</span>
                  </div>
                  <Badge className={getTimeBadgeColor(model.averageDays)}>
                    {model.averageDays} dias
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos em Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Visualizações por Modelo</CardTitle>
          <CardDescription>
            Análise gráfica do tempo médio de locação e manutenções
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="bar" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="bar" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Tempo Médio
              </TabsTrigger>
              <TabsTrigger value="pie" className="flex items-center gap-2">
                <PieChartIcon className="h-4 w-4" />
                Distribuição
              </TabsTrigger>
              <TabsTrigger value="scatter" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Manutenções
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bar">
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="modelo" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval={0}
                      fontSize={12}
                    />
                    <YAxis 
                      label={{ value: 'Dias', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 border rounded-lg shadow-lg">
                              <p className="font-medium">{data.fullModelo}</p>
                              <p className="text-blue-600">Tempo médio: {data.dias} dias</p>
                              <p className="text-gray-600">{data.periodos} períodos completos</p>
                              <p className="text-gray-600">{data.motos} motocicletas</p>
                              <p className="text-orange-600">{data.manutencoes} manutenções</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="dias" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="pie">
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percentage }) => `${percentage}%`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 border rounded-lg shadow-lg">
                              <p className="font-medium">{data.fullName}</p>
                              <p className="text-blue-600">{data.value} períodos ({data.percentage}%)</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="scatter">
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      name="Tempo Médio (dias)"
                      label={{ value: 'Tempo Médio (dias)', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="y" 
                      name="Manutenções por Período"
                      label={{ value: 'Manutenções/Período', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 border rounded-lg shadow-lg">
                              <p className="font-medium">{data.modelo}</p>
                              <p className="text-blue-600">Tempo médio: {data.x} dias</p>
                              <p className="text-orange-600">Manutenções: {data.y}/período</p>
                              <p className="text-gray-600">{data.z} motocicletas</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter data={scatterData} fill="#3B82F6" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}