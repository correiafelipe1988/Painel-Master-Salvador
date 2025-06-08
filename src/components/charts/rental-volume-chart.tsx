
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { RentalDataPoint } from "@/lib/types";
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { useEffect, useState } from "react";

const generateMockRentalData = (): RentalDataPoint[] => Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit' }),
    nova: Math.floor(Math.random() * 15) + 3,
    usada: Math.floor(Math.random() * 10) + 2,
  };
});

const chartConfig = {
  nova: {
    label: "Motos Novas",
    color: "hsl(var(--chart-1))",
  },
  usada: {
    label: "Motos Usadas",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function RentalVolumeChart() {
  const [data, setData] = useState<RentalDataPoint[]>([]);

  useEffect(() => {
    setData(generateMockRentalData());
  }, []);
  
  if (!data.length) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">Motocicletas Alugadas Diariamente</CardTitle>
          <CardDescription>Volume nos últimos 30 dias (Novas vs. Usadas)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full flex items-center justify-center text-muted-foreground">
            Carregando dados do gráfico...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline">Motocicletas Alugadas Diariamente</CardTitle>
        <CardDescription>Volume nos últimos 30 dias (Novas vs. Usadas)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
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
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--accent) / 0.2)' }}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Legend wrapperStyle={{paddingTop: '20px'}}/>
                <Bar dataKey="nova" name="Motos Novas" stackId="a" fill="var(--color-nova)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="usada" name="Motos Usadas" stackId="a" fill="var(--color-usada)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
