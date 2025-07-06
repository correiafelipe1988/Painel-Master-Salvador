"use client";

import { Bar, Line, ComposedChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, LabelList } from "recharts";

interface ChartDataPoint {
  day: string;
  alugadas: number;
  relocadas: number;
  total: number;
}

interface DailyRentalChartProps {
  data: ChartDataPoint[] | null;
}

const formatCount = (value: number) => (value > 0 ? `${value}` : '');

export function DailyRentalChart({ data }: DailyRentalChartProps) {
  if (!data || data.every(d => d.total === 0)) {
    return (
      <div className="flex justify-center items-center h-[350px]">
        <p className="text-muted-foreground">Não há dados de locações para exibir.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <XAxis 
          dataKey="day" 
          stroke="#888888" 
          fontSize={10} 
          tickLine={false} 
          axisLine={false}
          interval={Math.floor(data.length / 8)} // Show approximately 8 labels
        />
        <YAxis 
          stroke="#888888" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
          tickFormatter={(value) => `${value}`}
          allowDecimals={false}
        />
        <Tooltip
          cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }}
          contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', border: '1px solid #ccc', borderRadius: '5px' }}
          labelFormatter={(label) => `Dia ${label}`}
        />
        <Legend verticalAlign="top" wrapperStyle={{top: 0}} />

        <Bar dataKey="alugadas" name="Novas" stackId="a" fill="hsl(221.2 83.2% 53.3%)" radius={[0, 0, 0, 0]}>
           <LabelList dataKey="alugadas" position="center" style={{ fontSize: '10px', fill: 'white', fontWeight: 'bold' }} formatter={formatCount} />
        </Bar>
        <Bar dataKey="relocadas" name="Usadas" stackId="a" fill="hsl(142.1 76.2% 36.3%)" radius={[4, 4, 0, 0]}>
           <LabelList dataKey="relocadas" position="center" style={{ fontSize: '10px', fill: 'white', fontWeight: 'bold' }} formatter={formatCount} />
           <LabelList 
             dataKey="total" 
             position="top" 
             style={{ fontSize: '10px', fill: 'hsl(221.2 83.2% 53.3%)', fontWeight: 'bold' }} 
             formatter={formatCount} 
            />
        </Bar>
        
        <Line 
            type="monotone" 
            dataKey="total" 
            name="Total" 
            stroke="hsl(221.2 83.2% 53.3%)" 
            strokeWidth={2} 
            dot={{ r: 3 }} 
            activeDot={{ r: 5 }}
            label={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
