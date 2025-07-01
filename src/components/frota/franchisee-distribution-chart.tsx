"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { normalizeMotorcycleModel } from "@/lib/utils/modelNormalizer";
import type { Motorcycle } from "@/lib/types";

interface FranchiseeDistributionChartProps {
  motorcycles: Motorcycle[];
}

interface FranchiseeData {
  name: string;
  total: number;
  models: { [model: string]: number };
  topModel: string;
  topModelCount: number;
  occupationRate: number;
  revenueGenerating: number;
}

export function FranchiseeDistributionChart({ motorcycles }: FranchiseeDistributionChartProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const franchiseeData = useMemo(() => {
    const franchisees: { [key: string]: FranchiseeData } = {};
    
    motorcycles.forEach(moto => {
      if (!moto.franqueado) return;
      
      const franchiseeKey = moto.franqueado.trim();
      if (!franchisees[franchiseeKey]) {
        franchisees[franchiseeKey] = {
          name: franchiseeKey,
          total: 0,
          models: {},
          topModel: '',
          topModelCount: 0,
          occupationRate: 0,
          revenueGenerating: 0
        };
      }
      
      const franchisee = franchisees[franchiseeKey];
      franchisee.total++;
      
      if (moto.model) {
        const modelKey = normalizeMotorcycleModel(moto.model);
        franchisee.models[modelKey] = (franchisee.models[modelKey] || 0) + 1;
      }
      
      if (moto.status === 'alugada' || moto.status === 'relocada') {
        franchisee.revenueGenerating++;
      }
    });
    
    Object.values(franchisees).forEach(franchisee => {
      let maxCount = 0;
      let topModel = '';
      Object.entries(franchisee.models).forEach(([model, count]) => {
        if (count > maxCount) {
          maxCount = count;
          topModel = model;
        }
      });
      franchisee.topModel = topModel;
      franchisee.topModelCount = maxCount;
      
      franchisee.occupationRate = franchisee.total > 0 ? 
        (franchisee.revenueGenerating / franchisee.total) * 100 : 0;
    });
    
    return Object.values(franchisees).sort((a, b) => b.total - a.total);
  }, [motorcycles]);

  const filteredFranchisees = useMemo(() => {
    if (!searchTerm) return franchiseeData;
    return franchiseeData.filter(f => 
      f.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [franchiseeData, searchTerm]);

  const totalMotorcycles = motorcycles.length;

  return (
    <div className="space-y-6">
      {/* Resumo Geral */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Franqueados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {franchiseeData.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Com motos na frota
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Média por Franqueado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {franchiseeData.length > 0 ? (totalMotorcycles / franchiseeData.length).toFixed(1) : '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Motos por franqueado
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Maior Frota
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {franchiseeData.length > 0 ? franchiseeData[0].total : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {franchiseeData.length > 0 ? franchiseeData[0].name : 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista Detalhada */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Distribuição por Franqueado</h3>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input 
              placeholder="Buscar franqueado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredFranchisees.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500">Nenhum franqueado encontrado.</p>
          </div>
        )}

        <div className="grid gap-4">
          {filteredFranchisees.map((franchisee, index) => {
            const percentage = totalMotorcycles > 0 ? (franchisee.total / totalMotorcycles) * 100 : 0;
            
            return (
              <Card key={franchisee.name} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold">{franchisee.name}</h4>
                        <p className="text-sm text-gray-500">
                          {Object.keys(franchisee.models).length} modelos diferentes
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="font-semibold">
                        {franchisee.total} motos
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {percentage.toFixed(1)}% da frota
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Modelo principal:</span>
                      <Badge className="bg-purple-100 text-purple-700">
                        {franchisee.topModel} ({franchisee.topModelCount})
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Taxa de ocupação:</span>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={franchisee.occupationRate} 
                          className="w-20 h-2"
                        />
                        <span className={`text-sm font-medium ${
                          franchisee.occupationRate >= 85 ? 'text-green-600' :
                          franchisee.occupationRate >= 75 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {franchisee.occupationRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Motos gerando receita:</span>
                      <Badge className="bg-green-100 text-green-700">
                        {franchisee.revenueGenerating} de {franchisee.total}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-500 mb-2">Distribuição de modelos:</p>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(franchisee.models)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 5)
                        .map(([model, count]) => (
                          <Badge key={model} variant="secondary" className="text-xs">
                            {model}: {count}
                          </Badge>
                        ))}
                      {Object.keys(franchisee.models).length > 5 && (
                        <Badge variant="secondary" className="text-xs">
                          +{Object.keys(franchisee.models).length - 5} mais
                        </Badge>
                      )}
                    </div>
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