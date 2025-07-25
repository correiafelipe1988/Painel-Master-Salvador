"use client";

import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, TrendingUp, TrendingDown, Minus, Wrench, Calendar, ChevronDown, ChevronRight, Search } from "lucide-react";
import type { Motorcycle, ManutencaoData } from "@/lib/types";
import { subscribeToManutencao } from "@/lib/firebase/manutencaoService";
import { 
  calculateRentalPeriods, 
  calculateModelRentalStats, 
  calculateOverallStats,
  formatPeriod
} from "@/lib/services/rentalAnalysisService";
import { RentalTimeCharts } from "./rental-time-charts";

interface AverageRentalTimeProps {
  motorcycles: Motorcycle[];
}

export function AverageRentalTime({ motorcycles }: AverageRentalTimeProps) {
  const [maintenanceData, setMaintenanceData] = useState<ManutencaoData[]>([]);
  const [isMaintenanceLoading, setIsMaintenanceLoading] = useState(true);
  const [expandedMotorcycles, setExpandedMotorcycles] = useState<Set<string>>(new Set());
  const [searchFilter, setSearchFilter] = useState("");

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

  // Filtrar análises baseado no filtro de busca
  const filteredRentalAnalyses = useMemo(() => {
    if (!searchFilter.trim()) return rentalAnalyses;
    
    const lowerFilter = searchFilter.toLowerCase().trim();
    return rentalAnalyses.filter(analysis => 
      analysis.placa.toLowerCase().includes(lowerFilter) ||
      analysis.modelo.toLowerCase().includes(lowerFilter)
    );
  }, [rentalAnalyses, searchFilter]);


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

      {/* Gráficos por modelo */}
      <RentalTimeCharts modelStats={modelStats} />

      {/* Detalhes por motocicleta */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico Detalhado por Motocicleta</CardTitle>
          <CardDescription>
            Períodos de locação individuais com contagem de manutenções
          </CardDescription>
          {/* Filtro de busca */}
          <div className="relative mt-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por placa ou modelo..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-96 overflow-y-auto space-y-4">
            {filteredRentalAnalyses
              .sort((a, b) => a.averageDays - b.averageDays) // Menores tempos primeiro
              .map((analysis) => (
              <div key={analysis.placa} className="border rounded-lg">
                <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center gap-2">
                      {analysis.averageDays <= 15 ? (
                        <div className="w-3 h-3 bg-red-500 rounded-full" title="Baixa ocupação - necessita atenção" />
                      ) : analysis.averageDays <= 30 ? (
                        <div className="w-3 h-3 bg-yellow-500 rounded-full" title="Ocupação média" />
                      ) : analysis.averageDays <= 60 ? (
                        <div className="w-3 h-3 bg-blue-500 rounded-full" title="Boa ocupação" />
                      ) : (
                        <div className="w-3 h-3 bg-green-500 rounded-full" title="Excelente ocupação" />
                      )}
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-medium">
                        <span 
                          className="select-text cursor-text px-1 py-0.5 rounded hover:bg-blue-100 transition-colors" 
                          title="Clique para selecionar e copiar a placa"
                        >
                          {analysis.placa}
                        </span>
                        <span className="mx-2">•</span>
                        <span className="select-text cursor-text">{analysis.modelo}</span>
                      </div>
                      <div className="text-sm text-gray-500 select-text">
                        {analysis.totalPeriods} períodos • {analysis.averageDays} dias médios
                        {analysis.totalMaintenances > 0 && (
                          <span className="ml-2">• {analysis.totalMaintenances} manutenções</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleMotorcycleExpanded(analysis.placa)}
                    className="flex items-center gap-2 shrink-0 ml-2"
                  >
                    <span className="text-xs text-gray-500">
                      {expandedMotorcycles.has(analysis.placa) ? 'Ocultar' : 'Ver detalhes'}
                    </span>
                    {expandedMotorcycles.has(analysis.placa) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
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
                          <Badge className={period.durationDays > 60 ? "bg-green-100 text-green-700" : period.durationDays > 30 ? "bg-blue-100 text-blue-700" : period.durationDays > 15 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}>
                            {period.durationDays} dias
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs text-gray-500 text-center">
            {searchFilter ? (
              <>Mostrando: {filteredRentalAnalyses.length} de {rentalAnalyses.length} motocicletas</>
            ) : (
              <>Total: {rentalAnalyses.length} motocicletas</>
            )} • Ordenadas por menor tempo médio
          </div>
        </CardContent>
      </Card>

      {/* Legenda */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Interpretação dos Resultados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <div className="flex items-center gap-2">
              <Minus className="h-4 w-4 text-red-500" />
              <span className="text-sm">≤ 15 dias: Baixa ocupação</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">16-30 dias: Ocupação média</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="text-sm">31-60 dias: Boa ocupação</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm">&gt; 60 dias: Excelente ocupação</span>
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