
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { RentalDataPoint } from "@/lib/types";
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

const mockRentalData: RentalDataPoint[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }), // YYYY-MM-DD
    nova: Math.floor(Math.random() * 15) + 3,
    usada: Math.floor(Math.random() * 10) + 2,
  };
});

const chartConfig = {
  nova: {
    label: "New Bikes",
    color: "hsl(var(--chart-1))",
  },
  usada: {
    label: "Used Bikes",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function RentalVolumeChart() {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline">Daily Rented Motorcycles</CardTitle>
        <CardDescription>Volume over the last 30 days (New vs. Used)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockRentalData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(tick) => new Date(tick).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
                <Bar dataKey="nova" name="New Bikes" stackId="a" fill="var(--color-nova)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="usada" name="Used Bikes" stackId="a" fill="var(--color-usada)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
