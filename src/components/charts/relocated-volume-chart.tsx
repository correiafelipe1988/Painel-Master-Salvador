
"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, LabelList } from "recharts";

interface ChartDataPoint {
  month: string;
  count: number;
}

interface RelocatedVolumeChartProps {
  data: ChartDataPoint[] | null;
}

export function RelocatedVolumeChart({ data }: RelocatedVolumeChartProps) {
  if (!data || data.every(d => d.count === 0)) {
    return (
      <div className="flex justify-center items-center h-[350px]">
        <p className="text-muted-foreground">Não há dados de relocação para exibir.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} margin={{ top: 30, right: 0, left: 0, bottom: 0 }}>
        <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Tooltip
          cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }}
          contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', border: '1px solid #ccc', borderRadius: '5px' }}
        />
        <Bar dataKey="count" name="Relocadas" fill="hsl(142.1 76.2% 36.3%)" radius={[4, 4, 0, 0]}>
          <LabelList dataKey="count" position="top" style={{ fontSize: '12px', fill: 'hsl(142.1 76.2% 36.3%)' }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
