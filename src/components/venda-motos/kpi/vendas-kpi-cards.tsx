
"use client";

import { useState, useEffect } from 'react';
import { getVendasMotos } from '@/lib/firebase/vendaMotoService';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { DollarSign, Package, BarChartBig } from 'lucide-react';
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

      const calculatedKpis: Kpi[] = [
        {
          title: 'Receita Total',
          value: formatCurrency(totalRevenue),
          icon: DollarSign,
          description: 'Soma de todas as vendas no período.',
          iconBgColor: 'bg-green-100',
          iconColor: 'text-green-600',
          color: 'text-green-600', // Adiciona a cor ao valor
        },
        {
          title: 'Total de Motos Vendidas',
          value: totalMotos.toString(),
          icon: Package,
          description: 'Quantidade total de unidades vendidas.',
          iconBgColor: 'bg-blue-100',
          iconColor: 'text-blue-600',
          color: 'text-blue-600', // Adiciona a cor ao valor
        },
        {
          title: 'Ticket Médio por Moto',
          value: formatCurrency(averagePricePerMoto),
          icon: BarChartBig,
          description: 'Valor médio de venda por unidade.',
          iconBgColor: 'bg-purple-100',
          iconColor: 'text-purple-600',
          color: 'text-purple-600', // Adiciona a cor ao valor
        },
      ];

      setKpiData(calculatedKpis);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
        </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {kpiData.map((kpi) => (
        <KpiCard key={kpi.title} {...kpi} />
      ))}
    </div>
  );
}
