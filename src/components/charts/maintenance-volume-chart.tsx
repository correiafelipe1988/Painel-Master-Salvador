
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import type { ChartDataPoint } from "@/lib/types";
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

const chartConfig = {
  count: {
    label: "Manutenção",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

export function MaintenanceVolumeChart({ data }: { data: ChartDataPoint[] | null }) {
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
          <BarChart data={data} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              tickFormatter={(tick) => {
                const dateParts = tick.split('/');
                if (dateParts.length === 3) {
                  return `${dateParts[0]}/${dateParts[1]}`;
                }
                return tick;
              }}
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
              tickCount={4}
              domain={[0, 'dataMax + 1']}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--accent) / 0.1)' }}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar dataKey="count" nameKey="Manutenção" fill="var(--color-count)" radius={[2, 2, 0, 0]} barSize={12} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
