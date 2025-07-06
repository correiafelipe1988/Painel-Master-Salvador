"use client";

import { useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { normalizeMotorcycleModel } from "@/lib/utils/modelNormalizer";
import type { Motorcycle } from "@/lib/types";

interface ModelAnalysisTableProps {
  motorcycles: Motorcycle[];
  compact?: boolean;
}

interface ModelData {
  model: string;
  total: number;
  alugadas: number;
  active: number;
  manutencao: number;
  recolhida: number;
  relocada: number;
  totalRevenue: number;
  averageTicket: number;
  occupationRate: number;
  franchisees: Set<string>;
}

const formatCurrency = (value: number) => 
  `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function ModelAnalysisTable({ motorcycles, compact = false }: ModelAnalysisTableProps) {
  const modelData = useMemo(() => {
    const models: { [key: string]: ModelData } = {};
    
    motorcycles.forEach(moto => {
      if (!moto.model) return;
      
      // Normalizar o nome do modelo para unificar variações
      const modelKey = normalizeMotorcycleModel(moto.model);
      if (!models[modelKey]) {
        models[modelKey] = {
          model: modelKey,
          total: 0,
          alugadas: 0,
          active: 0,
          manutencao: 0,
          recolhida: 0,
          relocada: 0,
          totalRevenue: 0,
          averageTicket: 0,
          occupationRate: 0,
          franchisees: new Set()
        };
      }
      
      const model = models[modelKey];
      model.total++;
      
      // Contar por status
      switch (moto.status) {
        case 'alugada':
          model.alugadas++;
          break;
        case 'active':
          model.active++;
          break;
        case 'manutencao':
          model.manutencao++;
          break;
        case 'recolhida':
          model.recolhida++;
          break;
        case 'relocada':
          model.relocada++;
          break;
      }
      
      // Calcular receita
      if ((moto.status === 'alugada' || moto.status === 'relocada') && moto.valorSemanal) {
        model.totalRevenue += moto.valorSemanal;
      }
      
      // Adicionar franqueado
      if (moto.franqueado) {
        model.franchisees.add(moto.franqueado.trim());
      }
    });
    
    // Calcular métricas finais
    Object.values(models).forEach(model => {
      const revenueGenerating = model.alugadas + model.relocada;
      model.averageTicket = revenueGenerating > 0 ? model.totalRevenue / revenueGenerating : 0;
      model.occupationRate = model.total > 0 ? (revenueGenerating / model.total) * 100 : 0;
    });
    
    return Object.values(models).sort((a, b) => b.total - a.total);
  }, [motorcycles]);

  if (compact) {
    return (
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {modelData.slice(0, 8).map((model, index) => (
          <div key={model.model} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full font-bold text-sm">
                {index + 1}
              </div>
              <div>
                <p className="font-medium text-sm">{model.model}</p>
                <p className="text-xs text-gray-500">
                  {model.total} motos • {model.franchisees.size} franqueados
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-blue-600 text-sm">
                {model.occupationRate.toFixed(1)}%
              </p>
              <p className="text-xs text-green-600">
                {formatCurrency(model.averageTicket)}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold">Modelo</TableHead>
            <TableHead className="text-center">Total</TableHead>
            <TableHead className="text-center">Alugadas</TableHead>
            <TableHead className="text-center">Disponíveis</TableHead>
            <TableHead className="text-center">Manutenção</TableHead>
            <TableHead className="text-center">Relocadas</TableHead>
            <TableHead className="text-center">Recolhidas</TableHead>
            <TableHead className="text-center">Taxa Ocupação</TableHead>
            <TableHead className="text-center">Ticket Médio</TableHead>
            <TableHead className="text-center">Receita Semanal</TableHead>
            <TableHead className="text-center">Franqueados</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {modelData.map((model) => (
            <TableRow key={model.model}>
              <TableCell className="font-medium">{model.model}</TableCell>
              <TableCell className="text-center">
                <Badge variant="outline" className="font-semibold">
                  {model.total}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge className="bg-blue-100 text-blue-700">
                  {model.alugadas}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge className="bg-green-100 text-green-700">
                  {model.active}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge className="bg-purple-100 text-purple-700">
                  {model.manutencao}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge className="bg-gray-100 text-gray-700">
                  {model.relocada}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge className="bg-orange-100 text-orange-700">
                  {model.recolhida}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center gap-2">
                  <Progress 
                    value={model.occupationRate} 
                    className="w-16 h-2"
                  />
                  <span className={`text-sm font-medium ${
                    model.occupationRate >= 85 ? 'text-green-600' :
                    model.occupationRate >= 75 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {model.occupationRate.toFixed(1)}%
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-center font-medium text-green-600">
                {formatCurrency(model.averageTicket)}
              </TableCell>
              <TableCell className="text-center font-medium text-blue-600">
                {formatCurrency(model.totalRevenue)}
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="secondary">
                  {model.franchisees.size}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}