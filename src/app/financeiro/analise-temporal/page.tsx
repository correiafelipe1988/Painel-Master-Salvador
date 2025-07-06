"use client";

import { useEffect, useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, FileSpreadsheet, TrendingUp, BarChart3, PieChart } from "lucide-react";
import type { Motorcycle } from "@/lib/types";
import { subscribeToMotorcycles } from '@/lib/firebase/motorcycleService';
import { 
  calculateMonthlyRevenueAnalysis,
  calculateSeasonalAnalysis,
  calculateFinancialKPIs
} from '@/lib/firebase/financialService';
import { MonthlyRevenueChart } from "@/components/charts/monthly-revenue-chart";
import { useToast } from "@/hooks/use-toast";
import { Line, ResponsiveContainer, XAxis, YAxis, Tooltip, LineChart, Bar, BarChart, PieChart as RechartsPieChart, Cell } from "recharts";

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 3 }, (_, i) => ({
  value: (currentYear - i).toString(),
  label: (currentYear - i).toString(),
}));

const COLORS = ['hsl(142.1 76.2% 36.3%)', 'hsl(221.2 83.2% 53.3%)', 'hsl(262.1 83.3% 57.8%)', 'hsl(346.8 77.2% 49.8%)', 'hsl(47.9 95.8% 53.1%)', 'hsl(24.6 95% 53.1%)'];

