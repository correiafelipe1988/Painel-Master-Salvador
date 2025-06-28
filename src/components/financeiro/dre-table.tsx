"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, TrendingUp, TrendingDown } from "lucide-react";
import type { Motorcycle } from "@/lib/types";
import { calculateFranchiseeRevenue } from "@/lib/firebase/financialService";

interface DRETableProps {
  motorcycles: Motorcycle[];
  selectedYear: string;
}

interface MonthlyDREData {
  month: string;
  monthNumber: number;
  receita: number;
  custos: number;
  despesas: number;
  impostos: number;
  lucroLiquido: number;
  margemLiquida: number;
}

const months = [
  { value: 1, label: "Janeiro", short: "Jan" },
  { value: 2, label: "Fevereiro", short: "Fev" },
  { value: 3, label: "Março", short: "Mar" },
  { value: 4, label: "Abril", short: "Abr" },
  { value: 5, label: "Maio", short: "Mai" },
  { value: 6, label: "Junho", short: "Jun" },
  { value: 7, label: "Julho", short: "Jul" },
  { value: 8, label: "Agosto", short: "Ago" },
  { value: 9, label: "Setembro", short: "Set" },
  { value: 10, label: "Outubro", short: "Out" },
  { value: 11, label: "Novembro", short: "Nov" },
  { value: 12, label: "Dezembro", short: "Dez" },
];

