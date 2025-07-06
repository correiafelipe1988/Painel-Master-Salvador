
"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/shared/page-header";
import { RadialProgressCard } from "@/components/indicadores/radial-progress-card";
import { TrendingUp, Bike } from "lucide-react";
import type { Motorcycle } from '@/lib/types';
import { subscribeToMotorcycles } from '@/lib/firebase/motorcycleService';
import { subDays, format, eachDayOfInterval } from 'date-fns';

interface DailyLocacoesData {
  mediaLocacoesDiarias: number;
  totalLocacoesNoPeriodo: number;
}

const META_LOCACOES_DIARIAS = 10;

export default function IndicadoresPage() {
  const [dailyLocacoesData, setDailyLocacoesData] = useState<DailyLocacoesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToMotorcycles((motosFromDB) => {
      if (!Array.isArray(motosFromDB)) {
        console.warn("Data from subscribeToMotorcycles (indicadores page) was not an array:", motosFromDB);
        setDailyLocacoesData(null);
        setIsLoading(false);
        return;
      }

      const endDate = new Date();
      const startDate = subDays(endDate, 29); // Últimos 30 dias, incluindo hoje
      const dateInterval = eachDayOfInterval({ start: startDate, end: endDate });

      let totalLocacoesNoPeriodo = 0;

      dateInterval.forEach(date => {
        const formattedDate = format(date, 'yyyy-MM-dd');
        const locacoesNoDia = motosFromDB.filter(moto => {
          if (!moto.data_ultima_mov || !moto.status) return false;
          // Verifica se a última movimentação foi neste dia E se o status é 'alugada' ou 'relocada'
          // Isso conta motos que se tornaram alugadas/relocadas naquele dia.
          return moto.data_ultima_mov === formattedDate && (moto.status === 'alugada' || moto.status === 'relocada');
        }).length;
        totalLocacoesNoPeriodo += locacoesNoDia;
      });
      
      const mediaLocacoesDiarias = dateInterval.length > 0 ? totalLocacoesNoPeriodo / dateInterval.length : 0;

      setDailyLocacoesData({
        mediaLocacoesDiarias: parseFloat(mediaLocacoesDiarias.toFixed(2)),
        totalLocacoesNoPeriodo,
      });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getProgressCardProps = () => {
    if (!dailyLocacoesData) {
      return {
        title: "Volume Médio de Locações Diárias",
        percentageValue: 0, // O valor real para o cálculo do display no card
        color: "red" as 'red',
        plannedValue: `Meta: ${META_LOCACOES_DIARIAS}/dia`,
        realizedValue: "Calculando...", // Este é o valor numérico que aparece abaixo do %
        unit: " locações/dia",
        displayValueForCenter: 0, // O valor que aparece no centro do medidor
      };
    }

    const { mediaLocacoesDiarias } = dailyLocacoesData;
    // O percentageValue para o card é o próprio valor da média, pois o card espera o valor real
    // e internamente o escalona para seu display de 0-150 se necessário (ou usamos diretamente).
    // Para o nosso card atual (estilo arco simples), o 'percentageValue' é usado para preencher o arco.
    // A lógica de cor é baseada na média em relação à meta.
    // Vamos usar a média diretamente como "realizedValue" e mapeá-la para o display visual do arco.

    let color: 'green' | 'yellow' | 'red' = 'red';
    if (mediaLocacoesDiarias >= META_LOCACOES_DIARIAS * 0.9) { // >= 90% da meta
      color = 'green';
    } else if (mediaLocacoesDiarias >= META_LOCACOES_DIARIAS * 0.6) { // >= 60% da meta
      color = 'yellow';
    }
    
    // O RadialProgressCard espera um percentageValue que ele usará para o display.
    // No nosso caso, o 'percentageValue' do card será o próprio `mediaLocacoesDiarias` e ele o exibirá.
    // O componente RadialProgressCard foi ajustado para mostrar o `percentageValue` diretamente.
    // A escala interna do componente de 0-150% do arco total será preenchida por este valor.
    // Ex: Se percentageValue for 8 e a escala visual do card for de 0 a 15 (META * 1.5),
    // então o arco preencheria 8/15 do total.
    // O card atual já faz o mapeamento do `percentageValue` para o arco.
    // O texto no centro do card será `mediaLocacoesDiarias` formatado.


    return {
      title: "Volume Médio de Locações Diárias",
      percentageValue: mediaLocacoesDiarias, // O valor que o card usará para o arco e o texto central
      color,
      plannedValue: `Meta: ${META_LOCACOES_DIARIAS}/dia`,
      realizedValue: `${mediaLocacoesDiarias.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`,
      unit: " locações/dia",
      // displayValueForCenter: mediaLocacoesDiarias, // Não é mais necessário, percentageValue é usado no centro
    };
  };

  const cardProps = getProgressCardProps();

  return (
    <DashboardLayout>
      <PageHeader
        title="Indicadores Chave de Performance"
        description="Acompanhe as principais métricas e KPIs do sistema."
        icon={TrendingUp}
        iconContainerClassName="bg-primary"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 pb-6">
        {isLoading ? (
          <div className="col-span-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg min-h-[200px] bg-muted/50">
            <Bike className="h-16 w-16 text-muted-foreground mb-4 animate-pulse" />
            <p className="text-muted-foreground text-center">
              Carregando indicador de volume médio de locações...
            </p>
          </div>
        ) : dailyLocacoesData !== null ? (
          <RadialProgressCard
            key={cardProps.title}
            title={cardProps.title}
            percentageValue={cardProps.percentageValue} // Este é o valor que o card exibirá no centro
            color={cardProps.color}
            plannedValue={cardProps.plannedValue}
            realizedValue={cardProps.realizedValue} // Este é o "Realizado: X locações/dia"
            unit={cardProps.unit}
          />
        ) : (
           <div className="col-span-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg min-h-[200px] bg-muted/50">
            <TrendingUp className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Não foi possível carregar os dados para o indicador de volume médio de locações.
              <br />
              Verifique se há motocicletas com movimentações recentes.
            </p>
          </div>
        )}
        {/* Aqui você pode adicionar mais RadialProgressCard para outros indicadores */}
      </div>
    </DashboardLayout>
  );
}
