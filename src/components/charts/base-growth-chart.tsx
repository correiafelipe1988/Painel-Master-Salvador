
"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from "recharts"
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

export interface MonthlyBaseGrowthDataPoint {
  month: string; // "Jan", "Fev", etc.
  cumulativeCount: number;
}

const chartConfig = {
  cumulativeCount: {
    label: "Total de Motos na Base",
    color: "hsl(var(--chart-1))", 
  },
} satisfies ChartConfig;

export function BaseGrowthChart({ data }: { data: MonthlyBaseGrowthDataPoint[] | null }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
        Carregando dados do gráfico de crescimento...
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 20, // Increased top margin for LabelList
              right: 10,
              left: -15, // Adjusted for Y-axis labels
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              stroke="hsl(var(--muted-foreground))"
              fontSize={10}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              stroke="hsl(var(--muted-foreground))"
              fontSize={10}
              domain={[0, (dataMax: number) => Math.max(Math.ceil(dataMax * 1.1) +1, 10)]} // Ensure Y-axis starts at 0 and gives some headroom
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--accent) / 0.1)' }}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="cumulativeCount"
              type="monotone"
              fill="var(--color-cumulativeCount)"
              fillOpacity={0.3}
              stroke="var(--color-cumulativeCount)"
              stackId="a"
            >
              <LabelList 
                dataKey="cumulativeCount" 
                position="top" 
                style={{ fontSize: '10px', fill: 'hsl(var(--foreground))' }} 
                formatter={(value: number) => value > 0 ? value : null} 
              />
            </Area>
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}

    