
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { RentalDataPoint } from "@/lib/types";
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { useEffect, useState } from "react";

const generateMockRentalData = (): RentalDataPoint[] => Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit' }),
    nova: Math.floor(Math.random() * 4) + 0, // Adjusted to match image scale
    usada: Math.floor(Math.random() * 3) + 0, // Adjusted to match image scale
  };
});

const chartConfig = {
  nova: {
    label: "Motos Novas",
    color: "hsl(var(--chart-1))", // Using chart-1 from theme
  },
  usada: {
    label: "Motos Usadas",
    color: "hsl(var(--chart-2))", // Using chart-2 from theme
  },
} satisfies ChartConfig;

export function RentalVolumeChart() {
  const [data, setData] = useState<RentalDataPoint[]>([]);

  useEffect(() => {
    setData(generateMockRentalData());
  }, []);
  
  if (!data.length) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
        Carregando dados do gráfico...
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full"> {/* Adjusted height */}
      <ChartContainer config={chartConfig} className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(tick) => {
                const dateParts = tick.split('/');
                if (dateParts.length === 3) {
                  return `${dateParts[0]}/${dateParts[1]}`; // Dia/Mês
                }
                return tick;
              }}
              stroke="hsl(var(--muted-foreground))"
              fontSize={10} // Smaller font for x-axis
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={10} // Smaller font for y-axis
              axisLine={false}
              tickLine={false}
              tickCount={5} // Match image y-axis ticks (0,2,4,6,8)
              domain={[0, 'dataMax + 1']}
            />
            <Tooltip 
              cursor={{ fill: 'hsl(var(--accent) / 0.1)' }}
              content={<ChartTooltipContent indicator="dot" />}
            />
            {/* Legend can be removed if not present in the reference image for this chart */}
            {/* <Legend wrapperStyle={{paddingTop: '20px'}}/> */}
            <Bar dataKey="nova" name="Motos Novas" stackId="a" fill="var(--color-nova)" radius={[2, 2, 0, 0]} barSize={6} />
            <Bar dataKey="usada" name="Motos Usadas" stackId="a" fill="var(--color-usada)" radius={[2, 2, 0, 0]} barSize={6} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
