
"use client";

import { PageHeader } from "@/components/shared/page-header";
import { ProductPerformanceList } from "./product-performance-list";
import { CombinedSalesChart } from "./charts/combined-sales-chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart } from "lucide-react";

export function AnaliseProdutoView() {
  return (
    <>
      {/* 1. Cabeçalho da Página */}
      <PageHeader
        title="Análise de Produto"
        description="Visualize a performance detalhada de vendas e o ranking por modelo de moto."
      />

      {/* 2. Gráfico de Análise Mensal */}
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Análise Mensal de Vendas
            </CardTitle>
            <CardDescription>
              Receita (barras) e volume de motos vendidas (linha).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CombinedSalesChart />
          </CardContent>
        </Card>
      </div>

      {/* 3. Ranking de Performance por Modelo */}
      <div className="p-4 pt-0">
        <h2 className="text-xl font-bold mb-4">Ranking de Performance por Modelo</h2>
        <ProductPerformanceList />
      </div>
    </>
  );
}
