"use client";

import { useEffect, useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, FileSpreadsheet, TrendingUp, TrendingDown, Award, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { Motorcycle } from "@/lib/types";
import { subscribeToMotorcycles } from '@/lib/firebase/motorcycleService';
import { 
  calculateGoalAnalysis,
  calculateFranchiseeRevenue,
  calculateFinancialKPIs
} from '@/lib/firebase/financialService';
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, Legend } from "recharts";

// Metas configuráveis
const GOALS = {
  occupationRate: 91, // Meta de 91% de ocupação
  monthlyRevenueTarget: 50000, // Meta de receita mensal em R$
  averageTicketTarget: 400, // Meta de ticket médio por moto
  franchiseeCountTarget: 50, // Meta de número de franqueados ativos
};

const COLORS = {
  success: 'hsl(142.1 76.2% 36.3%)',
  warning: 'hsl(47.9 95.8% 53.1%)',
  danger: 'hsl(0 84.2% 60.2%)',
  info: 'hsl(221.2 83.2% 53.3%)',
};

export default function MetasPerformancePage() {
  const [allMotorcycles, setAllMotorcycles] = useState<Motorcycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToMotorcycles((motosFromDB) => {
      if (Array.isArray(motosFromDB)) {
        setAllMotorcycles(motosFromDB);
      } else {
        console.warn("Data from subscribeToMotorcycles (metas performance) was not an array:", motosFromDB);
        setAllMotorcycles([]);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const performanceData = useMemo(() => {
    if (isLoading || !Array.isArray(allMotorcycles)) {
      return {
        goalAnalysis: {
          totalFranchisees: 0,
          franchiseesAboveGoal: 0,
          franchiseesBelowGoal: 0,
          averageOccupation: 0,
          goalAchievementRate: 0,
          topPerformers: [],
          needsImprovement: []
        },
        franchiseeRevenues: [],
        kpis: {
          totalWeeklyRevenue: 0,
          totalMonthlyRevenue: 0,
          averageRevenuePerFranchisee: 0,
          totalRentedMotorcycles: 0,
          financialOccupationRate: 0,
          revenueGrowth: 0,
          averageTicketPerMoto: 0
        },
        goalProgress: {
          occupationRate: 0,
          monthlyRevenue: 0,
          averageTicket: 0,
          franchiseeCount: 0
        },
        performanceDistribution: []
      };
    }

    const goalAnalysis = calculateGoalAnalysis(allMotorcycles);
    const franchiseeRevenues = calculateFranchiseeRevenue(allMotorcycles);
    const kpis = calculateFinancialKPIs(allMotorcycles);

    // Calcular progresso das metas
    const goalProgress = {
      occupationRate: Math.min((kpis.financialOccupationRate / GOALS.occupationRate) * 100, 100),
      monthlyRevenue: Math.min((kpis.totalMonthlyRevenue / GOALS.monthlyRevenueTarget) * 100, 100),
      averageTicket: Math.min((kpis.averageTicketPerMoto / GOALS.averageTicketTarget) * 100, 100),
      franchiseeCount: Math.min((franchiseeRevenues.length / GOALS.franchiseeCountTarget) * 100, 100)
    };

    // Distribuição de performance
    const excellentPerformers = franchiseeRevenues.filter(f => f.occupationRate >= 95).length;
    const goodPerformers = franchiseeRevenues.filter(f => f.occupationRate >= 91 && f.occupationRate < 95).length;
    const averagePerformers = franchiseeRevenues.filter(f => f.occupationRate >= 80 && f.occupationRate < 91).length;
    const poorPerformers = franchiseeRevenues.filter(f => f.occupationRate < 80).length;

    const performanceDistribution = [
      { name: 'Excelente (≥95%)', value: excellentPerformers, color: COLORS.success },
      { name: 'Bom (91-94%)', value: goodPerformers, color: COLORS.info },
      { name: 'Médio (80-90%)', value: averagePerformers, color: COLORS.warning },
      { name: 'Baixo (<80%)', value: poorPerformers, color: COLORS.danger }
    ].filter(item => item.value > 0);

    return {
      goalAnalysis,
      franchiseeRevenues,
      kpis,
      goalProgress,
      performanceDistribution
    };
  }, [allMotorcycles, isLoading]);

  const handleExportExcel = () => {
    toast({ 
      title: "Funcionalidade em Desenvolvimento",
      description: "A exportação de dados de metas e performance será implementada em breve."
    });
  };

  const formatCurrency = (value: number) => 
    `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  const getPerformanceStatus = (rate: number) => {
    if (rate >= 95) return { label: "Excelente", color: "bg-green-100 text-green-700", icon: Award };
    if (rate >= 91) return { label: "Bom", color: "bg-blue-100 text-blue-700", icon: CheckCircle2 };
    if (rate >= 80) return { label: "Médio", color: "bg-yellow-100 text-yellow-700", icon: TrendingUp };
    return { label: "Baixo", color: "bg-red-100 text-red-700", icon: AlertTriangle };
  };

  const getGoalStatus = (progress: number) => {
    if (progress >= 100) return { color: COLORS.success, status: "Atingida" };
    if (progress >= 80) return { color: COLORS.warning, status: "Próxima" };
    return { color: COLORS.danger, status: "Distante" };
  };

  const pageActions = (
    <Button onClick={handleExportExcel} variant="default" className="bg-green-600 hover:bg-green-700 text-white">
      <FileSpreadsheet className="mr-2 h-4 w-4" /> 
      Exportar
    </Button>
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageHeader 
          title="Metas e Performance" 
          description="Acompanhamento de metas e análise de performance" 
          actions={pageActions} 
        />
        <div className="flex justify-center items-center h-96">
          <p>Carregando dados de performance...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Metas e Performance"
        description="Acompanhamento de metas e análise de performance"
        icon={Target}
        iconContainerClassName="bg-orange-600"
        actions={pageActions}
      />

      {/* Cards de Progresso das Metas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Ocupação</CardTitle>
            <CardDescription className="text-xs">Meta: {GOALS.occupationRate}%</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">{formatPercentage(performanceData.kpis.financialOccupationRate)}</span>
                <Badge className={cn("text-xs", getGoalStatus(performanceData.goalProgress.occupationRate).color === COLORS.success ? "bg-green-100 text-green-700" : getGoalStatus(performanceData.goalProgress.occupationRate).color === COLORS.warning ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700")}>
                  {getGoalStatus(performanceData.goalProgress.occupationRate).status}
                </Badge>
              </div>
              <Progress value={performanceData.goalProgress.occupationRate} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {formatPercentage(performanceData.goalProgress.occupationRate)} da meta
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <CardDescription className="text-xs">Meta: {formatCurrency(GOALS.monthlyRevenueTarget)}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">{formatCurrency(performanceData.kpis.totalMonthlyRevenue)}</span>
                <Badge className={cn("text-xs", getGoalStatus(performanceData.goalProgress.monthlyRevenue).color === COLORS.success ? "bg-green-100 text-green-700" : getGoalStatus(performanceData.goalProgress.monthlyRevenue).color === COLORS.warning ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700")}>
                  {getGoalStatus(performanceData.goalProgress.monthlyRevenue).status}
                </Badge>
              </div>
              <Progress value={performanceData.goalProgress.monthlyRevenue} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {formatPercentage(performanceData.goalProgress.monthlyRevenue)} da meta
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <CardDescription className="text-xs">Meta: {formatCurrency(GOALS.averageTicketTarget)}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">{formatCurrency(performanceData.kpis.averageTicketPerMoto)}</span>
                <Badge className={cn("text-xs", getGoalStatus(performanceData.goalProgress.averageTicket).color === COLORS.success ? "bg-green-100 text-green-700" : getGoalStatus(performanceData.goalProgress.averageTicket).color === COLORS.warning ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700")}>
                  {getGoalStatus(performanceData.goalProgress.averageTicket).status}
                </Badge>
              </div>
              <Progress value={performanceData.goalProgress.averageTicket} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {formatPercentage(performanceData.goalProgress.averageTicket)} da meta
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Franqueados Ativos</CardTitle>
            <CardDescription className="text-xs">Meta: {GOALS.franchiseeCountTarget}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">{performanceData.franchiseeRevenues.length}</span>
                <Badge className={cn("text-xs", getGoalStatus(performanceData.goalProgress.franchiseeCount).color === COLORS.success ? "bg-green-100 text-green-700" : getGoalStatus(performanceData.goalProgress.franchiseeCount).color === COLORS.warning ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700")}>
                  {getGoalStatus(performanceData.goalProgress.franchiseeCount).status}
                </Badge>
              </div>
              <Progress value={performanceData.goalProgress.franchiseeCount} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {formatPercentage(performanceData.goalProgress.franchiseeCount)} da meta
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e Análises */}
      <div className="grid gap-6 md:grid-cols-2 mt-8">
        {/* Distribuição de Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-600" />
              Distribuição de Performance
            </CardTitle>
            <CardDescription>Classificação dos franqueados por taxa de ocupação</CardDescription>
          </CardHeader>
          <CardContent>
            {performanceData.performanceDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={performanceData.performanceDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {performanceData.performanceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Franqueados']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-[250px]">
                <p className="text-muted-foreground">Nenhum dado disponível</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top e Bottom Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-green-600" />
              Top & Bottom Performers
            </CardTitle>
            <CardDescription>Melhores e piores performances</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-green-600 mb-2">🏆 Top 3 Performers</h4>
                {performanceData.goalAnalysis.topPerformers.slice(0, 3).map((performer, index) => (
                  <div key={performer.franqueadoName} className="flex justify-between items-center py-1">
                    <span className="text-sm">{index + 1}. {performer.franqueadoName}</span>
                    <Badge className="bg-green-100 text-green-700">
                      {formatPercentage(performer.occupationRate)}
                    </Badge>
                  </div>
                ))}
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-red-600 mb-2">⚠️ Precisam Melhorar</h4>
                {performanceData.goalAnalysis.needsImprovement.slice(0, 3).map((performer, index) => (
                  <div key={performer.franqueadoName} className="flex justify-between items-center py-1">
                    <span className="text-sm">{performer.franqueadoName}</span>
                    <Badge className="bg-red-100 text-red-700">
                      {formatPercentage(performer.occupationRate)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela Detalhada de Performance */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            Performance Detalhada por Franqueado
          </CardTitle>
          <CardDescription>
            Análise completa de performance vs. metas estabelecidas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {performanceData.franchiseeRevenues.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-muted-foreground">Nenhum dado de performance disponível.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Franqueado</TableHead>
                    <TableHead className="text-right">Receita Semanal</TableHead>
                    <TableHead className="text-right">Qtd Motos</TableHead>
                    <TableHead className="text-right">Taxa Ocupação</TableHead>
                    <TableHead className="text-right">Ticket Médio</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {performanceData.franchiseeRevenues.map((item) => {
                    const status = getPerformanceStatus(item.occupationRate);
                    const StatusIcon = status.icon;
                    return (
                      <TableRow key={item.franqueadoName} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{item.franqueadoName}</TableCell>
                        <TableCell className="text-right font-bold text-green-600">
                          {formatCurrency(item.weeklyRevenue)}
                        </TableCell>
                        <TableCell className="text-right">{item.motorcycleCount}</TableCell>
                        <TableCell className="text-right">
                          <Badge className={cn("font-medium", status.color)}>
                            {formatPercentage(item.occupationRate)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.averageRevenuePerMoto)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <StatusIcon className="h-4 w-4" />
                            <span className="text-xs">{status.label}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}