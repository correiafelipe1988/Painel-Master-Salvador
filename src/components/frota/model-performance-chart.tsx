"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, DollarSign, Bike } from "lucide-react";
import { normalizeMotorcycleModel } from "@/lib/utils/modelNormalizer";
import type { Motorcycle } from "@/lib/types";

interface ModelPerformanceChartProps {
  motorcycles: Motorcycle[];
}

interface ModelPerformance {
  model: string;
  totalMotorcycles: number;
  revenueGenerating: number;
  totalWeeklyRevenue: number;
  averageTicket: number;
  occupationRate: number;
  projectedMonthlyRevenue: number;
  revenuePerMotorcycle: number;
  franchiseeCount: number;
}

const formatCurrency = (value: number) =>
  `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function ModelPerformanceChart({ motorcycles }: ModelPerformanceChartProps) {
  const modelPerformance = useMemo(() => {
    const models: { [key: string]: ModelPerformance } = {};
    
    motorcycles.forEach(moto => {
      if (!moto.model) return;
      
      const modelKey = normalizeMotorcycleModel(moto.model);
      if (!models[modelKey]) {
        models[modelKey] = {
          model: modelKey,
          totalMotorcycles: 0,
          revenueGenerating: 0,
          totalWeeklyRevenue: 0,
          averageTicket: 0,
          occupationRate: 0,
          projectedMonthlyRevenue: 0,
          revenuePerMotorcycle: 0,
          franchiseeCount: 0
        };
      }
      
      const model = models[modelKey];
      model.totalMotorcycles++;
      
      // Contar motos gerando receita
      if (moto.status === 'alugada' || moto.status === 'relocada') {
        model.revenueGenerating++;
        
        // Somar receita
        if (moto.valorSemanal && moto.valorSemanal > 0) {
          model.totalWeeklyRevenue += moto.valorSemanal;
        }
      }
    });
    
    // Calcular métricas finais
    Object.values(models).forEach(model => {
      model.occupationRate = model.totalMotorcycles > 0 ? 
        (model.revenueGenerating / model.totalMotorcycles) * 100 : 0;
      
      model.averageTicket = model.revenueGenerating > 0 ? 
        model.totalWeeklyRevenue / model.revenueGenerating : 0;
      
      model.projectedMonthlyRevenue = model.totalWeeklyRevenue * 4.33;
      
      model.revenuePerMotorcycle = model.totalMotorcycles > 0 ? 
        model.totalWeeklyRevenue / model.totalMotorcycles : 0;
      
      // Contar franqueados únicos por modelo
      const franchisees = new Set();
      motorcycles.forEach(moto => {
        if (normalizeMotorcycleModel(moto.model || '') === model.model && moto.franqueado) {
          franchisees.add(moto.franqueado.trim());
        }
      });
      model.franchiseeCount = franchisees.size;
    });
    
    return Object.values(models)
      .filter(model => model.totalMotorcycles > 0)
      .sort((a, b) => b.totalWeeklyRevenue - a.totalWeeklyRevenue);
  }, [motorcycles]);

  const totalRevenue = modelPerformance.reduce((sum, model) => sum + model.totalWeeklyRevenue, 0);
  const bestPerformingModel = modelPerformance[0];
  const averageOccupation = modelPerformance.length > 0 ? 
    modelPerformance.reduce((sum, model) => sum + model.occupationRate, 0) / modelPerformance.length : 0;

  return (
    <div className="space-y-6">
      {/* Resumo de Performance */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita Total Semanal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Todos os modelos
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Melhor Modelo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-blue-600">
              {bestPerformingModel?.model || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {bestPerformingModel ? formatCurrency(bestPerformingModel.totalWeeklyRevenue) : 'R$ 0,00'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ocupação Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {averageOccupation.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Todos os modelos
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Modelos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              {modelPerformance.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Com receita
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ranking de Performance */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Ranking de Performance por Modelo</h3>
        <div className="grid gap-4">
          {modelPerformance.map((model, index) => {
            const revenuePercentage = totalRevenue > 0 ? (model.totalWeeklyRevenue / totalRevenue) * 100 : 0;
            const isTopPerformer = index < 3;
            
            return (
              <Card key={model.model} className={`hover:shadow-md transition-shadow ${
                isTopPerformer ? 'ring-2 ring-yellow-200 bg-yellow-50' : ''
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-100 text-gray-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {index + 1}°
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">{model.model}</h4>
                        <p className="text-sm text-gray-500">
                          {model.totalMotorcycles} motos • {model.franchiseeCount} franqueados
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(model.totalWeeklyRevenue)}
                      </div>
                      <p className="text-xs text-gray-500">
                        {revenuePercentage.toFixed(1)}% da receita total
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Taxa de Ocupação</p>
                      <div className="flex items-center gap-2">
                        <Progress value={model.occupationRate} className="flex-1 h-2" />
                        <span className={`text-sm font-medium ${
                          model.occupationRate >= 85 ? 'text-green-600' :
                          model.occupationRate >= 75 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {model.occupationRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Ticket Médio</p>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-green-600">
                          {formatCurrency(model.averageTicket)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Receita/Moto</p>
                      <div className="flex items-center gap-1">
                        <Bike className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold text-blue-600">
                          {formatCurrency(model.revenuePerMotorcycle)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Projeção Mensal</p>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-purple-600" />
                        <span className="font-semibold text-purple-600">
                          {formatCurrency(model.projectedMonthlyRevenue)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Badge className="bg-blue-100 text-blue-700">
                        {model.revenueGenerating} gerando receita
                      </Badge>
                      <Badge variant="outline">
                        {model.totalMotorcycles - model.revenueGenerating} disponíveis
                      </Badge>
                    </div>
                    {isTopPerformer && (
                      <Badge className="bg-yellow-100 text-yellow-700">
                        🏆 Top {index + 1}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}