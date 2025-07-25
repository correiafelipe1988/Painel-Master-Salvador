"use client";

import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, TrendingUp, TrendingDown, Minus, Wrench, Calendar, ChevronDown, ChevronRight } from "lucide-react";
import type { Motorcycle, ManutencaoData } from "@/lib/types";
import { subscribeToManutencao } from "@/lib/firebase/manutencaoService";
import { 
  calculateRentalPeriods, 
  calculateModelRentalStats, 
  calculateOverallStats,
  formatPeriod
} from "@/lib/services/rentalAnalysisService";

interface AverageRentalTimeProps {
  motorcycles: Motorcycle[];
}

export function AverageRentalTime({ motorcycles }: AverageRentalTimeProps) {
  const [maintenanceData, setMaintenanceData] = useState<ManutencaoData[]>([]);
  const [isMaintenanceLoading, setIsMaintenanceLoading] = useState(true);
  const [expandedMotorcycles, setExpandedMotorcycles] = useState<Set<string>>(new Set());

  // Buscar dados de manutenção
  useEffect(() => {
    setIsMaintenanceLoading(true);
    const unsubscribe = subscribeToManutencao((data) => {
      setMaintenanceData(data);
      setIsMaintenanceLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Calcular análises de locação
  const rentalAnalyses = useMemo(() => {
    if (isMaintenanceLoading) return [];
    return calculateRentalPeriods(motorcycles, maintenanceData);
  }, [motorcycles, maintenanceData, isMaintenanceLoading]);

  // Calcular estatísticas por modelo
  const modelStats = useMemo(() => {
    return calculateModelRentalStats(rentalAnalyses);
  }, [rentalAnalyses]);

  // Calcular estatísticas gerais
  const overallStats = useMemo(() => {
    return calculateOverallStats(rentalAnalyses);
  }, [rentalAnalyses]);

  const getTimeIcon = (days: number) => {
    if (days > 30) return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (days > 15) return <TrendingDown className="h-4 w-4 text-yellow-500" />;
    return <Minus className="h-4 w-4 text-green-500" />;
  };

  const getTimeBadge = (days: number) => {
    if (days > 30) return "bg-red-100 text-red-700";
    if (days > 15) return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-700";
  };

  const toggleMotorcycleExpanded = (placa: string) => {
    const newExpanded = new Set(expandedMotorcycles);
    if (newExpanded.has(placa)) {
      newExpanded.delete(placa);
    } else {
      newExpanded.add(placa);
    }
    setExpandedMotorcycles(newExpanded);
  };

  if (isMaintenanceLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <Clock className="mx-auto h-12 w-12 text-gray-400 animate-spin" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Carregando dados de manutenção...
          </h3>
          <p className="mt-2 text-gray-500">
            Calculando períodos de locação baseado no histórico de status.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de resumo */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio Geral</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {overallStats.averageDays} dias
            </div>
            <p className="text-xs text-muted-foreground">
              Baseado em {overallStats.totalCompletedPeriods} períodos completos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Motos Analisadas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {overallStats.totalMotorcycles}
            </div>
            <p className="text-xs text-muted-foreground">
              {overallStats.currentlyRented} atualmente alugadas/relocadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Manutenções</CardTitle>
            <Wrench className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {overallStats.totalMaintenances}
            </div>
            <p className="text-xs text-muted-foreground">
              {overallStats.averageMaintenancesPerPeriod} por período em média
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modelos</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {modelStats.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Modelos com períodos de locação
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Análise por modelo */}
      <Card>
        <CardHeader>
          <CardTitle>Análise por Modelo</CardTitle>
          <CardDescription>
            Tempo médio de locação e manutenções por modelo (baseado em períodos completos)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {modelStats.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Nenhum período de locação encontrado
              </h3>
              <p className="mt-2 text-gray-500">
                Não há dados suficientes para calcular o tempo médio de locação.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {modelStats.map((modelData) => (
                <div
                  key={modelData.modelo}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getTimeIcon(modelData.averageDays)}
                      <span className="font-medium">{modelData.modelo}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <div className="text-gray-900 font-medium">
                        {modelData.totalMotorcycles} motos • {modelData.completedPeriods} períodos
                      </div>
                      <div className="text-gray-500">
                        {modelData.totalMaintenances} manutenções ({modelData.averageMaintenancesPerPeriod}/período)
                      </div>
                    </div>
                    
                    <Badge className={getTimeBadge(modelData.averageDays)}>
                      {modelData.averageDays} dias
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detalhes por motocicleta */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico Detalhado por Motocicleta</CardTitle>
          <CardDescription>
            Períodos de locação individuais com contagem de manutenções
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rentalAnalyses.slice(0, 10).map((analysis) => (
              <div key={analysis.placa} className="border rounded-lg">
                <Button
                  variant="ghost"
                  className="w-full justify-between p-4 h-auto"
                  onClick={() => toggleMotorcycleExpanded(analysis.placa)}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-left">
                      <div className="font-medium">
                        {analysis.placa} • {analysis.modelo}
                      </div>
                      <div className="text-sm text-gray-500">
                        {analysis.totalPeriods} períodos • {analysis.averageDays} dias médios
                        {analysis.totalMaintenances > 0 && (
                          <span className="ml-2">• {analysis.totalMaintenances} manutenções</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {expandedMotorcycles.has(analysis.placa) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
                
                {expandedMotorcycles.has(analysis.placa) && (
                  <div className="px-4 pb-4 space-y-2">
                    {analysis.periods.map((period, index) => (
                      <div key={index} className="flex items-center justify-between text-sm bg-gray-50 p-3 rounded">
                        <div>
                          <span className="font-medium">{formatPeriod(period)}</span>
                          <span className="ml-2 text-gray-500">({period.status})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {period.maintenanceCount > 0 && (
                            <Badge variant="outline" className="text-orange-600">
                              <Wrench className="h-3 w-3 mr-1" />
                              {period.maintenanceCount}
                            </Badge>
                          )}
                          <Badge className={getTimeBadge(period.durationDays)}>
                            {period.durationDays} dias
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {rentalAnalyses.length > 10 && (
              <div className="text-center py-4 text-gray-500">
                E mais {rentalAnalyses.length - 10} motocicletas...
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Legenda */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Interpretação dos Resultados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="flex items-center gap-2">
              <Minus className="h-4 w-4 text-green-500" />
              <span className="text-sm">≤ 15 dias: Rotatividade boa</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">16-30 dias: Rotatividade média</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-red-500" />
              <span className="text-sm">&gt; 30 dias: Rotatividade baixa</span>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            * Cálculos baseados no histórico de mudanças de status (alugada/relocada → disponível/outro status)
            <br />
            * Manutenções contabilizadas durante os períodos de locação
          </div>
        </CardContent>
      </Card>
    </div>
  );
}