export default function AnaliseTemporalPage() {
  const [allMotorcycles, setAllMotorcycles] = useState<Motorcycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  const [comparisonYear, setComparisonYear] = useState<string>((currentYear - 1).toString());
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToMotorcycles((motosFromDB) => {
      if (Array.isArray(motosFromDB)) {
        setAllMotorcycles(motosFromDB);
      } else {
        console.warn("Data from subscribeToMotorcycles (analise temporal) was not an array:", motosFromDB);
        setAllMotorcycles([]);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const temporalData = useMemo(() => {
    if (isLoading || !Array.isArray(allMotorcycles)) {
      return {
        currentYearData: [],
        comparisonYearData: [],
        seasonalData: [],
        yearOverYearComparison: [],
        currentYearKPIs: {
          totalWeeklyRevenue: 0,
          totalMonthlyRevenue: 0,
          averageRevenuePerFranchisee: 0,
          totalRentedMotorcycles: 0,
          financialOccupationRate: 0,
          revenueGrowth: 0,
          averageTicketPerMoto: 0
        },
        comparisonYearKPIs: {
          totalWeeklyRevenue: 0,
          totalMonthlyRevenue: 0,
          averageRevenuePerFranchisee: 0,
          totalRentedMotorcycles: 0,
          financialOccupationRate: 0,
          revenueGrowth: 0,
          averageTicketPerMoto: 0
        }
      };
    }

    const currentYearData = calculateMonthlyRevenueAnalysis(allMotorcycles, parseInt(selectedYear));
    const comparisonYearData = calculateMonthlyRevenueAnalysis(allMotorcycles, parseInt(comparisonYear));
    const seasonalData = calculateSeasonalAnalysis(allMotorcycles);

    // Filtrar dados por ano para KPIs
    const currentYearMotorcycles = allMotorcycles.filter(moto => {
      if (!moto.data_ultima_mov) return false;
      try {
        const year = new Date(moto.data_ultima_mov).getFullYear();
        return year === parseInt(selectedYear);
      } catch {
        return false;
      }
    });

    const comparisonYearMotorcycles = allMotorcycles.filter(moto => {
      if (!moto.data_ultima_mov) return false;
      try {
        const year = new Date(moto.data_ultima_mov).getFullYear();
        return year === parseInt(comparisonYear);
      } catch {
        return false;
      }
    });

    const currentYearKPIs = calculateFinancialKPIs(currentYearMotorcycles);
    const comparisonYearKPIs = calculateFinancialKPIs(comparisonYearMotorcycles);

    // Comparação ano a ano
    const yearOverYearComparison = currentYearData.map((current, index) => {
      const comparison = comparisonYearData[index];
      const growth = comparison && comparison.revenue > 0 ? 
        ((current.revenue - comparison.revenue) / comparison.revenue) * 100 : 0;
      
      return {
        month: current.month,
        currentYear: current.revenue,
        comparisonYear: comparison ? comparison.revenue : 0,
        growth: growth,
        currentYearMotos: current.motorcycleCount,
        comparisonYearMotos: comparison ? comparison.motorcycleCount : 0
      };
    });

    return {
      currentYearData,
      comparisonYearData,
      seasonalData,
      yearOverYearComparison,
      currentYearKPIs,
      comparisonYearKPIs
    };
  }, [allMotorcycles, selectedYear, comparisonYear, isLoading]);

  const handleExportExcel = () => {
    toast({ 
      title: "Funcionalidade em Desenvolvimento",
      description: "A exportação de análise temporal será implementada em breve."
    });
  };

  const formatCurrency = (value: number) => 
    `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  const pageActions = (
    <div className="flex items-center gap-2">
      <Select value={selectedYear} onValueChange={setSelectedYear}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Ano Principal" />
        </SelectTrigger>
        <SelectContent>
          {years.map(year => (
            <SelectItem key={year.value} value={year.value}>
              {year.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={comparisonYear} onValueChange={setComparisonYear}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Comparar com" />
        </SelectTrigger>
        <SelectContent>
          {years.map(year => (
            <SelectItem key={year.value} value={year.value}>
              {year.label}
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
          title="Análise Temporal" 
          description="Evolução da receita ao longo do tempo" 
          actions={pageActions} 
        />
        <div className="flex justify-center items-center h-96">
          <p>Carregando análise temporal...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Análise Temporal"
        description="Evolução da receita ao longo do tempo"
        icon={CalendarDays}
        iconContainerClassName="bg-purple-600"
        actions={pageActions}
      />

      {/* KPIs Comparativos */}
      <div className="grid gap-4 md:grid-cols-4 mt-6">
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Receita Total {selectedYear}</p>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(temporalData.currentYearKPIs.totalWeeklyRevenue)}
              </p>
              <p className="text-xs text-gray-500">
                {comparisonYear}: {formatCurrency(temporalData.comparisonYearKPIs.totalWeeklyRevenue)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Motos Ativas {selectedYear}</p>
              <p className="text-lg font-bold text-blue-600">
                {temporalData.currentYearKPIs.totalRentedMotorcycles}
              </p>
              <p className="text-xs text-gray-500">
                {comparisonYear}: {temporalData.comparisonYearKPIs.totalRentedMotorcycles}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Ticket Médio {selectedYear}</p>
              <p className="text-lg font-bold text-purple-600">
                {formatCurrency(temporalData.currentYearKPIs.averageTicketPerMoto)}
              </p>
              <p className="text-xs text-gray-500">
                {comparisonYear}: {formatCurrency(temporalData.comparisonYearKPIs.averageTicketPerMoto)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Ocupação {selectedYear}</p>
              <p className="text-lg font-bold text-orange-600">
                {formatPercentage(temporalData.currentYearKPIs.financialOccupationRate)}
              </p>
              <p className="text-xs text-gray-500">
                {comparisonYear}: {formatPercentage(temporalData.comparisonYearKPIs.financialOccupationRate)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs com diferentes análises */}
      <div className="mt-8">
        <Tabs defaultValue="monthly" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="monthly">Análise Mensal</TabsTrigger>
            <TabsTrigger value="comparison">Comparação Anual</TabsTrigger>
            <TabsTrigger value="seasonal">Sazonalidade</TabsTrigger>
          </TabsList>

          <TabsContent value="monthly" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                  <div>
                    <CardTitle className="font-headline">Evolução Mensal da Receita ({selectedYear})</CardTitle>
                    <CardDescription>Receita semanal, quantidade de motos e ticket médio por mês</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <MonthlyRevenueChart data={temporalData.currentYearData} year={parseInt(selectedYear)} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                  <div>
                    <CardTitle className="font-headline">Comparação {selectedYear} vs {comparisonYear}</CardTitle>
                    <CardDescription>Evolução da receita entre os anos selecionados</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={temporalData.yearOverYearComparison} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatCurrency} />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: '1px solid #ccc', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value: number, name: string) => [formatCurrency(value), name]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="currentYear" 
                      name={selectedYear}
                      stroke="hsl(142.1 76.2% 36.3%)" 
                      strokeWidth={3}
                      dot={{ r: 4 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="comparisonYear" 
                      name={comparisonYear}
                      stroke="hsl(221.2 83.2% 53.3%)" 
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      dot={{ r: 4 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Crescimento Mensal (%)</CardTitle>
                <CardDescription>Variação percentual de {selectedYear} em relação a {comparisonYear}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={temporalData.yearOverYearComparison} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: '1px solid #ccc', 
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`${value.toFixed(1)}%`, 'Crescimento']}
                    />
                    <Bar
                      dataKey="growth"
                      fill="hsl(142.1 76.2% 36.3%)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seasonal" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <PieChart className="h-6 w-6 text-purple-600" />
                  <div>
                    <CardTitle className="font-headline">Análise de Sazonalidade</CardTitle>
                    <CardDescription>Padrões de receita média por mês (todos os anos)</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={temporalData.seasonalData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatCurrency} />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: '1px solid #ccc', 
                        borderRadius: '8px'
                      }}
                      formatter={(value: number, name: string) => {
                        if (name === 'Receita Média') return [formatCurrency(value), name];
                        return [value, name];
                      }}
                    />
                    <Bar dataKey="averageRevenue" name="Receita Média" fill="hsl(262.1 83.3% 57.8%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}