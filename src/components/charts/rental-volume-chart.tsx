
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, Legend } from "recharts"
import { ChartContainer, ChartTooltipContent, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";

export interface MonthlyRentalDataPoint {
  month: string; // "Jan", "Fev", etc.
  novas: number;
  usadas: number;
}

const chartConfig = {
  novas: {
    label: "Novas",
    color: "hsl(var(--chart-5))", // Green
  },
  usadas: {
    label: "Usadas",
    color: "hsl(var(--chart-3))", // Orange
  },
} satisfies ChartConfig;

export function RentalVolumeChart({ data }: { data: MonthlyRentalDataPoint[] | null }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
        Carregando dados do gráfico...
      </div>
    );
  }
  
  // Calculate total for LabelList positioning on stacked bars
  const processedData = data.map(item => ({
    ...item,
    total: item.novas + item.usadas,
  }));

  return (
    <div className="h-[300px] w-full">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={processedData} margin={{ top: 20, right: 10, left: -25, bottom: 5 }}>
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
              domain={[0, (dataMax: number) => Math.max(Math.ceil(dataMax * 1.1) + 1, 5)]}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--accent) / 0.1)' }}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Legend content={<ChartLegendContent />} verticalAlign="top" height={36} />
            <Bar dataKey="novas" stackId="a" fill="var(--color-novas)" radius={[2, 2, 0, 0]} barSize={20} />
            <Bar dataKey="usadas" stackId="a" fill="var(--color-usadas)" radius={[2, 2, 0, 0]} barSize={20}>
              <LabelList
                dataKey="total" // Display total count on top of the stack
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
