
"use client";

import { useState, useEffect } from 'react';
import { Bar, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, ComposedChart, LabelList } from 'recharts';
import { getVendasMotos } from '@/lib/firebase/vendaMotoService';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

interface MonthlyData {
  month: string;
  receita: number;
  volume: number;
}

const formatCurrencyForAxis = (value: number) => {
    if (value >= 1000) return `R$${(value / 1000).toFixed(0)}k`;
    return `R$${value}`;
};

const CustomBarLabel = (props: any) => {
  const { x, y, width, height, value } = props;
  
  if (height < 20) {
    return null;
  }

  const formattedValue = new Intl.NumberFormat('pt-BR', {
    notation: 'compact',
    compactDisplay: 'short',
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1
  }).format(value);

  return (
    <text x={x + width / 2} y={y + height / 2} fill="#FFFFFF" textAnchor="middle" dominantBaseline="middle" fontSize={11} fontWeight="bold">
      {formattedValue}
    </text>
  );
};

const CustomLineLabel = (props: any) => {
  const { x, y, value } = props;
  if (value <= 0) return null;

  return (
    <text x={x} y={y} dy={-8} fill="#15803d" fontSize={12} fontWeight="bold" textAnchor="middle">
      {value}
    </text>
  );
};

export function CombinedSalesChart() {
  const [data, setData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const vendas = await getVendasMotos();
      
      const monthlyTotals: { [key: string]: { receita: number; volume: number } } = {};

      vendas.forEach(venda => {
        try {
          const date = parseISO(venda.data_compra);
          const monthKey = format(date, 'yyyy-MM');
          if (!monthlyTotals[monthKey]) {
            monthlyTotals[monthKey] = { receita: 0, volume: 0 };
          }
          monthlyTotals[monthKey].receita += venda.valor_total;
          monthlyTotals[monthKey].volume += venda.quantidade;
        } catch (error) {
            console.warn(`Data inválida para a venda ID: ${venda.id}`, venda.data_compra);
        }
      });

      const sortedMonthKeys = Object.keys(monthlyTotals).sort();

      const chartData = sortedMonthKeys.map(key => {
        const [year, month] = key.split('-');
        const date = new Date(Number(year), Number(month) - 1);
        return {
          month: format(date, 'MMM/yy', { locale: ptBR }),
          receita: monthlyTotals[key].receita,
          volume: monthlyTotals[key].volume,
        };
      });

      setData(chartData);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return <Skeleton className="h-[350px] w-full" />;
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
        <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis yAxisId="left" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatCurrencyForAxis} />
        <YAxis yAxisId="right" orientation="right" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip
            formatter={(value: number, name: string) => {
                if (name === 'Receita') {
                    return [new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value), 'Receita'];
                }
                if (name === 'Volume') {
                    return [`${value} motos`, 'Volume'];
                }
                return [value, name];
            }}
             cursor={{ fill: 'rgba(156, 163, 175, 0.1)' }}
        />
        <Legend />
        <Bar yAxisId="left" dataKey="receita" name="Receita" fill="#2563eb" radius={[4, 4, 0, 0]}>
            <LabelList dataKey="receita" content={<CustomBarLabel />} />
        </Bar>
        <Line yAxisId="right" type="monotone" dataKey="volume" name="Volume" stroke="#16a34a" strokeWidth={2}>
            <LabelList dataKey="volume" content={<CustomLineLabel />} />
        </Line>
      </ComposedChart>
    </ResponsiveContainer>
  );
}
