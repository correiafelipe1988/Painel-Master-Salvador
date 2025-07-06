"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface IdleTimeData {
  franqueado: string
  totalMotorcycles: number
  averageIdleDays: number
  motorcyclesAbove7Days: number
  percentualCriticas: number
}

interface IdleTimeDistributionChartProps {
  data: IdleTimeData[]
}

const chartConfig = {
  totalMotorcycles: {
    label: "Total de Motos",
    color: "hsl(var(--chart-1))",
  },
  motorcyclesAbove7Days: {
    label: "Motos +7 Dias",
    color: "hsl(var(--chart-2))",
  },
}

export function IdleTimeDistributionChart({ data }: IdleTimeDistributionChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição de Motos por Franqueado</CardTitle>
        <CardDescription>
          Comparação entre total de motos e motos com mais de 7 dias ociosas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="franqueado" 
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
              />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar 
                dataKey="totalMotorcycles" 
                fill="var(--color-totalMotorcycles)" 
                name="Total de Motos"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="motorcyclesAbove7Days" 
                fill="var(--color-motorcyclesAbove7Days)" 
                name="Motos +7 Dias"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}