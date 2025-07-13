/**
 * Exemplo de como integrar a análise de crescimento real no dashboard existente
 * 
 * Este arquivo mostra como substituir a lógica atual do gráfico de crescimento
 * pela análise de dados reais usando a função existente.
 */

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BaseGrowthChart } from "@/components/charts/base-growth-chart";
import { TrendingUp, BarChart3, Eye } from "lucide-react";
import type { Motorcycle } from "@/lib/types";
import { 
  analyzeRealMotorcycleGrowth, 
  compareWithLinearProjection, 
  getRealGrowthDataForChart,
  logRealGrowthAnalysis 
} from "@/utils/realGrowthAnalysis";

interface DashboardIntegrationProps {
  motorcycles: Motorcycle[];
  year?: number;
}

export function DashboardIntegration({ motorcycles, year = 2025 }: DashboardIntegrationProps) {
  const [showRealData, setShowRealData] = useState(false);
  const [analysis, setAnalysis] = useState<ReturnType<typeof analyzeRealMotorcycleGrowth> | null>(null);
  const [comparison, setComparison] = useState<ReturnType<typeof compareWithLinearProjection> | null>(null);

  useEffect(() => {
    if (motorcycles && motorcycles.length > 0) {
      const analysisResult = analyzeRealMotorcycleGrowth(motorcycles, year);
      const comparisonResult = compareWithLinearProjection(analysisResult.realGrowthData, analysisResult.baseCount);
      
      setAnalysis(analysisResult);
      setComparison(comparisonResult);
    }
  }, [motorcycles, year]);

  const handleShowRealData = () => {
    setShowRealData(!showRealData);
    if (!showRealData && analysis) {
      // Log detalhado para debug
      logRealGrowthAnalysis(motorcycles, year);
    }
  };

  if (!analysis) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center text-muted-foreground">
        Carregando análise de crescimento...
      </div>
    );
  }

  // Gera dados para o gráfico existente
  const chartData = getRealGrowthDataForChart(motorcycles, year);

  return (
    <div className="space-y-6">
      {/* Card de Controle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Crescimento da Base de Motos - {year}
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleShowRealData}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              {showRealData ? 'Ocultar' : 'Mostrar'} Dados Reais
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{analysis.summary.currentTotal}</div>
              <div className="text-sm text-muted-foreground">Total Atual</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {analysis.summary.overallGrowthRate.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Crescimento Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{analysis.summary.bestMonth.count}</div>
              <div className="text-sm text-muted-foreground">Melhor Mês</div>
              <div className="text-xs text-muted-foreground">{analysis.summary.bestMonth.month}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {analysis.summary.averageMonthlyGrowth.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Média Mensal</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico Principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Crescimento Real da Base
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BaseGrowthChart data={chartData} />
        </CardContent>
      </Card>

      {/* Detalhes Expandidos */}
      {showRealData && (
        <div className="space-y-4">
          {/* Dados Mensais */}
          <Card>
            <CardHeader>
              <CardTitle>Crescimento Mensal Detalhado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analysis.realGrowthData.map((month, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{month.monthName}</h4>
                      {month.newMotorcycles > 0 && (
                        <Badge variant="secondary">+{month.newMotorcycles}</Badge>
                      )}
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Total:</span>
                        <span className="font-semibold">{month.cumulativeCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Crescimento:</span>
                        <span className="font-semibold text-green-600">
                          {month.growthRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Comparação com Projeção */}
          {comparison && (
            <Card>
              <CardHeader>
                <CardTitle>Real vs Projeção Linear</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {comparison.map((comp, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          comp.status === 'above' ? 'bg-green-500' :
                          comp.status === 'below' ? 'bg-red-500' : 'bg-gray-500'
                        }`} />
                        <span className="font-medium">{comp.month}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div>Real: <span className="font-semibold">{comp.real}</span></div>
                        <div>Projeção: <span className="font-semibold">{comp.projected}</span></div>
                        <div className={`font-semibold ${
                          comp.status === 'above' ? 'text-green-600' :
                          comp.status === 'below' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {comp.difference > 0 ? '+' : ''}{comp.difference}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Exemplo de como substituir a lógica atual no dashboard principal
 * 
 * No arquivo src/app/dashboard/page.tsx, você pode substituir:
 * 
 * ANTES (linha ~41):
 * const processMotorcycleData = (motorcycles: Motorcycle[], year: number) => {
 *   // ... lógica atual
 * };
 * 
 * DEPOIS:
 * import { processRealMotorcycleData } from '@/utils/realGrowthAnalysis';
 * 
 * const processMotorcycleData = (motorcycles: Motorcycle[], year: number) => {
 *   const realAnalysis = processRealMotorcycleData(motorcycles, year);
 *   
 *   // Mantém a estrutura existente, mas com dados reais
 *   return {
 *     kpi: {
 *       total: realAnalysis.realGrowthAnalysis.totalUniqueMotorcycles.toString(),
 *       locacoes: "0", // Manter lógica existente para locações
 *     },
 *     statusDistribution: [], // Manter lógica existente
 *     combinedRental: [], // Manter lógica existente
 *     baseGrowth: realAnalysis.baseGrowth, // DADOS REAIS aqui
 *   };
 * };
 */