"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { BarChart3, PieChart as PieChartIcon, TrendingUp, AlertCircle, Wrench, DollarSign, Users } from "lucide-react";
import { ManutencaoData } from "@/lib/types";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { SearchFilter } from "./search-filter";
import { MaintenanceVolumeRevenueMonthlyChart } from "./maintenance-volume-revenue-monthly-chart";
import { MaintenanceVolumeRevenueDailyChart } from "./maintenance-volume-revenue-daily-chart";
import { MaintenanceClientRankList } from "./maintenance-client-rank-list";
import { MaintenancePlateRankList } from "./maintenance-plate-rank-list";

interface ManutencaoGraficosTabProps {
  data?: ManutencaoData[];
  hideKpis?: boolean;
}

export function ManutencaoGraficosTab({ data = [], hideKpis = false }: ManutencaoGraficosTabProps) {
  const [dataFiltradaPorBusca, setDataFiltradaPorBusca] = useState(data);

  // Usar dados filtrados diretamente
  const dataFiltrada = dataFiltradaPorBusca;

  const [chartData, setChartData] = useState({
    fabricanteData: [] as { name: string; value: number; color: string }[],
    modeloData: [] as { name: string; value: number }[],
    valorMensal: [] as { month: string; valor: number }[],
    semanaData: [] as { name: string; value: number }[],
  });

  useEffect(() => {
    setDataFiltradaPorBusca(data);
  }, [data]);

  useEffect(() => {
    if (data.length === 0) {
      setChartData({
        fabricanteData: [],
        modeloData: [],
        valorMensal: [],
        semanaData: [],
      });
      return;
    }

    // Dados por fabricante (extraído do campo veiculo)
    const fabricanteCount: Record<string, number> = {};
    data.forEach(item => {
      if (item.veiculo) {
        // Extrair fabricante do campo veiculo (ex: "DAFRA - NH190" -> "DAFRA")
        const fabricante = item.veiculo.split(' - ')[0] || item.veiculo;
        fabricanteCount[fabricante] = (fabricanteCount[fabricante] || 0) + 1;
      }
    });

    const fabricanteData = Object.entries(fabricanteCount).map(([fabricante, count]) => ({
      name: fabricante,
      value: count,
      color: getFabricanteColor(fabricante),
    }));

    // Dados por modelo (campo veiculo completo)
    const modeloCount: Record<string, number> = {};
    data.forEach(item => {
      if (item.veiculo) {
        modeloCount[item.veiculo] = (modeloCount[item.veiculo] || 0) + 1;
      }
    });

    const modeloData = Object.entries(modeloCount).map(([modelo, count]) => ({
      name: modelo,
      value: count,
    }));

    // Dados de valor por mês (usando faturamento_pecas)
    const valorMensal: Record<string, number> = {};
    data.forEach(item => {
      if (item.data) {
        const month = new Date(item.data).toLocaleDateString('pt-BR', { 
          year: 'numeric', 
          month: 'short' 
        });
        valorMensal[month] = (valorMensal[month] || 0) + item.faturamento_pecas;
      }
    });

    const valorMensalData = Object.entries(valorMensal).map(([month, valor]) => ({
      month,
      valor,
    }));

    // Dados por semana (removido pois não existe mais)
    const semanaData: { name: string; value: number }[] = [];

    setChartData({
      fabricanteData,
      modeloData,
      valorMensal: valorMensalData,
      semanaData,
    });
  }, [data]);

  const getFabricanteColor = (fabricante: string) => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
    const index = fabricante.length % colors.length;
    return colors[index];
  };

  const totalFaturamento = dataFiltrada.reduce((sum, item) => sum + item.faturamento_pecas, 0);
  const totalLiquido = dataFiltrada.reduce((sum, item) => sum + item.liquido, 0);
  const avgFaturamento = dataFiltrada.length > 0 ? totalFaturamento / dataFiltrada.length : 0;
  const totalClientes = new Set(dataFiltrada.map(item => item.nome_cliente)).size;

  if (data.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum dado disponível</h3>
              <p className="text-muted-foreground">
                Importe dados na aba "Dados" para visualizar os gráficos
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Novo padrão de KPIs
  const kpis = [
    {
      title: 'Total de Manutenções',
      value: dataFiltrada.length.toString(),
      icon: Wrench,
      iconBgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      color: 'text-purple-600',
      description: '',
    },
    {
      title: 'Faturamento Total',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalFaturamento),
      icon: DollarSign,
      iconBgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      color: 'text-green-600',
      description: '',
    },
    {
      title: 'Líquido Total',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalLiquido),
      icon: BarChart3,
      iconBgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      color: 'text-blue-600',
      description: '',
    },
    {
      title: 'Clientes Únicos',
      value: totalClientes.toString(),
      icon: Users,
      iconBgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
      color: 'text-orange-600',
      description: '',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Filtro de Busca */}
      <SearchFilter
        data={data}
        onFilteredDataChange={setDataFiltradaPorBusca}
      />
      {/* KPIs no novo padrão visual */}
      {!hideKpis && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <KpiCard key={kpi.title} {...kpi} />
          ))}
        </div>
      )}
      {/* Layout reorganizado: rankings no topo, gráficos embaixo */}
      <div className="space-y-6">
        {/* Linha superior: Rankings de clientes e placas lado a lado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="flex-grow">
            <MaintenanceClientRankList data={dataFiltrada} />
          </div>
          <div className="flex-grow">
            <MaintenancePlateRankList data={dataFiltrada} />
          </div>
        </div>
        
        {/* Gráfico diário - largura total */}
        <div className="w-full">
          <MaintenanceVolumeRevenueDailyChart data={dataFiltrada} />
        </div>
        
        {/* Gráfico mensal - largura total */}
        <div className="w-full">
          <MaintenanceVolumeRevenueMonthlyChart data={dataFiltrada} />
        </div>
      </div>
    </div>
  );
}