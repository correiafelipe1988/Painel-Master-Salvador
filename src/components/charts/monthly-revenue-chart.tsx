"use client";

import { Line, ResponsiveContainer, XAxis, YAxis, Tooltip, LineChart, Bar, ComposedChart, Legend } from "recharts";
import type { MonthlyRevenueData } from "@/lib/firebase/financialService";

interface MonthlyRevenueChartProps {
  data: MonthlyRevenueData[];
  year: number;
}

const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export function MonthlyRevenueChart({ data, year }: MonthlyRevenueChartProps) {
  if (!data || data.every(d => d.revenue === 0)) {
    return (
      <div className="flex justify-center items-center h-[350px]">
        <p className="text-muted-foreground">Não há dados de receita para o ano {year}.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <XAxis 
          dataKey="month" 
          stroke="#888888" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
        />
        <YAxis
          yAxisId="left"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatCurrency}
          label={{ value: 'Receita Semanal', angle: -90, position: 'insideLeft', fill: '#888888' }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          label={{ value: 'Qtd Motos', angle: -90, position: 'insideRight', fill: '#888888' }}
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
            if (name === 'Receita' || name === 'Ticket Médio') {
              return [formatCurrency(value), name];
            }
            return [value, name];
          }}
          labelFormatter={(label) => `${label} ${year}`}
        />
        <Legend />
        <Bar 
          yAxisId="right"
          dataKey="motorcycleCount" 
          name="Qtd Motos"
          fill="hsl(210 40% 80%)" 
          radius={[2, 2, 0, 0]}
          opacity={0.7}
        />
        <Line 
          yAxisId="left"
          type="monotone" 
          dataKey="revenue" 
          name="Receita"
          stroke="hsl(142.1 76.2% 36.3%)" 
          strokeWidth={3}
          dot={{ r: 4, fill: "hsl(142.1 76.2% 36.3%)" }} 
          activeDot={{ r: 6, fill: "hsl(142.1 76.2% 36.3%)" }}
        />
        <Line 
          yAxisId="left"
          type="monotone" 
          dataKey="averageTicket" 
          name="Ticket Médio"
          stroke="hsl(221.2 83.2% 53.3%)" 
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={{ r: 3, fill: "hsl(221.2 83.2% 53.3%)" }} 
          activeDot={{ r: 5, fill: "hsl(221.2 83.2% 53.3%)" }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}