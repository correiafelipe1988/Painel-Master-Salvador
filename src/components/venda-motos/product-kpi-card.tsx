
"use client";

import { useState, useEffect } from 'react';
import { getVendasMotos } from '@/lib/firebase/vendaMotoService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trophy, Star } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

interface ProductKpiData {
    mostSoldModel: string;
    highestRevenueModel: string;
}

export function ProductKpiCard() {
  const [data, setData] = useState<ProductKpiData>({ mostSoldModel: 'N/A', highestRevenueModel: 'N/A' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const vendas = await getVendasMotos();
      
      const modelStats: { [key: string]: { totalVendido: number; receitaTotal: number; } } = {};

      vendas.forEach(venda => {
        const key = venda.modelo || 'Não especificado';
        if (!modelStats[key]) {
            modelStats[key] = { totalVendido: 0, receitaTotal: 0 };
        }
        modelStats[key].totalVendido += venda.quantidade;
        modelStats[key].receitaTotal += venda.valor_total;
      });

      const mostSold = Object.keys(modelStats)
        .sort((a, b) => modelStats[b].totalVendido - modelStats[a].totalVendido);
      
      const highestRevenue = Object.keys(modelStats)
        .sort((a, b) => modelStats[b].receitaTotal - modelStats[a].receitaTotal);

      setData({
          mostSoldModel: mostSold.length > 0 ? mostSold[0] : 'N/A',
          highestRevenueModel: highestRevenue.length > 0 ? highestRevenue[0] : 'N/A',
      });
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-6">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Destaques de Produto</CardTitle>
        <CardDescription>Modelos com a melhor performance em vendas.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
                <Trophy className="h-6 w-6 text-yellow-500" />
                <span className="font-medium">Mais Vendido (Volume)</span>
            </div>
            <span className="font-bold text-lg">{data.mostSoldModel}</span>
        </div>
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
                <Star className="h-6 w-6 text-amber-500" />
                <span className="font-medium">Maior Receita Gerada</span>
            </div>
            <span className="font-bold text-lg">{data.highestRevenueModel}</span>
        </div>
      </CardContent>
    </Card>
  );
}
