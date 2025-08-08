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
    curtaDuracao: 0, // será usado para "Dentro do mês"
    longaDuracao: 0, // será o restante (Total - Dentro do mês)
    total: 0,
    sameMonthCount: 0,
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
        const [, mesFim, anoFim] = distrato.fim_ctt.split('/');
        const monthIndex = parseInt(mesFim) - 1; // Converter para índice (0-11)
        
        if (monthIndex >= 0 && monthIndex < 12) {
          // Total do mês
          monthlyData[monthIndex].total++;

          // Dentro do mesmo mês (início e fim no mesmo mês/ano)
          if (
            distrato.inicio_ctt &&
            distrato.fim_ctt &&
            distrato.inicio_ctt.includes('/') &&
            distrato.fim_ctt.includes('/')
          ) {
            const [, mesIni, anoIni] = distrato.inicio_ctt.split('/');
            if (
              mesIni && anoIni &&
              parseInt(mesIni) === parseInt(mesFim) &&
              parseInt(anoIni) === parseInt(anoFim)
            ) {
              monthlyData[monthIndex].sameMonthCount++;
            }
          }
        }
      }
    } catch (e) {
      console.warn('Erro ao processar distrato:', distrato, e);
    }
  });

  // Ajustar barras: verde = dentro do mês; azul = restante
  monthlyData.forEach((m) => {
    m.curtaDuracao = m.sameMonthCount;
    m.longaDuracao = Math.max(0, m.total - m.sameMonthCount);
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const curtaDuracao = payload.find((p: any) => p.dataKey === 'curtaDuracao')?.value || 0;
      const longaDuracao = payload.find((p: any) => p.dataKey === 'longaDuracao')?.value || 0;
      const total = (curtaDuracao + longaDuracao) || (payload.find((p: any) => p.dataKey === 'total')?.value || 0);
      
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold text-gray-800">{`${label}`}</p>
          <p style={{ color: '#28A745' }}>{`Dentro do mês: ${curtaDuracao}`}</p>
          <p style={{ color: '#007BFF' }}>{`Longa Duração: ${longaDuracao}`}</p>
          <div className="border-t pt-1 mt-1" />
          <p className="font-semibold" style={{ color: '#3366FF' }}>{`Total: ${total}`}</p>
        </div>
      );
    }
    return null;
  };

  // Componente para rótulos personalizados nas barras (usa o value do segmento)
  const renderCustomLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    if (!value) return null;
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

  // (Opcional) Label de topo não necessário, números já aparecem na linha de total

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

  // Dot laranja para "mesmo mês" com rótulo
  const SameMonthDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!payload || !payload.sameMonthCount) return null;
    return (
      <g>
        <circle cx={cx} cy={cy} r={4} fill="#f59e0b" stroke="#ffffff" strokeWidth={2} />
        <text x={cx} y={cy - 10} textAnchor="middle" fill="#f59e0b" fontSize="12" fontWeight="600">
          {payload.sameMonthCount}
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
        {/* Eixo único para volume */}
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
        
        {/* Barra verde = Dentro do mês (início=fim) */}
        <Bar 
          dataKey="curtaDuracao" 
          stackId="a"
          fill="#28A745"
          name="Dentro do mês"
          radius={[0, 0, 0, 0]}
        >
          <LabelList dataKey="curtaDuracao" position="center" style={{ fill: '#ffffff', fontSize: '12px', fontWeight: 'bold' }} />
        </Bar>
        
        {/* Barra para > 30 dias - Azul (barra inferior) */}
        <Bar 
          dataKey="longaDuracao" 
          stackId="a"
          fill="#007BFF"
          name="Longa Duração"
          radius={[4, 4, 0, 0]}
        >
          <LabelList dataKey="longaDuracao" position="center" style={{ fill: '#ffffff', fontSize: '12px', fontWeight: 'bold' }} />
        </Bar>

        {/* Linha do total - Azul com rótulo */}
        <Line
          type="monotone"
          dataKey="total"
          stroke="#3366FF"
          strokeWidth={3}
          dot={<CustomDot />}
          name="Total"
        />

        {/* Removida a linha de percentual; agora mostramos apenas o volume dentro da barra */}
      </ComposedChart>
    </ResponsiveContainer>
  );
};