
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from "recharts"
import type { ChartDataPoint } from "@/lib/types";
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

const chartConfig = {
  count: {
    label: "Locações Total",
    color: "hsl(var(--chart-5))", // New Green (Teal-ish)
  },
} satisfies ChartConfig;

interface MonthlyChartDataPoint extends Omit<ChartDataPoint, 'date'> {
  month: string;
}

export function TotalRentalsVolumeChart({ data }: { data: MonthlyChartDataPoint[] | null }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
        Carregando dados do gráfico...
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 10, left: -25, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="month"
              stroke="hsl(var(--muted-foreground))"
              fontSize={10}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={10}
              axisLine={false}
              tickLine={false}
              tickCount={5}
              domain={[0, (dataMax: number) => Math.max(Math.ceil(dataMax * 1.1) +1, 5)]}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--accent) / 0.1)' }}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar dataKey="count" nameKey="Locações Total" fill="var(--color-count)" radius={[2, 2, 0, 0]} barSize={12}>
              <LabelList 
                dataKey="count" 
                position="top" 
                style={{ fontSize: '10px', fill: 'hsl(var(--foreground))' }} 
                formatter={(value: number) => value > 0 ? value : null} 
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
