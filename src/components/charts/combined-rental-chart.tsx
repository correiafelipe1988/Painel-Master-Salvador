
"use client";

import { Bar, Line, ComposedChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, LabelList, ReferenceLine } from "recharts";
import { useMemo } from "react";
import { Rectangle, RectangleProps } from "recharts";

interface ChartDataPoint {
  month: string;
  alugadas: number;
  relocadas: number;
  total: number;
  projecaoAlugadas?: number;
  projecaoRelocadas?: number;
  projecaoTotal?: number;
}

interface CombinedRentalChartProps {
  data: ChartDataPoint[] | null;
}

const formatCount = (value: number) => (value > 0 ? `${value}` : '');

// Custom shape para barras com largura fixa (todas iguais)
const CustomBarShape = (props: RectangleProps & { isCurrent: boolean }) => {
  const { x = 0, y = 0, width = 60, height = 0, ...rest } = props;
  const customWidth = 60;
  const dx = (width - customWidth) / 2;
  return <Rectangle x={x + dx} y={y} width={customWidth} height={height} {...rest} />;
};

// Custom shape para barra de projeção deslocada no mês atual
const CustomProjectionBarShape = (props: any) => {
  const { x = 0, y = 0, width = 60, height = 0, index, ...rest } = props;
  const currentMonthIndex = new Date().getMonth();
  if (index !== currentMonthIndex) return <g />;
  const customWidth = 60;
  const dx = (width - customWidth) / 2 + 65; // desloca ainda mais para a direita
  // Barra de projeção: preenchimento sólido, opacidade 0.4, borda tracejada
  return (
    <Rectangle
      x={x + dx}
      y={y}
      width={customWidth}
      height={height}
      fill="#8884d8"
      opacity={0.15}
      stroke="#8884d8"
      strokeDasharray="4 2"
      {...rest}
    />
  );
};

// Custom label para centralizar o número da barra de projeção
const CustomProjectionLabel = (props: any) => {
  const { x = 0, y = 0, width = 60, value } = props;
  // Centraliza o label sobre a barra deslocada (dx = +65)
  const labelX = x + width / 2 + 65;
  return (
    <text x={labelX} y={y - 8} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#8884d8" opacity={0.7}>
      {value}
    </text>
  );
};

export function CombinedRentalChart({ data }: CombinedRentalChartProps) {
  if (!data || data.every(d => d.total === 0)) {
    return (
      <div className="flex justify-center items-center h-[350px]">
        <p className="text-muted-foreground">Não há dados de locações para exibir.</p>
      </div>
    );
  }

  const currentMonthIndex = new Date().getMonth();

  return (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }} barGap={0} barCategoryGap={"40%"}>
        <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} interval={0} />
        <YAxis 
          stroke="#888888" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
          tickFormatter={(value) => `${value}`}
          allowDecimals={false}
          domain={[0, 200]}
        />
        {/* Linha de meta */}
        <ReferenceLine y={180} stroke="hsl(142.1 76.2% 36.3%)" strokeDasharray="6 4" label={{ value: 'Meta: 180', position: 'top', fill: 'hsl(142.1 76.2% 36.3%)', fontSize: 13, fontWeight: 'bold' }} />
        <Tooltip
          cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }}
          contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', border: '1px solid #ccc', borderRadius: '5px' }}
        />
        <Legend verticalAlign="top" wrapperStyle={{top: 0}} />

        {/* Barras Novas */}
        <Bar dataKey="alugadas" name="Novas" stackId="a" fill="hsl(221.2 83.2% 53.3%)" radius={[0, 0, 0, 0]}
          shape={(props: any) => <CustomBarShape {...props} isCurrent={props.index === currentMonthIndex} />}
        >
           <LabelList dataKey="alugadas" position="center" style={{ fontSize: '12px', fill: 'white', fontWeight: 'bold' }} formatter={formatCount} />
        </Bar>
        {/* Barras Usadas */}
        <Bar dataKey="relocadas" name="Usadas" stackId="a" fill="hsl(142.1 76.2% 36.3%)" radius={[4, 4, 0, 0]}
          shape={(props: any) => <CustomBarShape {...props} isCurrent={props.index === currentMonthIndex} />}
        >
           <LabelList dataKey="relocadas" position="center" style={{ fontSize: '12px', fill: 'white', fontWeight: 'bold' }} formatter={formatCount} />
           <LabelList 
             dataKey="total" 
             position="top" 
             style={{ fontSize: '12px', fill: 'hsl(221.2 83.2% 53.3%)', fontWeight: 'bold' }} 
             formatter={formatCount} 
            />
        </Bar>
        {/* Barra de Projeção do mês atual sobreposta/deslocada ao mês real */}
        <Bar
          dataKey="projecaoTotal"
          name="Projeção"
          fill="#8884d8"
          opacity={0.4}
          strokeDasharray="4 2"
          isAnimationActive={false}
          stackId="b"
          shape={CustomProjectionBarShape}
        >
          <LabelList dataKey="projecaoTotal" content={CustomProjectionLabel} formatter={formatCount} />
        </Bar>
        <Line 
            type="monotone" 
            dataKey="total" 
            name="Total" 
            stroke="hsl(221.2 83.2% 53.3%)" 
            strokeWidth={2} 
            dot={{ r: 4 }} 
            activeDot={{ r: 6 }}
            label={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
