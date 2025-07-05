
"use client";

import { useState, useEffect } from "react";
import { getVendasMotos } from "@/lib/firebase/vendaMotoService";
import { ProductPerformanceCard } from "./product-performance-card";
import { Skeleton } from "@/components/ui/skeleton";

// Tipagem para os dados de performance processados
interface ModelPerformance {
  rank: number;
  modelName: string;
  unitsSold: number;
  totalRevenue: number;
  averagePrice: number;
  revenuePercentage: number;
  isTopThree: boolean; // Alterado para refletir a nova lógica
}

// Componente de Skeleton para o loading
const PerformanceListSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-40 w-full" />
    <Skeleton className="h-40 w-full" />
    <Skeleton className="h-40 w-full" />
  </div>
);

export function ProductPerformanceList() {
  const [performanceData, setPerformanceData] = useState<ModelPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const vendas = await getVendasMotos();
        
        const statsByModel = vendas.reduce((acc, venda) => {
          const model = venda.modelo || 'Não Especificado';
          if (!acc[model]) {
            acc[model] = { unitsSold: 0, totalRevenue: 0 };
          }
          acc[model].unitsSold += venda.quantidade;
          acc[model].totalRevenue += venda.valor_total;
          return acc;
        }, {});

        const grandTotalRevenue = Object.values(statsByModel).reduce((sum: number, model: any) => sum + model.totalRevenue, 0);

        const processedData = Object.entries(statsByModel)
          .map(([modelName, stats]: [string, any]) => ({
            modelName,
            unitsSold: stats.unitsSold,
            totalRevenue: stats.totalRevenue,
            averagePrice: stats.unitsSold > 0 ? stats.totalRevenue / stats.unitsSold : 0,
            revenuePercentage: grandTotalRevenue > 0 ? (stats.totalRevenue / grandTotalRevenue) * 100 : 0,
          }))
          .sort((a, b) => b.totalRevenue - a.totalRevenue)
          .map((data, index) => ({
            ...data,
            rank: index + 1,
            isTopThree: index < 3, // A lógica agora checa se o item está no Top 3
          }));

        setPerformanceData(processedData);
      } catch (error) {
        console.error("Erro ao buscar ou processar dados de performance:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <PerformanceListSkeleton />;
  }

  if (performanceData.length === 0) {
    return <p className="text-center text-muted-foreground mt-8">Nenhum dado de performance encontrado.</p>;
  }

  return (
    <div className="space-y-4">
      {performanceData.map((data) => (
        <ProductPerformanceCard key={data.rank} {...data} />
      ))}
    </div>
  );
}
