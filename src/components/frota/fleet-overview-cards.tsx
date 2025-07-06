"use client";

import { KpiCard } from "@/components/dashboard/kpi-card";
import { Package, Bike, DollarSign, Users, TrendingUp } from "lucide-react";
import type { Motorcycle } from "@/lib/types";
import { normalizeMotorcycleModel } from "@/lib/utils/modelNormalizer";

interface FleetOverviewCardsProps {
  motorcycles: Motorcycle[];
  isLoading?: boolean;
}

const formatCurrency = (value: number) => 
  `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function FleetOverviewCards({ motorcycles, isLoading = false }: FleetOverviewCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-lg animate-pulse p-4 border-l-4 border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-20 mb-1"></div>
                <div className="h-3 bg-gray-300 rounded w-32"></div>
              </div>
              <div className="h-12 w-12 bg-gray-300 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const totalMotorcycles = motorcycles.length;
  const uniqueModels = new Set(
    motorcycles
      .filter(m => m.model)
      .map(m => normalizeMotorcycleModel(m.model!.trim()))
  ).size;
  const uniqueFranchisees = new Set(motorcycles.filter(m => m.franqueado).map(m => m.franqueado!.trim())).size;
  
  const revenueGeneratingMotorcycles = motorcycles.filter(m => 
    (m.status === 'alugada' || m.status === 'relocada') && m.valorSemanal && m.valorSemanal > 0
  );
  
  const totalWeeklyRevenue = revenueGeneratingMotorcycles.reduce((sum, m) => sum + (m.valorSemanal || 0), 0);
  
  const averageTicket = revenueGeneratingMotorcycles.length > 0 ? 
    totalWeeklyRevenue / revenueGeneratingMotorcycles.length : 0;
  
  const occupationRate = totalMotorcycles > 0 ? 
    (revenueGeneratingMotorcycles.length / totalMotorcycles) * 100 : 0;

  const kpiCards = [
    {
      title: "Total da Frota",
      value: totalMotorcycles.toString(),
      description: "Motocicletas únicas",
      icon: Package,
      color: "text-blue-600",
      iconBgColor: "bg-blue-100",
    },
    {
      title: "Modelos Diferentes",
      value: uniqueModels.toString(),
      description: "Variedade de modelos",
      icon: Bike,
      color: "text-purple-600",
      iconBgColor: "bg-purple-100",
    },
    {
      title: "Franqueados Ativos",
      value: uniqueFranchisees.toString(),
      description: "Com motos na frota",
      icon: Users,
      color: "text-green-600",
      iconBgColor: "bg-green-100",
    },
    {
      title: "Taxa de Ocupação",
      value: `${occupationRate.toFixed(1)}%`,
      description: "Motos gerando receita",
      icon: TrendingUp,
      color: occupationRate >= 85 ? "text-green-600" : 
             occupationRate >= 75 ? "text-yellow-600" : "text-red-600",
      iconBgColor: occupationRate >= 85 ? "bg-green-100" : 
                   occupationRate >= 75 ? "bg-yellow-100" : "bg-red-100",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
      {kpiCards.map((kpi, index) => (
        <KpiCard 
          key={index}
          title={kpi.title}
          value={kpi.value}
          description={kpi.description}
          icon={kpi.icon}
          color={kpi.color}
          iconBgColor={kpi.iconBgColor}
          iconColor={kpi.color}
        />
      ))}
    </div>
  );
}
