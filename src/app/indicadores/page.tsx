
"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/shared/page-header";
import { RadialProgressCard } from "@/components/indicadores/radial-progress-card";
import { TrendingUp } from "lucide-react";

const indicatorsData = [
  { title: "Ticket Médio", percentageValue: 112.8, color: "green", plannedValue: "19,50", realizedValue: "22,00" },
  { title: "Margem de Contribuição", percentageValue: 71.1, color: "yellow", plannedValue: "7.132,00", realizedValue: "5.074,00" },
  { title: "Ponto de Equilíbrio", percentageValue: 14.7, color: "red", plannedValue: "5.902,78", realizedValue: "10.936,62" },
  { title: "EBITDA", percentageValue: 144.2, color: "green", plannedValue: "2.132,00", realizedValue: "3.074,00" },
  { title: "Lucratividade", percentageValue: 113.6, color: "green", plannedValue: "13,67", realizedValue: "15,53", unit: "%" },
];

export default function IndicadoresPage() {
  return (
    <DashboardLayout>
      <PageHeader
        title="Indicadores Chave de Performance"
        description="Acompanhe as principais métricas e KPIs do sistema."
        icon={TrendingUp}
        iconContainerClassName="bg-primary"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 pb-6">
        {indicatorsData.map(indicator => (
          <RadialProgressCard
            key={indicator.title}
            title={indicator.title}
            percentageValue={indicator.percentageValue}
            color={indicator.color as 'green' | 'yellow' | 'red'}
            plannedValue={indicator.plannedValue}
            realizedValue={indicator.realizedValue}
            unit={indicator.unit}
          />
        ))}
      </div>
    </DashboardLayout>
  );
}
