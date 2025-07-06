"use client"

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface IdleTimeData {
  franqueado: string
  totalMotorcycles: number
  averageIdleDays: number
  motorcyclesAbove7Days: number
  percentualCriticas: number
}

interface IdleTimeAverageChartProps {
  data: IdleTimeData[]
}

const chartConfig = {
  averageIdleDays: {
    label: "Média de Dias Ociosos",
    color: "hsl(var(--chart-3))",
  },
}

export function IdleTimeAverageChart({ data }: IdleTimeAverageChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Média de Dias Ociosos por Franqueado</CardTitle>
        <CardDescription>
          Tendência da média de dias ociosos entre franqueados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart
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
              <Line 
                type="monotone" 
                dataKey="averageIdleDays" 
                stroke="var(--color-averageIdleDays)" 
                strokeWidth={3}
                dot={{ fill: "var(--color-averageIdleDays)", strokeWidth: 2, r: 6 }}
                name="Média de Dias Ociosos"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}