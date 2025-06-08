import type { Kpi } from "@/lib/types";
import { KpiCard } from "./kpi-card";
import { TrendingUp, Bike, Users, Wrench, Clock, CheckCircle } from "lucide-react";

const kpiData: Kpi[] = [
  {
    title: "% Méd. Inadimplência (Mês)",
    value: "12.5%",
    icon: TrendingUp,
    description: "+2.1% desde o último mês",
    color: "text-destructive",
  },
  {
    title: "Recuperadas Hoje",
    value: "15",
    icon: Bike,
    description: "Atualizado agora há pouco",
    color: "text-primary",
  },
  {
    title: "Tempo Méd. Relocação",
    value: "3.2 Dias",
    icon: Clock,
    description: "Baseado nas últimas 50 relocações",
  },
  {
    title: "Ociosas >7 Dias",
    value: "8",
    icon: Users, 
    description: "Requer atenção",
    color: "text-accent",
  },
  {
    title: "Disponíveis para Aluguel",
    value: "42",
    icon: CheckCircle,
    color: "text-green-600",
  },
  {
    title: "Em Manutenção",
    value: "5",
    icon: Wrench,
  },
];

export function KpiSection() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 mb-6">
      {kpiData.map((kpi) => (
        <KpiCard key={kpi.title} {...kpi} />
      ))}
    </div>
  );
}
