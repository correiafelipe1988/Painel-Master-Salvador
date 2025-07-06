
"use client";

import { useState, useEffect } from 'react';
import { getVendasMotos } from '@/lib/firebase/vendaMotoService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RankData {
  rank: number;
  name: string;
  totalMotos: number;
  totalReceita: number;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

// Função para definir a cor do avatar do ranking
const getRankColor = (rank: number) => {
    switch (rank) {
        case 1:
            return "bg-green-100 text-green-700";
        case 2:
            return "bg-blue-100 text-blue-700";
        case 3:
            return "bg-orange-100 text-orange-700";
        default:
            return "bg-slate-100 text-slate-700";
    }
};

export function FranchiseeRankList() {
  const [data, setData] = useState<RankData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const vendas = await getVendasMotos();
      
      const franchiseeStats: { [key: string]: { totalMotos: number; totalReceita: number; } } = {};

      vendas.forEach(venda => {
        const key = venda.razao_social || 'Não especificado';
        if (!franchiseeStats[key]) {
            franchiseeStats[key] = { totalMotos: 0, totalReceita: 0 };
        }
        franchiseeStats[key].totalMotos += venda.quantidade;
        franchiseeStats[key].totalReceita += venda.valor_total;
      });

      const rankedData = Object.keys(franchiseeStats)
        .map(key => ({
          name: key,
          totalMotos: franchiseeStats[key].totalMotos,
          totalReceita: franchiseeStats[key].totalReceita,
        }))
        .sort((a, b) => b.totalReceita - a.totalReceita)
        .map((item, index) => ({
          ...item,
          rank: index + 1,
        }));

      setData(rankedData);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return <div>Carregando ranking...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Ranking de Compradores
        </CardTitle>
        <CardDescription>Compradores com maior valor total de aquisição.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item) => (
            <div key={item.rank} className="flex items-center gap-4">
              <Avatar className="hidden h-9 w-9 sm:flex">
                <AvatarFallback className={cn("font-semibold", getRankColor(item.rank))}>
                    {item.rank}
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-1 flex-1">
                <p className="text-sm font-medium leading-none">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.totalMotos} motos compradas</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-green-600">{formatCurrency(item.totalReceita)}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
