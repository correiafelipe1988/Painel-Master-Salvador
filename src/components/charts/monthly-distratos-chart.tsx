"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { DistratoData } from "@/lib/firebase/distratoService";

interface MonthlyDistratosChartProps {
  data: DistratoData[];
}

export const MonthlyDistratosChart: React.FC<MonthlyDistratosChartProps> = ({ data }) => {
  // Nomes dos meses
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  
  // Inicializar contadores para todos os meses
  const monthlyCount = Array(12).fill(0);
  
  // Contar distratos por mês baseado no fim_ctt
  data.forEach(distrato => {
    try {
      if (distrato.fim_ctt && distrato.fim_ctt.includes('/')) {
        const [dia, mes, ano] = distrato.fim_ctt.split('/');
        const monthIndex = parseInt(mes) - 1; // Converter para índice (0-11)
        
        if (monthIndex >= 0 && monthIndex < 12) {
          monthlyCount[monthIndex]++;
        }
      }
    } catch (e) {
      // Ignorar datas inválidas
      console.warn('Data inválida:', distrato.fim_ctt);
    }
  });

  // Preparar dados para o gráfico
  const chartData = monthNames.map((month, index) => ({
    month,
    count: monthlyCount[index],
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold text-gray-800">{`${label}`}</p>
          <p className="text-blue-600">{`Distratos: ${data.value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis 
          dataKey="month" 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#666' }}
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#666' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar 
          dataKey="count" 
          fill="#3b82f6"
          radius={[4, 4, 0, 0]}
        >
          <LabelList 
            dataKey="count" 
            position="top" 
            style={{ fill: '#1f2937', fontSize: '12px', fontWeight: 'bold' }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};