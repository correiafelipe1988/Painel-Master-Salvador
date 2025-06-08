
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from "recharts"
import type { ChartConfig } from "@/components/ui/chart";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { translateMotorcycleStatus } from "@/lib/utils"; // Adicionaremos esta função

export interface StatusDistributionDataPoint {
  status: string; // O nome do status (ex: "Alugada")
  count: number;
  fill: string; // Cor para a barra (ex: "hsl(var(--chart-1))")
}

// O chartConfig aqui pode ser usado para a legenda ou tooltip, se necessário,
// mas as cores das barras virão da propriedade 'fill' nos dados.
const chartConfig = {
  count: {
    label: "Quantidade",
  },
} satisfies ChartConfig;

// Mapeamento de status para cores do tema
const statusColors: Record<string, string> = {
  'active': 'var(--chart-5)', // Verde para Disponível/Ativa
  'alugada': 'var(--chart-2)', // Azul para Alugada
  'inadimplente': 'hsl(var(--destructive))', // Vermelho para Inadimplente
  'manutencao': 'var(--chart-4)', // Amarelo/Laranja para Manutenção (usando chart-4 como exemplo)
  'recolhida': 'var(--chart-1)', // Azul/Teal para Recolhida
  'relocada': 'var(--chart-3)', // Laranja para Relocada
  'N/Definido': 'hsl(var(--muted-foreground))',
};


export function StatusDistributionChart({ data }: { data: StatusDistributionDataPoint[] | null }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[350px] w-full flex items-center justify-center text-muted-foreground">
        Não há dados de status para exibir ou estão carregando...
      </div>
    );
  }

  // Ordenar os dados para uma exibição mais consistente, se desejado
  const sortedData = [...data].sort((a, b) => b.count - a.count);


  return (
    <div className="h-[350px] w-full">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={sortedData} 
            layout="vertical"
            margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
            <XAxis 
              type="number" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={10} 
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              domain={[0, (dataMax: number) => Math.max(Math.ceil(dataMax * 1.1) +1, 5)]}
            />
            <YAxis
              dataKey="status"
              type="category"
              stroke="hsl(var(--muted-foreground))"
              fontSize={10}
              axisLine={false}
              tickLine={false}
              width={80} // Ajuste a largura para caber os rótulos
              tickFormatter={(value) => value.length > 12 ? `${value.substring(0,10)}...` : value}
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--accent) / 0.1)' }}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar dataKey="count" nameKey="Quantidade" radius={[0, 4, 4, 0]} barSize={20}>
              {sortedData.map((entry, index) => (
                <LabelList 
                  key={`label-${index}`}
                  dataKey="count" 
                  position="right" 
                  style={{ fontSize: '10px', fill: 'hsl(var(--foreground))' }} 
                  formatter={(value: number) => value > 0 ? value : null} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
