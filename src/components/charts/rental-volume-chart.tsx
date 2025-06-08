
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from "recharts"
import type { ChartDataPoint } from "@/lib/types"; // Alterado de RentalDataPoint para ChartDataPoint
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

const chartConfig = {
  count: { // Alterado para refletir uma única contagem
    label: "Alugadas",
    color: "hsl(var(--chart-2))", // Usando a cor que era para 'usada' como exemplo
  },
} satisfies ChartConfig;

export function RentalVolumeChart({ data }: { data: ChartDataPoint[] | null}) { // Prop data agora é ChartDataPoint[]
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
              tickCount={5}
              domain={[0, (dataMax: number) => Math.max(Math.ceil(dataMax * 1.1) +1, 5)]}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--accent) / 0.1)' }}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar dataKey="count" nameKey="Alugadas" fill="var(--color-count)" radius={[2, 2, 0, 0]} barSize={12}>
              <LabelList
                dataKey="count"
                position="top" // Alterado para 'top'
                style={{ fontSize: '10px', fill: 'hsl(var(--foreground))' }} // Estilo do rótulo
                formatter={(value: number) => value > 0 ? value : null}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
