
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { cn } from "@/lib/utils";

interface RadialProgressCardProps {
  title: string;
  percentageValue: number;
  color: 'green' | 'yellow' | 'red';
  plannedValue: string;
  realizedValue: string;
  unit?: string;
}

const COLOR_MAP = {
  green: 'hsl(var(--accent))', // Accent green from theme (e.g., #6DCC33)
  yellow: 'hsl(45, 100%, 50%)', // Bright yellow (e.g., #FFC107)
  red: 'hsl(var(--destructive))', // Destructive red from theme
  gray: 'hsl(var(--muted))', // Muted color for the unfilled part
};

export function RadialProgressCard({ title, percentageValue, color, plannedValue, realizedValue, unit }: RadialProgressCardProps) {
  const filledValue = Math.min(Math.max(0, percentageValue), 150); // Clamp between 0 and 150 for the gauge display
  const data = [
    { name: 'value', value: filledValue, fill: COLOR_MAP[color] },
    { name: 'remaining', value: Math.max(0, 150 - filledValue), fill: COLOR_MAP.gray },
  ];

  return (
    <Card className="shadow-lg flex flex-col items-center text-center">
      <CardHeader className="pb-1 pt-4 w-full">
        <CardTitle className="text-base font-semibold text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center p-3 pt-0">
        <div className="relative w-48 h-[96px]"> {/* Approx 2:1 aspect ratio for semi-circle */}
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="100%" 
                startAngle={180}
                endAngle={0}
                innerRadius="65%" // Relative to outerRadius or chart dimension
                outerRadius="95%" // Relative to outerRadius or chart dimension
                paddingAngle={0}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center top-[-15px]"> {/* Adjusted top for better centering */}
            <span className={cn(
              "text-3xl font-bold",
              color === 'green' ? 'text-accent' :
              color === 'yellow' ? 'text-yellow-500' : // Direct color as we don't have a theme var for this specific yellow
              color === 'red' ? 'text-destructive' : 'text-foreground'
            )}>
              {percentageValue.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </span>
            <span className="text-sm text-muted-foreground">%</span>
          </div>
          <span className="absolute bottom-[-5px] left-[10px] text-xs text-muted-foreground">0</span>
          <span className="absolute bottom-[-5px] right-[10px] text-xs text-muted-foreground">150</span>
        </div>
        <div className="text-center mt-1 text-xs text-muted-foreground">
          <p>Planejado: {plannedValue}{unit || ''}</p>
          <p>Realizado: {realizedValue}{unit || ''}</p>
        </div>
      </CardContent>
    </Card>
  );
}
