"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wrench, AlertTriangle, Clock, TrendingUp } from "lucide-react";
import type { Motorcycle } from "@/lib/types";

interface MaintenanceAnalysisProps {
  motorcycles: Motorcycle[];
}

interface MaintenanceData {
  model: string;
  totalMotorcycles: number;
  inMaintenance: number;
  maintenanceRate: number;
  averageMaintenanceTime: number; // Estimativa em dias
  estimatedCost: number; // Estimativa baseada no modelo
  criticalLevel: 'low' | 'medium' | 'high';
}

export function MaintenanceAnalysis({ motorcycles }: MaintenanceAnalysisProps) {
  const maintenanceData = useMemo(() => {
    const models: { [key: string]: MaintenanceData } = {};
    
    motorcycles.forEach(moto => {
      if (!moto.model) return;
      
      const modelKey = moto.model.trim();
      if (!models[modelKey]) {
        models[modelKey] = {
          model: modelKey,
          totalMotorcycles: 0,
          inMaintenance: 0,
          maintenanceRate: 0,
          averageMaintenanceTime: 0,
          estimatedCost: 0,
          criticalLevel: 'low'
        };
      }
      
      const model = models[modelKey];
      model.totalMotorcycles++;
      
      if (moto.status === 'manutencao') {
        model.inMaintenance++;
        
        // Estimar tempo de manutenção baseado na data da última movimentação
        if (moto.data_ultima_mov) {
          const lastMoveDate = new Date(moto.data_ultima_mov);
          const currentDate = new Date();
          const daysDiff = Math.floor((currentDate.getTime() - lastMoveDate.getTime()) / (1000 * 60 * 60 * 24));
          model.averageMaintenanceTime += daysDiff;
        }
      }
    });
    
    // Calcular métricas finais
    Object.values(models).forEach(model => {
      model.maintenanceRate = model.totalMotorcycles > 0 ? 
        (model.inMaintenance / model.totalMotorcycles) * 100 : 0;
      
      model.averageMaintenanceTime = model.inMaintenance > 0 ? 
        model.averageMaintenanceTime / model.inMaintenance : 0;
      
      // Estimar custo baseado no modelo (valores fictícios para demonstração)
      const baseCost = 300; // Custo base
      const modelMultiplier = model.model.toLowerCase().includes('honda') ? 1.2 :
                             model.model.toLowerCase().includes('yamaha') ? 1.1 :
                             model.model.toLowerCase().includes('suzuki') ? 1.0 : 1.15;
      
      model.estimatedCost = model.inMaintenance * baseCost * modelMultiplier;
      
      // Determinar nível crítico
      if (model.maintenanceRate > 15) {
        model.criticalLevel = 'high';
      } else if (model.maintenanceRate > 8) {
        model.criticalLevel = 'medium';
      } else {
        model.criticalLevel = 'low';
      }
    });
    
    return Object.values(models)
      .filter(model => model.totalMotorcycles > 0)
      .sort((a, b) => b.maintenanceRate - a.maintenanceRate);
  }, [motorcycles]);

  const totalInMaintenance = motorcycles.filter(m => m.status === 'manutencao').length;
  const totalMotorcycles = motorcycles.length;
  const overallMaintenanceRate = totalMotorcycles > 0 ? (totalInMaintenance / totalMotorcycles) * 100 : 0;
  const totalEstimatedCost = maintenanceData.reduce((sum, model) => sum + model.estimatedCost, 0);
  const criticalModels = maintenanceData.filter(model => model.criticalLevel === 'high');

  const formatCurrency = (value: number) => 
    `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      {/* Alertas Críticos */}
      {criticalModels.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Atenção:</strong> {criticalModels.length} modelo(s) com alta taxa de manutenção ({'>'}15%): {' '}
            {criticalModels.map(m => m.model).join(', ')}
          </AlertDescription>
        </Alert>
      )}

      {/* Resumo Geral */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total em Manutenção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {totalInMaintenance}
            </div>
            <p className="text-xs text-muted-foreground">
              {overallMaintenanceRate.toFixed(1)}% da frota
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Custo Estimado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalEstimatedCost)}
            </div>
            <p className="text-xs text-muted-foreground">
              Manutenções ativas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Modelos Críticos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {criticalModels.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Taxa {'>'}15%
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tempo Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {maintenanceData.length > 0 ? 
                (maintenanceData.reduce((sum, m) => sum + m.averageMaintenanceTime, 0) / maintenanceData.length).toFixed(0) : 
                '0'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Dias em manutenção
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Análise por Modelo */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Análise de Manutenção por Modelo</h3>
        <div className="grid gap-4">
          {maintenanceData.map((model, index) => {
            const getCriticalColor = (level: string) => {
              switch (level) {
                case 'high': return 'border-red-200 bg-red-50';
                case 'medium': return 'border-yellow-200 bg-yellow-50';
                default: return 'border-green-200 bg-green-50';
              }
            };

            const getCriticalBadge = (level: string) => {
              switch (level) {
                case 'high': return 'bg-red-100 text-red-700';
                case 'medium': return 'bg-yellow-100 text-yellow-700';
                default: return 'bg-green-100 text-green-700';
              }
            };
            
            return (
              <Card key={model.model} className={`hover:shadow-md transition-shadow ${getCriticalColor(model.criticalLevel)}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-orange-100 text-orange-700 rounded-full font-bold text-sm">
                        <Wrench className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">{model.model}</h4>
                        <p className="text-sm text-gray-500">
                          {model.totalMotorcycles} motos na frota
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getCriticalBadge(model.criticalLevel)}>
                        {model.criticalLevel === 'high' ? 'Crítico' :
                         model.criticalLevel === 'medium' ? 'Atenção' : 'Normal'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Taxa de Manutenção</p>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={Math.min(model.maintenanceRate, 100)} 
                          className="flex-1 h-2"
                        />
                        <span className={`text-sm font-medium ${
                          model.maintenanceRate > 15 ? 'text-red-600' :
                          model.maintenanceRate > 8 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {model.maintenanceRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Em Manutenção</p>
                      <div className="flex items-center gap-1">
                        <Wrench className="h-4 w-4 text-orange-600" />
                        <span className="font-semibold text-orange-600">
                          {model.inMaintenance} motos
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Tempo Médio</p>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold text-blue-600">
                          {model.averageMaintenanceTime.toFixed(0)} dias
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Custo Estimado</p>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-red-600" />
                        <span className="font-semibold text-red-600">
                          {formatCurrency(model.estimatedCost)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Disponibilidade: {((model.totalMotorcycles - model.inMaintenance) / model.totalMotorcycles * 100).toFixed(1)}%
                      </span>
                      <Badge variant="outline">
                        {model.totalMotorcycles - model.inMaintenance} disponíveis
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Nota Informativa */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Nota:</strong> Os custos de manutenção são estimativas baseadas em valores médios por modelo. 
          Os tempos de manutenção são calculados com base na data da última movimentação registrada.
        </AlertDescription>
      </Alert>
    </div>
  );
}