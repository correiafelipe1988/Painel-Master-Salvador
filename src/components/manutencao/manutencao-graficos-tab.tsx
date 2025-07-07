"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { BarChart3, PieChart as PieChartIcon, TrendingUp, AlertCircle } from "lucide-react";
import { ManutencaoData } from "@/lib/types";

interface ManutencaoGraficosTabProps {
  data?: ManutencaoData[];
}

export function ManutencaoGraficosTab({ data = [] }: ManutencaoGraficosTabProps) {
  const [chartData, setChartData] = useState({
    fabricanteData: [] as { name: string; value: number; color: string }[],
    modeloData: [] as { name: string; value: number }[],
    valorMensal: [] as { month: string; valor: number }[],
    semanaData: [] as { name: string; value: number }[],
  });

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

    // Dados por fabricante
    const fabricanteCount: Record<string, number> = {};
    data.forEach(item => {
      if (item.veiculo_fabricante) {
        fabricanteCount[item.veiculo_fabricante] = (fabricanteCount[item.veiculo_fabricante] || 0) + 1;
      }
    });

    const fabricanteData = Object.entries(fabricanteCount).map(([fabricante, count]) => ({
      name: fabricante,
      value: count,
      color: getFabricanteColor(fabricante),
    }));

    // Dados por modelo
    const modeloCount: Record<string, number> = {};
    data.forEach(item => {
      if (item.veiculo_modelo) {
        modeloCount[item.veiculo_modelo] = (modeloCount[item.veiculo_modelo] || 0) + 1;
      }
    });

    const modeloData = Object.entries(modeloCount).map(([modelo, count]) => ({
      name: modelo,
      value: count,
    }));

    // Dados de valor por mês
    const valorMensal: Record<string, number> = {};
    data.forEach(item => {
      if (item.data) {
        const month = new Date(item.data).toLocaleDateString('pt-BR', { 
          year: 'numeric', 
          month: 'short' 
        });
        valorMensal[month] = (valorMensal[month] || 0) + item.valor_total;
      }
    });

    const valorMensalData = Object.entries(valorMensal).map(([month, valor]) => ({
      month,
      valor,
    }));

    // Dados por semana
    const semanaCount: Record<string, number> = {};
    data.forEach(item => {
      if (item.semana) {
        semanaCount[item.semana] = (semanaCount[item.semana] || 0) + 1;
      }
    });

    const semanaData = Object.entries(semanaCount).map(([semana, count]) => ({
      name: semana,
      value: count,
    }));

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

  return (
    <div className="space-y-6">
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fabricante Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Distribuição por Fabricante
            </CardTitle>
            <CardDescription>
              Quantidade de manutenções por fabricante
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.fabricanteData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.fabricanteData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Modelos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Modelos de Veículos
            </CardTitle>
            <CardDescription>
              Quantidade de manutenções por modelo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.modeloData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Valor Mensal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Valor por Mês
            </CardTitle>
            <CardDescription>
              Evolução dos valores de manutenção
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.valorMensal}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Valor']} />
                <Line type="monotone" dataKey="valor" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Semanas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Manutenções por Semana
            </CardTitle>
            <CardDescription>
              Quantidade de manutenções por semana
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.semanaData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}