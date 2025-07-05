
"use client";

import { useState, useEffect } from 'react';
import { getVendasMotos } from '@/lib/firebase/vendaMotoService';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { DollarSign, Package, BarChartBig, HandCoins } from 'lucide-react';
import { type Kpi } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export function VendasKpiCards() {
  const [kpiData, setKpiData] = useState<Kpi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const vendas = await getVendasMotos();
      
      let totalRevenue = 0;
      let totalMotos = 0;

      vendas.forEach(venda => {
        totalRevenue += venda.valor_total;
        totalMotos += venda.quantidade;
      });

      const averagePricePerMoto = totalMotos > 0 ? totalRevenue / totalMotos : 0;
      const intermediationFee = 500;
      const intermediationRevenue = totalMotos * intermediationFee;

      const calculatedKpis: Kpi[] = [
        {
          title: 'Receita Total',
          value: formatCurrency(totalRevenue),
          icon: DollarSign,
          description: 'Soma de todas as vendas no período.',
          iconBgColor: 'bg-green-100',
          iconColor: 'text-green-600',
          color: 'text-green-600',
        },
        {
          title: 'Total de Motos Vendidas',
          value: totalMotos.toString(),
          icon: Package,
          description: 'Quantidade total de unidades vendidas.',
          iconBgColor: 'bg-blue-100',
          iconColor: 'text-blue-600',
          color: 'text-blue-600',
        },
        {
            title: 'Receita Taxa de Intermediação',
            value: formatCurrency(intermediationRevenue),
            icon: HandCoins,
            description: `Taxa de R$ ${intermediationFee},00 por moto.`,
            iconBgColor: 'bg-orange-100',
            iconColor: 'text-orange-600',
            color: 'text-orange-600',
        },
        {
          title: 'Ticket Médio por Moto',
          value: formatCurrency(averagePricePerMoto),
          icon: BarChartBig,
          description: 'Valor médio de venda por unidade.',
          iconBgColor: 'bg-purple-100',
          iconColor: 'text-purple-600',
          color: 'text-purple-600',
        },
      ];

      setKpiData(calculatedKpis);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
        </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpiData.map((kpi) => (
        <KpiCard key={kpi.title} {...kpi} />
      ))}
    </div>
  );
}
