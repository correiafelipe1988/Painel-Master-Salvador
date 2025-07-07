"use client";

import { Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, LabelList, Line, ComposedChart, Legend } from "recharts";
import { ManutencaoData } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface MaintenanceVolumeRevenueDailyChartProps {
  data: ManutencaoData[];
}

const formatCurrency = (value: number) => `R$${value.toFixed(0)}`;
const formatCount = (value: number) => `${value}`;

const RevenueLabel = (props: any) => {
  const { x, y, width, value } = props;
  if (value > 0) {
    const textX = x + width / 2;
    return (
      <text x={textX} y={y} dy={-8} fill="hsl(221.2 83.2% 53.3%)" fontSize={12} textAnchor="middle">
        {formatCurrency(value)}
      </text>
    );
  }
  return null;
};

function getAllDaysInRange(start: Date, end: Date) {
  const days = [];
  let current = new Date(start);
  while (current <= end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
}

function groupByDay(data: ManutencaoData[]) {
  const result: Record<string, { count: number; revenue: number; date: Date }> = {};
  let minDate: Date | null = null;
  let maxDate: Date | null = null;
  data.forEach(item => {
    if (!item.data) return;
    const date = new Date(item.data);
    const key = date.toISOString().split('T')[0];
    if (!result[key]) result[key] = { count: 0, revenue: 0, date };
    result[key].count += 1;
    result[key].revenue += item.valor_total || 0;
    if (!minDate || date < minDate) minDate = date;
    if (!maxDate || date > maxDate) maxDate = date;
  });
  // Preencher todos os dias do intervalo
  if (!minDate || !maxDate) return [];
  const days = getAllDaysInRange(minDate, maxDate);
  return days.map((date) => {
    const key = date.toISOString().split('T')[0];
    const entry = result[key];
    return {
      day: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      count: entry ? entry.count : 0,
      revenue: entry ? entry.revenue : 0,
    };
  });
}

export function MaintenanceVolumeRevenueDailyChart({ data }: MaintenanceVolumeRevenueDailyChartProps) {
  const chartData = groupByDay(data);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Volume e Receita de Manutenções (Diário)</CardTitle>
        <CardDescription>Volume de manutenções (barras) e receita correspondente (linha).</CardDescription>
      </CardHeader>
      <CardContent>
        {(!chartData || chartData.every(d => d.count === 0 && d.revenue === 0)) ? (
          <div className="flex justify-center items-center h-[350px]">
            <p className="text-muted-foreground">Não há dados de manutenção ou receita para exibir.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={chartData} margin={{ top: 30, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="day" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                yAxisId="left"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatCount}
                label={{ value: 'Volume', angle: -90, position: 'insideLeft', fill: '#888888' }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatCurrency}
                label={{ value: 'Receita', angle: -90, position: 'insideRight', fill: '#888888' }}
              />
              <Tooltip
                cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }}
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', border: '1px solid #ccc', borderRadius: '5px' }}
                formatter={(value: number, name: string) => {
                  if (name === 'Receita') {
                    return [formatCurrency(value), name];
                  }
                  return [formatCount(value), name];
                }}
              />
              <Legend verticalAlign="top" wrapperStyle={{top: 0}}/>
              <Bar yAxisId="left" dataKey="count" name="Volume" fill="hsl(142.1 76.2% 36.3%)" radius={[4, 4, 0, 0]}>
                <LabelList dataKey="count" position="center" style={{ fontSize: '12px', fill: 'white', fontWeight: 'bold' }} formatter={(value: number) => (value > 0 ? formatCount(value) : '')} />
                <LabelList dataKey="revenue" content={<RevenueLabel />} />
              </Bar>
              <Line yAxisId="right" type="monotone" dataKey="revenue" name="Receita" stroke="hsl(221.2 83.2% 53.3%)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
} 