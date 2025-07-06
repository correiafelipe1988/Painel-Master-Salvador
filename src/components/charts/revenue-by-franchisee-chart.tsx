"use client";

import { Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, LabelList, BarChart } from "recharts";
import type { FranchiseeRevenue } from "@/lib/firebase/financialService";

interface RevenueByFranchiseeChartProps {
  data: FranchiseeRevenue[];
}

const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const RevenueLabel = (props: any) => {
  const { x, y, width, value } = props;
  if (value > 0) {
    const textX = x + width / 2;
    return (
      <text x={textX} y={y} dy={-8} fill="hsl(221.2 83.2% 53.3%)" fontSize={11} textAnchor="middle">
        {formatCurrency(value)}
      </text>
    );
  }
  return null;
};

export function RevenueByFranchiseeChart({ data }: RevenueByFranchiseeChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <p className="text-muted-foreground">Não há dados de receita para exibir.</p>
      </div>
    );
  }

  // Limitar a 10 franqueados para melhor visualização
  const chartData = data.slice(0, 10).map(item => ({
    name: item.franqueadoName.length > 15 ? 
      item.franqueadoName.substring(0, 15) + '...' : 
      item.franqueadoName,
    fullName: item.franqueadoName,
    weeklyRevenue: item.weeklyRevenue,
    monthlyRevenue: item.monthlyRevenue,
    motorcycleCount: item.motorcycleCount,
    occupationRate: item.occupationRate
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData} margin={{ top: 30, right: 30, left: 20, bottom: 60 }}>
        <XAxis 
          dataKey="name" 
          stroke="#888888" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatCurrency}
        />
        <Tooltip
          cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }}
          contentStyle={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
            border: '1px solid #ccc', 
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value: number, name: string) => {
            if (name === 'Receita Semanal') {
              return [formatCurrency(value), name];
            }
            return [value, name];
          }}
          labelFormatter={(label: string) => {
            const item = chartData.find(d => d.name === label);
            return item ? item.fullName : label;
          }}
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                  <p className="font-semibold text-gray-900">{data.fullName}</p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Receita Semanal:</span> {formatCurrency(data.weeklyRevenue)}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Receita Mensal:</span> {formatCurrency(data.monthlyRevenue)}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Motos:</span> {data.motorcycleCount}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Taxa Ocupação:</span> {data.occupationRate.toFixed(1)}%
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <Bar 
          dataKey="weeklyRevenue" 
          name="Receita Semanal"
          fill="hsl(142.1 76.2% 36.3%)" 
          radius={[4, 4, 0, 0]}
        >
          <LabelList content={<RevenueLabel />} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}