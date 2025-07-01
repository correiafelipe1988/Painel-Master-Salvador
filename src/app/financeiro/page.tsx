"use client";

import { useEffect, useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, FileSpreadsheet, TrendingUp, Users, Target, Calculator } from "lucide-react";
import type { Motorcycle } from "@/lib/types";
import { subscribeToMotorcycles } from '@/lib/firebase/motorcycleService';
import {
  calculateFinancialKPIs,
  calculateFranchiseeRevenue,
  calculateMonthlyRevenueAnalysis,
  calculateRevenueProjection,
  calculateGoalAnalysis,
  getTopPerformingFranchisees,
  calculateMonthlyRevenueForDRE
} from '@/lib/firebase/financialService';
import { FinancialKpiCards } from "@/components/financeiro/financial-kpi-cards";
import { DRETable } from "@/components/financeiro/dre-table";
import { MonthlyRevenueChart } from "@/components/charts/monthly-revenue-chart";
import { RevenueProjectionChart } from "@/components/charts/revenue-projection-chart";
import { useToast } from "@/hooks/use-toast";

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

const years = Array.from({ length: 3 }, (_, i) => ({
  value: (currentYear - i).toString(),
  label: (currentYear - i).toString(),
}));

const months = [
  { value: "all", label: "Todos os Meses" },
  { value: "1", label: "Janeiro" },
  { value: "2", label: "Fevereiro" },
  { value: "3", label: "Março" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Maio" },
  { value: "6", label: "Junho" },
  { value: "7", label: "Julho" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];

export default function FinanceiroPage() {
  const [allMotorcycles, setAllMotorcycles] = useState<Motorcycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToMotorcycles((motosFromDB) => {
      if (Array.isArray(motosFromDB)) {
        setAllMotorcycles(motosFromDB);
      } else {
        console.warn("Data from subscribeToMotorcycles (financeiro page) was not an array:", motosFromDB);
        setAllMotorcycles([]);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Filtrar motos por mês se selecionado
  const filteredMotorcycles = useMemo(() => {
    if (isLoading || !Array.isArray(allMotorcycles)) {
      return [];
    }

    let filtered = allMotorcycles;
    if (selectedMonth !== "all") {
      const targetMonth = parseInt(selectedMonth);
      const targetYear = parseInt(selectedYear);
      
      // Para filtro por mês, consideramos todas as motos que estavam ativas no período
      // Não apenas as que tiveram movimentação no mês específico
      filtered = allMotorcycles.filter(moto => {
        // Se não tem data de movimentação, incluir se está alugada/relocada
        if (!moto.data_ultima_mov) {
          return moto.status === 'alugada' || moto.status === 'relocada';
        }
        
        try {
          const motoDate = new Date(moto.data_ultima_mov);
          const motoYear = motoDate.getFullYear();
          const motoMonth = motoDate.getMonth() + 1;
          
          // Incluir motos que:
          // 1. Tiveram movimentação no mês/ano específico, OU
          // 2. Tiveram movimentação antes do mês/ano e estão alugadas/relocadas
          if (motoYear === targetYear && motoMonth === targetMonth) {
            return true; // Movimentação no período específico
          } else if (motoYear < targetYear || (motoYear === targetYear && motoMonth < targetMonth)) {
            // Movimentação anterior ao período - incluir se está alugada/relocada
            return moto.status === 'alugada' || moto.status === 'relocada';
          }
          
          return false; // Movimentação posterior ao período
        } catch {
          return false;
        }
      });
    }

    return filtered;
  }, [allMotorcycles, selectedYear, selectedMonth, isLoading]);

  const financialData = useMemo(() => {
    if (isLoading || !Array.isArray(allMotorcycles)) {
      return {
        kpis: {
          totalWeeklyRevenue: 0,
          totalMonthlyRevenue: 0,
          averageRevenuePerFranchisee: 0,
          totalRentedMotorcycles: 0,
          financialOccupationRate: 0,
          revenueGrowth: 0,
          averageTicketPerMoto: 0
        },
        franchiseeRevenues: [],
        monthlyAnalysis: [],
        projection: {
          currentWeekly: 0,
          projectedMonthly: 0,
          projectedQuarterly: 0,
          projectedYearly: 0,
          optimisticMonthly: 0,
          pessimisticMonthly: 0
        },
        goalAnalysis: {
          totalFranchisees: 0,
          franchiseesAboveGoal: 0,
          franchiseesBelowGoal: 0,
          averageOccupation: 0,
          goalAchievementRate: 0,
          topPerformers: [],
          needsImprovement: []
        },
        topPerformers: []
      };
    }

    // Passar parâmetros de ano/mês para cálculo proporcional
    const targetYear = parseInt(selectedYear);
    const targetMonth = selectedMonth !== "all" ? parseInt(selectedMonth) : undefined;
    
    const kpis = calculateFinancialKPIs(filteredMotorcycles, undefined, targetYear, targetMonth);
    const franchiseeRevenues = calculateFranchiseeRevenue(filteredMotorcycles, targetYear, targetMonth);
    const monthlyAnalysis = calculateMonthlyRevenueAnalysis(filteredMotorcycles, targetYear);
    const projection = calculateRevenueProjection(filteredMotorcycles, targetYear, targetMonth);
    const goalAnalysis = calculateGoalAnalysis(filteredMotorcycles, targetYear, targetMonth);
    const topPerformers = getTopPerformingFranchisees(filteredMotorcycles, 5, targetYear, targetMonth);

    return {
      kpis,
      franchiseeRevenues,
      monthlyAnalysis,
      projection,
      goalAnalysis,
      topPerformers
    };
  }, [filteredMotorcycles, selectedYear, selectedMonth, isLoading]);

  const handleExportExcel = () => {
    toast({
      title: "Funcionalidade em Desenvolvimento",
      description: "A exportação de dados financeiros será implementada em breve."
    });
  };


  const pageActions = (
    <div className="flex items-center gap-2">
      <Select value={selectedYear} onValueChange={setSelectedYear}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Ano" />
        </SelectTrigger>
        <SelectContent>
          {years.map(year => (
            <SelectItem key={year.value} value={year.value}>
              {year.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={selectedMonth} onValueChange={setSelectedMonth}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Mês" />
        </SelectTrigger>
        <SelectContent>
          {months.map(month => (
            <SelectItem key={month.value} value={month.value}>
              {month.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={handleExportExcel} variant="default" className="bg-green-600 hover:bg-green-700 text-white">
        <FileSpreadsheet className="mr-2 h-4 w-4" />
        Exportar
      </Button>
    </div>
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageHeader 
          title="Dashboard Financeiro" 
          description="Análise completa da receita e performance financeira" 
          actions={pageActions} 
        />
        <div className="flex justify-center items-center h-96">
          <p>Carregando dados financeiros...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Dashboard Financeiro"
        description={selectedMonth === "all" ?
          `Análise completa da receita e performance financeira - ${selectedYear}` :
          `Análise financeira - ${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}`
        }
        icon={DollarSign}
        iconContainerClassName="bg-green-600"
        actions={pageActions}
      />

      {/* KPIs Financeiros */}
      <div className="mt-6">
        <FinancialKpiCards kpis={financialData.kpis} isLoading={isLoading} />
      </div>

      {/* Tabs com diferentes visões */}
      <div className="mt-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="dre">DRE</TabsTrigger>
            <TabsTrigger value="temporal">Análise Temporal</TabsTrigger>
            <TabsTrigger value="projections">Projeções</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Todos os Franqueados */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <CardTitle className="text-lg">Todos os Franqueados</CardTitle>
                      <CardDescription>Receita semanal e projeção mensal</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {financialData.franchiseeRevenues.length > 0 ? (
                    <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                      {financialData.franchiseeRevenues.map((franchisee, index) => {
                        // Se um mês específico está selecionado, calcular usando a mesma lógica do DRE
                        let displayMonthlyRevenue;
                        const isSpecificMonth = selectedMonth !== "all";
                        
                        if (isSpecificMonth) {
                          // Usar a mesma função do DRE para garantir consistência
                          displayMonthlyRevenue = calculateMonthlyRevenueForDRE(
                            allMotorcycles,
                            parseInt(selectedYear),
                            parseInt(selectedMonth),
                            franchisee.franqueadoName
                          );
                        } else {
                          // Para "Todos os Meses", usar projeção baseada na receita semanal atual
                          displayMonthlyRevenue = franchisee.weeklyRevenue * 4.33;
                        }
                        
                        return (
                          <div key={franchisee.franqueadoName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-700 rounded-full font-bold text-sm">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{franchisee.franqueadoName}</p>
                                <p className="text-xs text-gray-500">{franchisee.motorcycleCount} motos • {franchisee.occupationRate.toFixed(1)}% ocupação</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600 text-sm">
                                R$ {franchisee.weeklyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </p>
                              <p className="text-xs text-blue-600">
                                {isSpecificMonth ? 'Real' : 'Proj.'} Mensal: R$ {displayMonthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">Nenhum dado disponível</p>
                  )}
                </CardContent>
              </Card>

              {/* Análise de Metas */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <div>
                      <CardTitle className="text-lg">Análise de Metas</CardTitle>
                      <CardDescription>Performance vs. meta de 91% ocupação</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Taxa de Sucesso</span>
                      <span className="font-bold text-lg text-blue-600">
                        {financialData.goalAnalysis.goalAchievementRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Acima da Meta</span>
                      <span className="font-medium text-green-600">
                        {financialData.goalAnalysis.franchiseesAboveGoal} franqueados
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Abaixo da Meta</span>
                      <span className="font-medium text-red-600">
                        {financialData.goalAnalysis.franchiseesBelowGoal} franqueados
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Ocupação Média</span>
                      <span className="font-medium">
                        {financialData.goalAnalysis.averageOccupation.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="dre" className="space-y-6">
            <DRETable motorcycles={allMotorcycles} selectedYear={selectedYear} />
          </TabsContent>

          <TabsContent value="temporal" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                  <div>
                    <CardTitle className="font-headline">Evolução da Receita ({selectedYear})</CardTitle>
                    <CardDescription>Análise mensal da receita, quantidade de motos e ticket médio</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <MonthlyRevenueChart data={financialData.monthlyAnalysis} year={parseInt(selectedYear)} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projections" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calculator className="h-6 w-6 text-purple-600" />
                  <div>
                    <CardTitle className="font-headline">Projeções de Receita</CardTitle>
                    <CardDescription>Estimativas baseadas na receita semanal atual</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <RevenueProjectionChart projection={financialData.projection} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}