"use client";

import React from "react";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Legend,
  Line,
} from "recharts";
import { DistratoData } from "@/lib/firebase/distratoService";
import { CAUSA_GROUP_RULES, DEFAULT_GROUP } from "@/data/causas-map";
// Dialog removido temporariamente para evitar erro de parsing do bundler

interface GroupedCausesChartProps {
  data: DistratoData[];
}

// Normalizador leve: remove acentos, baixa caixa e comprime espaços
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function mapCausaToGroup(raw: string): string {
  const normalized = normalize(raw);
  for (const rule of CAUSA_GROUP_RULES) {
    for (const kw of rule.keywords) {
      if (normalized.includes(normalize(kw))) {
        return rule.group;
      }
    }
  }
  return DEFAULT_GROUP;
}

export const GroupedCausesChart: React.FC<GroupedCausesChartProps> = ({ data }) => {
  // Drill-down via modal desabilitado temporariamente

  // Processar dados agrupando causas e gerando breakdown por grupo
  const { groupedData, breakdownMap } = React.useMemo(() => {
    const groups: Record<string, number> = {};
    const breakdown: Record<string, Record<string, { count: number; display: string }>> = {};

    const unknowns: Record<string, number> = {};
    data.forEach((distrato) => {
      const causaRaw = (distrato.causa || 'sem informações').trim();
      const group = mapCausaToGroup(causaRaw);
      groups[group] = (groups[group] || 0) + 1;

      const key = normalize(causaRaw);
      if (!breakdown[group]) breakdown[group] = {};
      if (!breakdown[group][key]) breakdown[group][key] = { count: 0, display: causaRaw };
      breakdown[group][key].count += 1;

      if (group === DEFAULT_GROUP) {
        unknowns[key] = (unknowns[key] || 0) + 1;
      }
    });

    if (Object.keys(unknowns).length > 0) {
      // eslint-disable-next-line no-console
      console.debug('Causas não mapeadas (agrupadas):', unknowns);
    }

    const sorted = Object.entries(groups)
      .map(([group, count]) => ({ group, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const total = data.length || 1;
    let running = 0;
    const result = sorted.map(({ group, count }) => {
      running += count;
      const acumulado = Math.round(((running / total) * 100) * 10) / 10; // 1 casa
      return {
        group,
        count,
        percentage: ((count / total) * 100).toFixed(1),
        acumulado,
      };
    });

    return { groupedData: result, breakdownMap: breakdown };
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const group = data?.payload?.group as string;
      const breakdown = breakdownMap[group] || {};
      const items = Object.values(breakdown)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold text-gray-800">{`${label}`}</p>
          <p style={{ color: '#28A745' }}>{`Casos: ${data.value}`}</p>
          <p className="text-gray-600">{`Percentual: ${data.payload.percentage}%`}</p>
          {items.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-1">Principais causas no grupo:</p>
              <ul className="text-xs text-gray-700 space-y-0.5">
                {items.map((it, idx) => (
                  <li key={idx} className="flex justify-between gap-3">
                    <span className="truncate max-w-[220px]" title={it.display}>{it.display}</span>
                    <span className="font-semibold">{it.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <>
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart
        data={groupedData}
        margin={{ top: 30, right: 30, left: 20, bottom: 80 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis 
          dataKey="group" 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#666' }}
          angle={-45}
          textAnchor="end"
          height={100}
        />
        <YAxis 
          yAxisId="left"
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
          wrapperStyle={{ paddingTop: 20 }}
        />
        
        <Bar 
          yAxisId="left"
          dataKey="count" 
          fill="#28A745"
          name="FREQUÊNCIA"
          radius={[4, 4, 0, 0]}
        >
          <LabelList 
            dataKey="count" 
            position="top" 
            style={{ fill: '#1f2937', fontSize: '12px', fontWeight: 'bold' }}
          />
        </Bar>

        <Line
          yAxisId="right"
          type="monotone"
          dataKey="acumulado"
          stroke="#3366FF"
          strokeWidth={3}
          name="ACUMULADO"
          dot={{ fill: '#3366FF', r: 4 }}
          connectNulls={false}
        >
          <LabelList
            dataKey="acumulado"
            position="top"
            style={{ fill: '#3366FF', fontSize: '12px', fontWeight: 'bold' }}
            formatter={(value: number) => `${value}%`}
          />
        </Line>
      </ComposedChart>
    </ResponsiveContainer>
    </>
  );
};