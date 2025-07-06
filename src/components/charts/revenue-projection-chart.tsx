"use client";

import { Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, LabelList } from "recharts";
import type { RevenueProjection } from "@/lib/firebase/financialService";

interface RevenueProjectionChartProps {
  projection: RevenueProjection;
}

const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export function RevenueProjectionChart({ projection }: RevenueProjectionChartProps) {
  const chartData = [
    {
      period: "Semanal\n(Atual)",
      value: projection.currentWeekly,
      color: "hsl(142.1 76.2% 36.3%)",
      type: "current"
    },
    {
      period: "Mensal\n(Projeção)",
      value: projection.projectedMonthly,
      color: "hsl(221.2 83.2% 53.3%)",
      type: "projection"
    },
    {
      period: "Trimestral\n(Projeção)",
      value: projection.projectedQuarterly,
      color: "hsl(262.1 83.3% 57.8%)",
      type: "projection"
    },
    {
      period: "Anual\n(Projeção)",
      value: projection.projectedYearly,
      color: "hsl(346.8 77.2% 49.8%)",
      type: "projection"
    }
  ];

  const scenarioData = [
    {
      scenario: "Pessimista\n(-10%)",
      value: projection.pessimisticMonthly,
      color: "hsl(0 84.2% 60.2%)"
    },
    {
      scenario: "Realista\n(Atual)",
      value: projection.projectedMonthly,
      color: "hsl(221.2 83.2% 53.3%)"
    },
    {
      scenario: "Otimista\n(+15%)",
      value: projection.optimisticMonthly,
      color: "hsl(142.1 76.2% 36.3%)"
    }
  ];

  const ProjectionLabel = (props: any) => {
    const { x, y, width, value } = props;
    if (value > 0) {
      const textX = x + width / 2;
      return (
        <text x={textX} y={y} dy={-8} fill="#374151" fontSize={10} textAnchor="middle" fontWeight="bold">
          {formatCurrency(value)}
        </text>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Projeções por Período */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Projeções por Período</h4>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} margin={{ top: 30, right: 20, left: 20, bottom: 20 }}>
            <XAxis 
              dataKey="period" 
              stroke="#888888" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatCurrency}
            />
            <Tooltip
              cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }}
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                border: '1px solid #ccc', 
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: number) => [formatCurrency(value), 'Receita']}
              labelFormatter={(label) => label.replace('\n', ' ')}
            />
            <Bar
              dataKey="value"
              radius={[4, 4, 0, 0]}
              fill="hsl(221.2 83.2% 53.3%)"
            >
              <LabelList content={<ProjectionLabel />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cenários Mensais */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Cenários Mensais</h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={scenarioData} margin={{ top: 30, right: 20, left: 20, bottom: 20 }}>
            <XAxis 
              dataKey="scenario" 
              stroke="#888888" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatCurrency}
            />
            <Tooltip
              cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }}
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                border: '1px solid #ccc', 
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: number) => [formatCurrency(value), 'Receita Mensal']}
              labelFormatter={(label) => label.replace('\n', ' ')}
            />
            <Bar
              dataKey="value"
              radius={[4, 4, 0, 0]}
              fill="hsl(221.2 83.2% 53.3%)"
            >
              <LabelList content={<ProjectionLabel />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}