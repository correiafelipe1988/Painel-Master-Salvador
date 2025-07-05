
"use client";

import { useState, useEffect } from 'react';
import { getVendasMotos } from '@/lib/firebase/vendaMotoService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MotorcycleIcon } from '@/components/icons/motorcycle-icon';

interface ModelPerformanceData {
  modelo: string;
  totalVendido: number;
  receitaTotal: number;
  precoMedio: number;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export function SalesByModelTable() {
  const [data, setData] = useState<ModelPerformanceData[]>([]);
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

      const tableData = Object.keys(modelStats)
        .map(key => ({
          modelo: key,
          totalVendido: modelStats[key].totalVendido,
          receitaTotal: modelStats[key].receitaTotal,
          precoMedio: modelStats[key].totalVendido > 0 ? modelStats[key].receitaTotal / modelStats[key].totalVendido : 0,
        }))
        .sort((a, b) => b.totalVendido - a.totalVendido); // Ordena por mais vendidos

      setData(tableData);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return <div>Carregando tabela...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <MotorcycleIcon className="h-5 w-5" />
            Performance por Modelo
        </CardTitle>
        <CardDescription>Análise de vendas, receita e preço médio para cada modelo de moto.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Modelo da Moto</TableHead>
              <TableHead className="text-right">Unidades Vendidas</TableHead>
              <TableHead className="text-right">Receita Total</TableHead>
              <TableHead className="text-right">Preço Médio de Venda</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.modelo}>
                <TableCell className="font-medium">{item.modelo}</TableCell>
                <TableCell className="text-right font-bold">{item.totalVendido}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.receitaTotal)}</TableCell>
                <TableCell className="text-right text-green-600 font-semibold">{formatCurrency(item.precoMedio)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
