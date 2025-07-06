"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, TrendingDown, Users, Bike, Target, Calculator } from "lucide-react";
import type { FinancialKPI } from "@/lib/firebase/financialService";
import { cn } from "@/lib/utils";

interface FinancialKpiCardsProps {
  kpis: FinancialKPI;
  isLoading?: boolean;
}

const formatCurrency = (value: number) => 
  `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

export function FinancialKpiCards({ kpis, isLoading = false }: FinancialKpiCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-20 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const kpiCards = [
    {
      title: "Receita Semanal Total",
      value: formatCurrency(kpis.totalWeeklyRevenue),
      description: "Soma de todas as motos alugadas",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Receita Mensal Projetada",
      value: formatCurrency(kpis.totalMonthlyRevenue),
      description: "Baseada na receita semanal atual",
      icon: Calculator,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Receita Média por Franqueado",
      value: formatCurrency(kpis.averageRevenuePerFranchisee),
      description: "Distribuição por franqueado",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Motos Gerando Receita",
      value: kpis.totalRentedMotorcycles.toString(),
      description: "Alugadas + Relocadas",
      icon: Bike,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
    {
      title: "Taxa de Ocupação Financeira",
      value: formatPercentage(kpis.financialOccupationRate),
      description: "% de motos gerando receita",
      icon: Target,
      color: kpis.financialOccupationRate >= 85 ? "text-green-600" : 
             kpis.financialOccupationRate >= 75 ? "text-yellow-600" : "text-red-600",
      bgColor: kpis.financialOccupationRate >= 85 ? "bg-green-100" : 
               kpis.financialOccupationRate >= 75 ? "bg-yellow-100" : "bg-red-100",
    },
    {
      title: "Ticket Médio por Moto",
      value: formatCurrency(kpis.averageTicketPerMoto),
      description: "Valor semanal médio",
      icon: Calculator,
      color: "text-teal-600",
      bgColor: "bg-teal-100",
    },
    {
      title: "Receita Líquida por Moto",
      value: formatCurrency(kpis.receitaLiquidaPorMoto),
      description: "Valor real baseado no DRE",
      icon: Calculator,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpiCards.map((kpi, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {kpi.title}
            </CardTitle>
            <div className={cn("p-2 rounded-full", kpi.bgColor)}>
              <kpi.icon className={cn("h-4 w-4", kpi.color)} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className={cn("text-2xl font-bold", kpi.color)}>
                {kpi.value}
              </div>
              {index === 6 ? null : ('badge' in kpi ? kpi.badge as React.ReactNode : null)}
            </div>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              {kpi.description}
            </CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}