
"use client"

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { ChartConfig } from "@/components/ui/chart";
import { ChartContainer, ChartTooltipContent, ChartLegendContent } from "@/components/ui/chart"

export interface StatusDistributionPieDataPoint {
  name: string;      // Translated status name (e.g., "Alugada")
  value: number;     // Percentage value for the pie slice (e.g., 45.5 for 45.5%)
  count: number;     // Raw count of motorcycles in this status
  fill: string;      // Color for the pie slice (e.g., "hsl(var(--chart-1))")
}

const chartConfig = {} satisfies ChartConfig; // Simplified, colors come from data

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as StatusDistributionPieDataPoint;
    return (
      <div className="rounded-lg border bg-background p-2.5 shadow-lg">
        <p className="text-sm font-medium text-foreground">{`${data.name}`}</p>
        <p className="text-xs text-muted-foreground">{`Percentual: ${data.value.toFixed(1)}%`}</p>
        <p className="text-xs text-muted-foreground">{`Contagem: ${data.count}`}</p>
      </div>
    );
  }
  return null;
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.6; // Adjust label position
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent * 100 < 3) return null; // Don't show label for very small slices

  return (
    <text
      x={x}
      y={y}
      fill="hsl(var(--primary-foreground))" // Use a contrasting color for text on slices
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize="10px"
      fontWeight="medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};


export function StatusDistributionChart({ data }: { data: StatusDistributionPieDataPoint[] | null }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[350px] w-full flex items-center justify-center text-muted-foreground">
        Não há dados de status para exibir ou estão carregando...
      </div>
    );
  }
  
  // Prepare chartConfig dynamically for ChartLegendContent based on input data
  const dynamicChartConfig: ChartConfig = data.reduce((acc, item) => {
    // Create a key for the config, e.g., 'Alugada', replacing spaces for safety if any
    const configKey = item.name.replace(/\s+/g, '_'); 
    acc[configKey] = { label: item.name, color: item.fill };
    return acc;
  }, {} as ChartConfig);

  // Data for legend needs to match what ChartLegendContent expects: array of objects with 'value' (label) and 'color'
   const legendPayload = data.map(item => ({
    value: item.name, // The label for the legend item
    color: item.fill, // The color for the legend item
    type: 'square', // Optional: shape of the legend icon
  }));


  return (
    <div className="h-[350px] w-full">
      <ChartContainer config={dynamicChartConfig} className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--accent) / 0.1)' }}/>
            <Legend 
              content={<ChartLegendContent payload={legendPayload} />} 
              verticalAlign="bottom" 
              align="center"
              wrapperStyle={{ paddingTop: '20px' }}
            />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={100} // Adjust as needed
              innerRadius={40} // Creates a donut chart effect, set to 0 for full pie
              dataKey="value" // This is the percentage
              nameKey="name" // This is the status name
              stroke="hsl(var(--background))" // Border color for slices
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}

    