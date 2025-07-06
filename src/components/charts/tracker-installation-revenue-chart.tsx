
"use client";

import { Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, LabelList, Line, ComposedChart, Legend } from "recharts";

interface ChartDataPoint {
  month: string;
  count: number;
  revenue: number;
}

interface TrackerInstallationRevenueChartProps {
  data: ChartDataPoint[] | null;
}

const formatCurrency = (value: number) => `R$${value.toFixed(0)}`;
const formatCount = (value: number) => `${value}`;

const RevenueLabel = (props: any) => {
  const { x, y, width, value } = props;
  if (value > 0) {
    // Center the label horizontally within the bar
    const textX = x + width / 2;
    return (
      <text x={textX} y={y} dy={-8} fill="hsl(221.2 83.2% 53.3%)" fontSize={12} textAnchor="middle">
        {formatCurrency(value)}
      </text>
    );
  }
  return null;
};

export function TrackerInstallationRevenueChart({ data }: TrackerInstallationRevenueChartProps) {
  if (!data || data.every(d => d.count === 0 && d.revenue === 0)) {
    return (
      <div className="flex justify-center items-center h-[350px]">
        <p className="text-muted-foreground">Não há dados de instalação ou receita para exibir.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart data={data} margin={{ top: 30, right: 0, left: 0, bottom: 0 }}>
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
  );
}
