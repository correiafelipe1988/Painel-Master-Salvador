
import type { Kpi } from "@/lib/types";
import { KpiCard } from "./kpi-card";
import { ArrowRightLeft, CheckCircle2, Bike, ChevronsRight, Wrench } from "lucide-react";

// KPIs para a primeira linha (acima dos filtros)
export const kpiDataTop: Kpi[] = [
  {
    title: "Motos Alugadas Hoje",
    value: "0",
    icon: Bike, // Alterado de ArrowRightLeft para Bike
    description: "unidades",
    color: "text-blue-600", // Cor do valor
    iconBgColor: "bg-blue-500", // Cor de fundo da caixa do ícone
    iconColor: "text-white", // Cor do ícone
  },
  {
    title: "Motos Recuperadas Hoje",
    value: "0",
    icon: CheckCircle2,
    description: "unidades",
    color: "text-green-600",
    iconBgColor: "bg-green-500",
    iconColor: "text-white",
  },
  {
    title: "Motos Relocadas Hoje",
    value: "0",
    icon: ChevronsRight,
    description: "unidades",
    color: "text-gray-700",
    iconBgColor: "bg-gray-200", 
    iconColor: "text-gray-700", 
  },
  {
    title: "Motos Paradas +7 Dias",
    value: "25",
    icon: Bike, 
    description: "unidades",
    color: "text-orange-500",
    iconBgColor: "bg-orange-500",
    iconColor: "text-white",
  },
];

// KPIs para a segunda linha (abaixo dos filtros)
export const kpiDataBottom: Kpi[] = [
  {
    title: "Motos Disponíveis",
    value: "0",
    icon: CheckCircle2,
    description: "tornaram-se disponíveis no período",
    color: "text-green-600",
    iconBgColor: "bg-green-500",
    iconColor: "text-white",
  },
  {
    title: "Motos Alugadas",
    value: "9",
    icon: Bike,
    description: "alugadas no período",
    color: "text-blue-600",
    iconBgColor: "bg-blue-500",
    iconColor: "text-white",
  },
  {
    title: "Em Manutenção",
    value: "0",
    icon: Wrench,
    description: "entraram em manutenção no período",
    color: "text-purple-600",
    iconBgColor: "bg-purple-500",
    iconColor: "text-white",
  },
  {
    title: "Motos Relocadas",
    value: "13",
    icon: ChevronsRight, 
    description: "relocadas no período",
    color: "text-gray-700",
    iconBgColor: "bg-gray-200",
    iconColor: "text-gray-700",
  },
];

export function KpiSection({ kpis }: { kpis: Kpi[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <KpiCard key={kpi.title} {...kpi} />
      ))}
    </div>
  );
}
