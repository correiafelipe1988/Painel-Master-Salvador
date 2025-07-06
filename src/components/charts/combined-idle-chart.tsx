"use client"

import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"

interface IdleTimeData {
  franqueado: string
  totalMotorcycles: number
  averageIdleDays: number
  motorcyclesAbove7Days: number
  percentualCriticas: number
}

interface CombinedIdleChartProps {
  data: IdleTimeData[]
}

const chartConfig = {
  motorcyclesAbove7Days: {
    label: "Motos Ociosas (+7 dias)",
    color: "#4f46e5", // Azul da navegação
  },
  averageIdleDays: {
    label: "Média de Dias Ociosos",
    color: "#10b981", // Verde para a linha
  },
}

// Componente customizado para renderizar labels nas barras
const renderCustomizedLabel = (props: any) => {
  const { x, y, width, height, value } = props;
  return (
    <text 
      x={x + width / 2} 
      y={y + height / 2} 
      fill="#fff" 
      textAnchor="middle" 
      dy={6}
      fontSize="12"
      fontWeight="bold"
    >
      {value}
    </text>
  );
};

// Componente customizado para renderizar labels na linha
const renderLineLabel = (props: any) => {
  const { x, y, value } = props;
  return (
    <text
      x={x}
      y={y - 10}
      fill="#10b981"
      textAnchor="middle"
      fontSize="12"
      fontWeight="bold"
    >
      {value}
    </text>
  );
};

export function CombinedIdleChart({ data }: CombinedIdleChartProps) {
  // Ordenar dados por volume de motos ociosas (decrescente)
  const sortedData = [...data].sort((a, b) => b.motorcyclesAbove7Days - a.motorcyclesAbove7Days);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🏍️ Análise de Ociosidade por Franqueado
        </CardTitle>
        <CardDescription>
          Volume de motos ociosas (barras) e média de dias ociosos (linha).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart
              data={sortedData}
              margin={{
                top: 40,
                right: 30,
                left: 20,
                bottom: 100,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="franqueado" 
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={11}
                interval={0}
                stroke="#666"
              />
              <YAxis
                yAxisId="left"
                orientation="left"
                stroke="#666"
                fontSize={11}
                label={{ value: 'Volume', angle: -90, position: 'insideLeft' }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#10b981"
                fontSize={11}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 border rounded shadow-lg border-gray-200">
                        <p className="font-medium text-gray-800 mb-2">{label}</p>
                        {payload.map((entry, index) => (
                          <p key={index} className="text-sm" style={{ color: entry.color }}>
                            <span className="font-medium">{entry.name}:</span> {entry.value}
                            {entry.dataKey === 'averageIdleDays' ? ' dias' : ' motos'}
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="rect"
                wrapperStyle={{ paddingBottom: '20px' }}
              />
              
              {/* Barra para motos ociosas */}
              <Bar 
                yAxisId="left"
                dataKey="motorcyclesAbove7Days" 
                fill={chartConfig.motorcyclesAbove7Days.color}
                name="Motos Ociosas"
                radius={[4, 4, 0, 0]}
              >
                <LabelList content={renderCustomizedLabel} />
              </Bar>
              
              {/* Linha para média de dias ociosos */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="averageIdleDays"
                stroke={chartConfig.averageIdleDays.color}
                strokeWidth={3}
                dot={{
                  fill: chartConfig.averageIdleDays.color,
                  strokeWidth: 2,
                  r: 6,
                  stroke: "#fff"
                }}
                name="Média Dias"
              >
                <LabelList content={renderLineLabel} />
              </Line>
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}