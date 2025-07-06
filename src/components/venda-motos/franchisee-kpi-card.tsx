
"use client";

import { useState, useEffect } from 'react';
import { getVendasMotos } from '@/lib/firebase/vendaMotoService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, DollarSign, Award } from 'lucide-react';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export function FranchiseeKpiCard() {
  const [stats, setStats] = useState({
    totalCompradores: 0,
    ticketMedioGeral: 0,
    compradorDestaque: 'N/A',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const vendas = await getVendasMotos();
      
      const franchiseeStats: { [key: string]: { totalReceita: number; totalTransacoes: number; } } = {};
      let totalReceitaGeral = 0;
      let totalTransacoesGeral = 0;

      vendas.forEach(venda => {
        const key = venda.razao_social || 'Não especificado';
        if (!franchiseeStats[key]) {
            franchiseeStats[key] = { totalReceita: 0, totalTransacoes: 0 };
        }
        franchiseeStats[key].totalReceita += venda.valor_total;
        franchiseeStats[key].totalTransacoes += 1;
        totalReceitaGeral += venda.valor_total;
        totalTransacoesGeral += 1;
      });

      const rankedData = Object.keys(franchiseeStats)
        .map(key => ({
          name: key,
          totalReceita: franchiseeStats[key].totalReceita,
        }))
        .sort((a, b) => b.totalReceita - a.totalReceita);

      setStats({
          totalCompradores: Object.keys(franchiseeStats).length,
          ticketMedioGeral: totalTransacoesGeral > 0 ? totalReceitaGeral / totalTransacoesGeral : 0,
          compradorDestaque: rankedData.length > 0 ? rankedData[0].name : 'N/A',
      });

      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return <div>Carregando métricas...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Métricas por Comprador</CardTitle>
        <CardDescription>Performance geral dos compradores.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-muted-foreground" />
                <span className="font-medium">Total de Compradores</span>
            </div>
            <span className="font-bold text-lg">{stats.totalCompradores}</span>
        </div>
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
                <DollarSign className="h-6 w-6 text-muted-foreground" />
                <span className="font-medium">Ticket Médio por Venda</span>
            </div>
            <span className="font-bold text-lg text-green-600">{formatCurrency(stats.ticketMedioGeral)}</span>
        </div>
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
                <Award className="h-6 w-6 text-muted-foreground" />
                <span className="font-medium">Comprador Destaque</span>
            </div>
            <span className="font-bold text-sm text-right">{stats.compradorDestaque}</span>
        </div>
      </CardContent>
    </Card>
  );
}
