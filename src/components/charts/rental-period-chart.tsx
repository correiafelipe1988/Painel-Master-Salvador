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
  ResponsiveContainer,
  Legend,
  LabelList,
} from "recharts";
import { DistratoData } from "@/lib/firebase/distratoService";

interface RentalPeriodChartProps {
  data: DistratoData[];
}

export const RentalPeriodChart: React.FC<RentalPeriodChartProps> = ({ data }) => {
  // Nomes dos meses
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  
  // Inicializar contadores para todos os meses
  const monthlyData = Array(12).fill(null).map((_, index) => ({
    month: monthNames[index],
    curtaDuracao: 0, // <= 30 dias
    longaDuracao: 0, // > 30 dias
    total: 0
  }));
  
  // Função para calcular diferença em dias
  const calcularDiasLocacao = (inicioStr: string, fimStr: string): number | null => {
    try {
      if (!inicioStr || !fimStr || !inicioStr.includes('/') || !fimStr.includes('/')) {
        return null;
      }
      
      const [diaInicio, mesInicio, anoInicio] = inicioStr.split('/');
      const [diaFim, mesFim, anoFim] = fimStr.split('/');
      
      const dataInicio = new Date(parseInt(anoInicio), parseInt(mesInicio) - 1, parseInt(diaInicio));
      const dataFim = new Date(parseInt(anoFim), parseInt(mesFim) - 1, parseInt(diaFim));
      
      if (isNaN(dataInicio.getTime()) || isNaN(dataFim.getTime()) || dataFim < dataInicio) {
        return null;
      }
      
      const diffTime = dataFim.getTime() - dataInicio.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays;
    } catch (e) {
      return null;
    }
  };
  
  // Processar distratos
  data.forEach(distrato => {
    try {
      if (distrato.fim_ctt && distrato.fim_ctt.includes('/')) {
        const [, mes] = distrato.fim_ctt.split('/');
        const monthIndex = parseInt(mes) - 1; // Converter para índice (0-11)
        
        if (monthIndex >= 0 && monthIndex < 12) {
          const diasLocacao = calcularDiasLocacao(distrato.inicio_ctt, distrato.fim_ctt);
          
          if (diasLocacao !== null) {
            if (diasLocacao <= 30) {
              monthlyData[monthIndex].curtaDuracao++;
            } else {
              monthlyData[monthIndex].longaDuracao++;
            }
            monthlyData[monthIndex].total++;
          } else {
            // Se não conseguir calcular período, conta como longa duração (padrão conservador)
            monthlyData[monthIndex].longaDuracao++;
            monthlyData[monthIndex].total++;
          }
        }
      }
    } catch (e) {
      console.warn('Erro ao processar distrato:', distrato, e);
    }
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const curtaDuracao = payload.find((p: any) => p.dataKey === 'curtaDuracao')?.value || 0;
      const longaDuracao = payload.find((p: any) => p.dataKey === 'longaDuracao')?.value || 0;
      const total = payload.find((p: any) => p.dataKey === 'total')?.value || 0;
      
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold text-gray-800">{`${label}`}</p>
          <p style={{ color: '#28A745' }}>{`Curta Duração: ${curtaDuracao}`}</p>
          <p style={{ color: '#007BFF' }}>{`Longa Duração: ${longaDuracao}`}</p>
          <div className="border-t pt-1 mt-1">
            <p className="font-semibold" style={{ color: '#3366FF' }}>{`Total: ${total}`}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Componente para rótulos personalizados nas barras
  const renderCustomLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    if (value === 0) return null;

    return (
      <text
        x={x + width / 2}
        y={y + height / 2}
        fill="white"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="12"
        fontWeight="bold"
      >
        {value}
      </text>
    );
  };

  // Componente personalizado para os dots da linha
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!payload || payload.total === 0) return null;
    
    return (
      <g>
        <circle cx={cx} cy={cy} r={4} fill="#3366FF" stroke="#ffffff" strokeWidth={2} />
        <text
          x={cx}
          y={cy - 12}
          textAnchor="middle"
          fill="#3366FF"
          fontSize="12"
          fontWeight="600"
        >
          {payload.total}
        </text>
      </g>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart
        data={monthlyData}
        margin={{ top: 30, right: 30, left: 20, bottom: 5 }}
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
        <Legend 
          verticalAlign="top" 
          height={36}
          iconType="rect"
          wrapperStyle={{
            paddingBottom: '20px',
            fontSize: '14px'
          }}
        />
        
        {/* Barra para ≤ 30 dias - Verde (barra superior) */}
        <Bar 
          dataKey="curtaDuracao" 
          stackId="a"
          fill="#28A745"
          name="Curta Duração"
          radius={[0, 0, 0, 0]}
        >
          <LabelList content={renderCustomLabel} />
        </Bar>
        
        {/* Barra para > 30 dias - Azul (barra inferior) */}
        <Bar 
          dataKey="longaDuracao" 
          stackId="a"
          fill="#007BFF"
          name="Longa Duração"
          radius={[4, 4, 0, 0]}
        >
          <LabelList content={renderCustomLabel} />
        </Bar>
        
        {/* Linha do total - Azul da linha e dos pontos */}
        <Line
          type="monotone"
          dataKey="total"
          stroke="#3366FF"
          strokeWidth={3}
          dot={<CustomDot />}
          name="Total"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};