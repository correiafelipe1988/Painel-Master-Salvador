"use client";

import React from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";

interface ParetoChartProps {
  data: Array<{ causa: string; count: number }>;
}

export const ParetoChart: React.FC<ParetoChartProps> = ({ data }) => {
  // Calcular dados do Pareto
  const total = data.reduce((sum, item) => sum + item.count, 0);
  let acumulado = 0;

  const paretoData = data.map((item) => {
    const percentual = (item.count / total) * 100;
    acumulado += percentual;
    
    return {
      name: item.causa, // Usar a causa real ao invés de "Causa X"
      causa: item.causa,
      frequencia: item.count,
      acumulado: Math.round(acumulado * 10) / 10, // Arredondar para 1 decimal
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold text-gray-800">{`${label}`}</p>
          <p className="text-sm text-gray-600">{`Causa: ${data.causa}`}</p>
          <p className="text-blue-600">{`Frequência: ${data.frequencia}`}</p>
          <p className="text-red-600">{`Acumulado: ${data.acumulado}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart
        data={paretoData}
        margin={{ top: 20, right: 80, bottom: 20, left: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis 
          dataKey="name" 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#666' }}
        />
        <YAxis 
          yAxisId="left" 
          orientation="left"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#666' }}
        />
        <YAxis 
          yAxisId="right" 
          orientation="right"
          domain={[0, 100]}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#666' }}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          iconType="line"
          wrapperStyle={{ paddingTop: '20px' }}
        />
        <Bar 
          yAxisId="left"
          dataKey="frequencia" 
          fill="#3b82f6"
          name="FREQUÊNCIA"
          radius={[2, 2, 0, 0]}
        >
          <LabelList 
            dataKey="frequencia" 
            position="top" 
            style={{ fill: '#1f2937', fontSize: '12px', fontWeight: 'bold' }}
          />
        </Bar>
        <Line 
          yAxisId="right"
          type="monotone" 
          dataKey="acumulado" 
          stroke="#ef4444"
          strokeWidth={3}
          name="ACUMULADO"
          dot={{ fill: '#ef4444', r: 4 }}
          connectNulls={false}
        >
          <LabelList 
            dataKey="acumulado" 
            position="top" 
            style={{ fill: '#dc2626', fontSize: '12px', fontWeight: 'bold' }}
            formatter={(value: number) => `${value}%`}
          />
        </Line>
      </ComposedChart>
    </ResponsiveContainer>
  );
};