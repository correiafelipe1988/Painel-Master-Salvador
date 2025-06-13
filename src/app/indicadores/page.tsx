
"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/shared/page-header";
import { RadialProgressCard } from "@/components/indicadores/radial-progress-card";
import { TrendingUp, Bike } from "lucide-react";
import type { Motorcycle } from '@/lib/types';
import { subscribeToMotorcycles } from '@/lib/firebase/motorcycleService';
import { subDays, format, eachDayOfInterval, parseISO, isValid } from 'date-fns';

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
      
      const mediaLocacoesDiarias = totalLocacoesNoPeriodo / dateInterval.length;

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
        percentageValue: 0,
        color: "red" as 'red',
        plannedValue: `Meta: ${META_LOCACOES_DIARIAS}/dia`,
        realizedValue: "Calculando...",
        unit: " locações/dia",
      };
    }

    const { mediaLocacoesDiarias } = dailyLocacoesData;
    let percentageValue = (mediaLocacoesDiarias / (META_LOCACOES_DIARIAS * 1.5)) * 150; // Mapeia para a escala de 0-150 do card
    percentageValue = Math.min(Math.max(0, percentageValue), 150); // Clampa o valor

    let color: 'green' | 'yellow' | 'red' = 'red';
    if (mediaLocacoesDiarias >= META_LOCACOES_DIARIAS * 0.9) { // >= 90% da meta
      color = 'green';
    } else if (mediaLocacoesDiarias >= META_LOCACOES_DIARIAS * 0.6) { // >= 60% da meta
      color = 'yellow';
    }

    return {
      title: "Volume Médio de Locações Diárias",
      percentageValue: parseFloat(percentageValue.toFixed(1)),
      color,
      plannedValue: `Meta: ${META_LOCACOES_DIARIAS}/dia`,
      realizedValue: `${mediaLocacoesDiarias.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`,
      unit: " locações/dia",
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
            percentageValue={cardProps.percentageValue}
            color={cardProps.color}
            plannedValue={cardProps.plannedValue}
            realizedValue={cardProps.realizedValue}
            unit={cardProps.unit}
          />
        ) : (
           <div className="col-span-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg min-h-[200px] bg-muted/50">
            <TrendingUp className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Não foi possível carregar os dados para o indicador.
            </p>
          </div>
        )}
        {/* Aqui você pode adicionar mais RadialProgressCard para outros indicadores */}
      </div>
    </DashboardLayout>
  );
}
