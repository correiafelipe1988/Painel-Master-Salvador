
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { cn } from "@/lib/utils";

interface RadialProgressCardProps {
  title: string;
  percentageValue: number; // This is the value (0-150) that dictates the fill and the central text
  color: 'green' | 'yellow' | 'red';
  plannedValue: string;
  realizedValue: string;
  unit?: string;
}

const COLOR_MAP = {
  green: 'hsl(var(--accent))', 
  yellow: 'hsl(45, 100%, 50%)', 
  red: 'hsl(var(--destructive))', 
  gray: 'hsl(var(--muted))', 
};

export function RadialProgressCard({ title, percentageValue, color, plannedValue, realizedValue, unit }: RadialProgressCardProps) {
  // Ensure percentageValue is for the display range 0-150
  const displayPercentage = Math.min(Math.max(0, percentageValue), 150);
  
  const data = [
    { name: 'value', value: displayPercentage, fill: COLOR_MAP[color] },
    { name: 'remaining', value: Math.max(0, 150 - displayPercentage), fill: COLOR_MAP.gray },
  ];

  return (
    <Card className="shadow-lg flex flex-col items-center text-center">
      <CardHeader className="pb-1 pt-4 w-full">
        <CardTitle className="text-base font-semibold text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center p-3 pt-0">
        <div className="relative w-48 h-[96px]"> {/* Semi-circle aspect ratio */}
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="100%" 
                startAngle={180}
                endAngle={0}
                innerRadius="65%" 
                outerRadius="95%" 
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
          <div className="absolute inset-0 flex flex-col items-center justify-center top-[-15px]">
            <span className={cn(
              "text-3xl font-bold",
              color === 'green' ? 'text-accent' :
              color === 'yellow' ? 'text-yellow-500' :
              color === 'red' ? 'text-destructive' : 'text-foreground'
            )}>
              {/* The text displayed is the actual percentageValue, not the 0-150 scaled one */}
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
