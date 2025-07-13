"use client";

import { Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, LabelList, Line, ComposedChart, Legend } from "recharts";
import { ManutencaoData } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface MaintenanceVolumeRevenueMonthlyChartProps {
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

function getAllMonths(year: number) {
  return Array.from({ length: 12 }, (_, i) => {
    const date = new Date(year, i, 1);
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'short' }),
    };
  });
}

function groupByMonth(data: ManutencaoData[]) {
  const result: Record<string, { count: number; revenue: number; date: Date }> = {};
  let minYear = new Date().getFullYear();
  data.forEach(item => {
    if (!item.data) return;
    const date = new Date(item.data);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!result[key]) result[key] = { count: 0, revenue: 0, date };
    result[key].count += 1;
    result[key].revenue += item.faturamento_pecas || 0;
    if (date.getFullYear() < minYear) minYear = date.getFullYear();
  });
  // Preencher todos os meses do ano
  const months = getAllMonths(minYear);
  return months.map(({ key, label }) => {
    const entry = result[key];
    return {
      month: label,
      count: entry ? entry.count : 0,
      revenue: entry ? entry.revenue : 0,
    };
  });
}

export function MaintenanceVolumeRevenueMonthlyChart({ data }: MaintenanceVolumeRevenueMonthlyChartProps) {
  const chartData = groupByMonth(data);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Volume e Receita de Manutenções (Mensal)</CardTitle>
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
              <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
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