const formatCurrency = (value: number) => 
  `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

export function DRETable({ motorcycles, selectedYear }: DRETableProps) {
  const [selectedFranchisee, setSelectedFranchisee] = useState<string>("all");

  // Obter lista de franqueados únicos
  const franchisees = useMemo(() => {
    const uniqueFranchisees = Array.from(
      new Set(
        motorcycles
          .filter(moto => moto.franqueado && moto.franqueado.trim() !== '')
          .map(moto => moto.franqueado!.trim())
      )
    ).sort();

    return [
      { value: "all", label: "Todos os Franqueados" },
      ...uniqueFranchisees.map(name => ({ value: name, label: name }))
    ];
  }, [motorcycles]);

  // Calcular dados do DRE por mês
  const dreData = useMemo(() => {
    const year = parseInt(selectedYear);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    // Determinar até qual mês mostrar (apenas meses realizados)
    const maxMonth = year === currentYear ? currentMonth : 12;
    
    const monthlyData: MonthlyDREData[] = [];

    for (let month = 1; month <= maxMonth; month++) {
      // Filtrar motos por mês
      const monthMotorcycles = motorcycles.filter(moto => {
        if (!moto.data_ultima_mov) {
          return moto.status === 'alugada' || moto.status === 'relocada';
        }
        
        try {
          const motoDate = new Date(moto.data_ultima_mov);
          const motoYear = motoDate.getFullYear();
          const motoMonth = motoDate.getMonth() + 1;
          
          if (motoYear === year && motoMonth === month) {
            return true;
          } else if (motoYear < year || (motoYear === year && motoMonth < month)) {
            return moto.status === 'alugada' || moto.status === 'relocada';
          }
          
          return false;
        } catch {
          return false;
        }
      });

      // Filtrar por franqueado se selecionado
      let filteredMotorcycles = monthMotorcycles;
      if (selectedFranchisee !== "all") {
        filteredMotorcycles = monthMotorcycles.filter(
          moto => moto.franqueado?.trim() === selectedFranchisee
        );
      }

      // Calcular receita do mês
      const franchiseeRevenues = calculateFranchiseeRevenue(filteredMotorcycles, year, month);
      const receita = franchiseeRevenues.reduce((sum, fr) => sum + fr.weeklyRevenue, 0) * 4.33; // Converter para mensal

      // Por enquanto, custos/despesas/impostos são 0 (serão definidos posteriormente)
      const custos = 0;
      const despesas = 0;
      const impostos = 0;
      const lucroLiquido = receita - custos - despesas - impostos;
      const margemLiquida = receita > 0 ? (lucroLiquido / receita) * 100 : 0;

      monthlyData.push({
        month: months[month - 1].short,
        monthNumber: month,
        receita,
        custos,
        despesas,
        impostos,
        lucroLiquido,
        margemLiquida
      });
    }

    return monthlyData;
  }, [motorcycles, selectedYear, selectedFranchisee]);

  // Calcular totais do ano
  const yearTotals = useMemo(() => {
    return dreData.reduce((totals, month) => ({
      receita: totals.receita + month.receita,
      custos: totals.custos + month.custos,
      despesas: totals.despesas + month.despesas,
      impostos: totals.impostos + month.impostos,
      lucroLiquido: totals.lucroLiquido + month.lucroLiquido,
    }), {
      receita: 0,
      custos: 0,
      despesas: 0,
      impostos: 0,
      lucroLiquido: 0,
    });
  }, [dreData]);

  const yearMargemLiquida = yearTotals.receita > 0 ? (yearTotals.lucroLiquido / yearTotals.receita) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            <div>
              <CardTitle className="font-headline">DRE - Demonstrativo de Resultado do Exercício</CardTitle>
              <CardDescription>
                Análise mensal de receitas, custos e resultado líquido - {selectedYear}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedFranchisee} onValueChange={setSelectedFranchisee}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Selecionar franqueado" />
              </SelectTrigger>
              <SelectContent>
                {franchisees.map(franchisee => (
                  <SelectItem key={franchisee.value} value={franchisee.value}>
                    {franchisee.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Conta</TableHead>
                {dreData.map(month => (
                  <TableHead key={month.monthNumber} className="text-center font-semibold min-w-[100px]">
                    {month.month}
                  </TableHead>
                ))}
                <TableHead className="text-center font-semibold bg-gray-50 min-w-[120px]">
                  Total {selectedYear}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Receita Bruta */}
              <TableRow className="bg-green-50">
                <TableCell className="font-semibold text-green-700">
                  Receita Bruta
                </TableCell>
                {dreData.map(month => (
                  <TableCell key={month.monthNumber} className="text-center text-green-700 font-medium">
                    {formatCurrency(month.receita)}
                  </TableCell>
                ))}
                <TableCell className="text-center font-bold text-green-700 bg-green-100">
                  {formatCurrency(yearTotals.receita)}
                </TableCell>
              </TableRow>

              {/* Custos */}
              <TableRow>
                <TableCell className="font-semibold text-red-600">
                  (-) Custos Diretos
                </TableCell>
                {dreData.map(month => (
                  <TableCell key={month.monthNumber} className="text-center text-red-600">
                    {formatCurrency(month.custos)}
                  </TableCell>
                ))}
                <TableCell className="text-center font-bold text-red-600 bg-gray-50">
                  {formatCurrency(yearTotals.custos)}
                </TableCell>
              </TableRow>

              {/* Despesas */}
              <TableRow>
                <TableCell className="font-semibold text-red-600">
                  (-) Despesas Operacionais
                </TableCell>
                {dreData.map(month => (
                  <TableCell key={month.monthNumber} className="text-center text-red-600">
                    {formatCurrency(month.despesas)}
                  </TableCell>
                ))}
                <TableCell className="text-center font-bold text-red-600 bg-gray-50">
                  {formatCurrency(yearTotals.despesas)}
                </TableCell>
              </TableRow>

              {/* Impostos */}
              <TableRow>
                <TableCell className="font-semibold text-red-600">
                  (-) Impostos e Taxas
                </TableCell>
                {dreData.map(month => (
                  <TableCell key={month.monthNumber} className="text-center text-red-600">
                    {formatCurrency(month.impostos)}
                  </TableCell>
                ))}
                <TableCell className="text-center font-bold text-red-600 bg-gray-50">
                  {formatCurrency(yearTotals.impostos)}
                </TableCell>
              </TableRow>

              {/* Linha divisória */}
              <TableRow>
                <TableCell colSpan={dreData.length + 2} className="border-t-2 border-gray-300 p-0"></TableCell>
              </TableRow>

              {/* Lucro Líquido */}
              <TableRow className="bg-blue-50">
                <TableCell className="font-bold text-blue-700">
                  Lucro Líquido
                </TableCell>
                {dreData.map(month => (
                  <TableCell key={month.monthNumber} className="text-center font-bold text-blue-700">
                    {formatCurrency(month.lucroLiquido)}
                  </TableCell>
                ))}
                <TableCell className="text-center font-bold text-blue-700 bg-blue-100">
                  {formatCurrency(yearTotals.lucroLiquido)}
                </TableCell>
              </TableRow>

              {/* Margem Líquida */}
              <TableRow className="bg-purple-50">
                <TableCell className="font-bold text-purple-700">
                  Margem Líquida (%)
                </TableCell>
                {dreData.map(month => (
                  <TableCell key={month.monthNumber} className="text-center font-bold text-purple-700">
                    <div className="flex items-center justify-center gap-1">
                      {month.margemLiquida >= 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      )}
                      {formatPercentage(month.margemLiquida)}
                    </div>
                  </TableCell>
                ))}
                <TableCell className="text-center font-bold text-purple-700 bg-purple-100">
                  <div className="flex items-center justify-center gap-1">
                    {yearMargemLiquida >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    {formatPercentage(yearMargemLiquida)}
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Resumo */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-600 font-medium">Receita Total</div>
            <div className="text-lg font-bold text-green-700">{formatCurrency(yearTotals.receita)}</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-sm text-red-600 font-medium">Custos + Despesas</div>
            <div className="text-lg font-bold text-red-700">
              {formatCurrency(yearTotals.custos + yearTotals.despesas + yearTotals.impostos)}
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">Lucro Líquido</div>
            <div className="text-lg font-bold text-blue-700">{formatCurrency(yearTotals.lucroLiquido)}</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-sm text-purple-600 font-medium">Margem Líquida</div>
            <div className="text-lg font-bold text-purple-700 flex items-center gap-1">
              {yearMargemLiquida >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              {formatPercentage(yearMargemLiquida)}
            </div>
          </div>
        </div>

        {/* Nota informativa */}
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Badge variant="outline" className="text-yellow-700 border-yellow-300">
              Nota
            </Badge>
            <p className="text-sm text-yellow-700">
              Atualmente, apenas as receitas estão sendo calculadas. Os custos, despesas e impostos serão configurados posteriormente conforme as regras específicas do negócio.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}