"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ManutencaoData } from '@/lib/types';

interface MaintenanceClientRankListProps {
  data: ManutencaoData[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export function MaintenanceClientRankList({ data }: MaintenanceClientRankListProps) {
  // Agrupar por cliente
  const clientStats: { [key: string]: { volume: number; receita: number; } } = {};
  let totalVolume = 0;
  let totalReceita = 0;
  data.forEach(item => {
    const key = item.nome_cliente || 'Não especificado';
    if (!clientStats[key]) clientStats[key] = { volume: 0, receita: 0 };
    clientStats[key].volume += 1;
    clientStats[key].receita += item.valor_total || 0;
    totalVolume += 1;
    totalReceita += item.valor_total || 0;
  });

  const rankedData = Object.keys(clientStats)
    .map(key => ({
      name: key,
      volume: clientStats[key].volume,
      receita: clientStats[key].receita,
      pctVolume: totalVolume ? (clientStats[key].volume / totalVolume) * 100 : 0,
      pctReceita: totalReceita ? (clientStats[key].receita / totalReceita) * 100 : 0,
      media: clientStats[key].volume ? clientStats[key].receita / clientStats[key].volume : 0,
    }))
    .sort((a, b) => b.receita - a.receita)
    .map((item, index) => ({ ...item, rank: index + 1 }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Ranking de Clientes de Manutenção
        </CardTitle>
        <CardDescription>Clientes com maior volume e receita de manutenções.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {rankedData.map((item) => (
            <div key={item.rank} className="flex items-center gap-4">
              <Avatar className="hidden h-9 w-9 sm:flex">
                <AvatarFallback className={cn("font-semibold bg-slate-100 text-slate-700")}>{item.rank}</AvatarFallback>
              </Avatar>
              <div className="grid gap-1 flex-1">
                <p className="text-sm font-medium leading-none">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.volume} manutenções • {item.pctVolume.toFixed(1)}% do volume • Média: {formatCurrency(item.media)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-green-600">{formatCurrency(item.receita)}</p>
                <p className="text-xs text-blue-600">{item.pctReceita.toFixed(1)}% da receita</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 