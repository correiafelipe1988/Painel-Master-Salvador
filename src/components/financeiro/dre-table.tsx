"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, TrendingUp, TrendingDown, Info } from "lucide-react";
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
  receitasNaoOperacionais: {
    caucao: number;
    juros: number;
    cobrancaLocatario: number;
    total: number;
  };
  receitaBruta: number;
  tributosReceitas: {
    simplesNacional: number;
    total: number;
  };
  custosOperacionais: {
    seguroRastreador: number;
    manutencao: number;
    taxaEspaco: number;
    royalties: number;
    ipvaTaxas: number;
    fundoMarketing: number;
    sistemaGestao: number;
    honorariosContabeis: number;
    total: number;
  };
  lucroLiquido: number;
  margemLiquida: number;
  receitaLiquidaPorMoto: number;
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
  const [showRules, setShowRules] = useState<boolean>(false);

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

      // Contar total de motos do franqueado (para taxas fixas)
      const totalMotorcyclesByFranchisee = selectedFranchisee !== "all"
        ? motorcycles.filter(moto => moto.franqueado?.trim() === selectedFranchisee).length
        : motorcycles.length;

      // Contar motos alugadas e relocadas especificamente neste mês (para cálculo de caução)
      const rentedMotorcycles = filteredMotorcycles.filter(moto => {
        if (moto.status !== 'alugada' || !moto.data_ultima_mov) return false;
        
        try {
          const motoDate = new Date(moto.data_ultima_mov);
          const motoYear = motoDate.getFullYear();
          const motoMonth = motoDate.getMonth() + 1;
          
          // Só contar se foi alugada especificamente neste mês
          return motoYear === year && motoMonth === month;
        } catch {
          return false;
        }
      }).length;

      const relocatedMotorcycles = filteredMotorcycles.filter(moto => {
        if (moto.status !== 'relocada' || !moto.data_ultima_mov) return false;
        
        try {
          const motoDate = new Date(moto.data_ultima_mov);
          const motoYear = motoDate.getFullYear();
          const motoMonth = motoDate.getMonth() + 1;
          
          // Só contar se foi relocada especificamente neste mês
          return motoYear === year && motoMonth === month;
        } catch {
          return false;
        }
      }).length;

      // Verificar se há receita no mês (indica que franqueado iniciou operação)
      const hasRevenue = receita > 0;

      // Custos/Despesas Operacionais (só cobrar se há receita)
      // Contar placas únicas para evitar duplicatas
      const uniquePlates = new Set(filteredMotorcycles.map(moto => moto.placa));
      const motorcyclesInMonth = uniquePlates.size; // Quantidade de motos únicas do franqueado no mês específico

      // Receitas Não Operacionais
      const caucao = (rentedMotorcycles * 700) + (relocatedMotorcycles * 400); // R$ 700 por moto alugada + R$ 400 por moto relocada
      const juros = hasRevenue ? Math.floor(motorcyclesInMonth / 10) * 212 : 0; // R$ 212 a cada 10 motos no mês (só se há receita)
      const receitasNaoOperacionais = {
        caucao,
        juros,
        cobrancaLocatario: 0, // Removido conforme solicitação
        total: caucao + juros
      };

      // Tributos sobre Receitas
      const receitaTotal = receita + receitasNaoOperacionais.total;
      const simplesNacional = receitaTotal * 0.07; // 7% sobre receita bruta
      const tributosReceitas = {
        simplesNacional,
        total: simplesNacional
      };
      const seguroRastreador = hasRevenue ? motorcyclesInMonth * 139.90 : 0; // R$ 139,90 por moto no mês (só se há receita)
      const manutencao = 0; // Será puxado de outra base de dados
      const taxaEspaco = hasRevenue ? motorcyclesInMonth * 250 : 0; // R$ 250 por moto no mês (só se há receita)
      const royalties = receita * 0.05; // 5% sobre receita operacional
      const ipvaTaxas = 0; // Conforme exemplo
      const fundoMarketing = hasRevenue ? 300 : 0; // R$ 300 fixo por franqueado (só se há receita)
      const sistemaGestao = hasRevenue ? 80 : 0; // R$ 80 fixo por franqueado (só se há receita)
      const honorariosContabeis = hasRevenue ? 600 : 0; // R$ 600 fixo por franqueado (só se há receita)

      const custosOperacionais = {
        seguroRastreador,
        manutencao,
        taxaEspaco,
        royalties,
        ipvaTaxas,
        fundoMarketing,
        sistemaGestao,
        honorariosContabeis,
        total: seguroRastreador + manutencao + taxaEspaco + royalties + ipvaTaxas +
               fundoMarketing + sistemaGestao + honorariosContabeis
      };

      const receitaBruta = receita + receitasNaoOperacionais.total;
      const lucroLiquido = receitaTotal - tributosReceitas.total - custosOperacionais.total;
      const margemLiquida = receitaTotal > 0 ? (lucroLiquido / receitaTotal) * 100 : 0;
      const receitaLiquidaPorMoto = motorcyclesInMonth > 0 ? lucroLiquido / motorcyclesInMonth : 0;

      monthlyData.push({
        month: months[month - 1].short,
        monthNumber: month,
        receita,
        receitasNaoOperacionais,
        receitaBruta,
        tributosReceitas,
        custosOperacionais,
        lucroLiquido,
        margemLiquida,
        receitaLiquidaPorMoto
      });
    }

    return monthlyData;
  }, [motorcycles, selectedYear, selectedFranchisee]);

  // Calcular totais do ano
  const yearTotals = useMemo(() => {
    return dreData.reduce((totals, month) => ({
      receita: totals.receita + month.receita,
      receitasNaoOperacionais: totals.receitasNaoOperacionais + month.receitasNaoOperacionais.total,
      receitaBruta: totals.receitaBruta + month.receitaBruta,
      tributosReceitas: totals.tributosReceitas + month.tributosReceitas.total,
      custosOperacionais: totals.custosOperacionais + month.custosOperacionais.total,
      lucroLiquido: totals.lucroLiquido + month.lucroLiquido,
    }), {
      receita: 0,
      receitasNaoOperacionais: 0,
      receitaBruta: 0,
      tributosReceitas: 0,
      custosOperacionais: 0,
      lucroLiquido: 0,
    });
  }, [dreData]);

  const yearReceitaTotal = yearTotals.receita + yearTotals.receitasNaoOperacionais;
  const yearMargemLiquida = yearReceitaTotal > 0 ? (yearTotals.lucroLiquido / yearReceitaTotal) * 100 : 0;

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
              {/* Receita Operacional */}
              <TableRow className="bg-green-50">
                <TableCell className="font-semibold text-green-700">
                  Receita Operacional
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

              {/* Receitas Não Operacionais */}
              <TableRow className="bg-green-25">
                <TableCell className="font-semibold text-green-600 pl-4">
                  (+) Caução
                </TableCell>
                {dreData.map(month => (
                  <TableCell key={month.monthNumber} className="text-center text-green-600">
                    {formatCurrency(month.receitasNaoOperacionais.caucao)}
                  </TableCell>
                ))}
                <TableCell className="text-center font-bold text-green-600 bg-gray-50">
                  {formatCurrency(dreData.reduce((sum, m) => sum + m.receitasNaoOperacionais.caucao, 0))}
                </TableCell>
              </TableRow>

              <TableRow className="bg-green-25">
                <TableCell className="font-semibold text-green-600 pl-4">
                  (+) Juros
                </TableCell>
                {dreData.map(month => (
                  <TableCell key={month.monthNumber} className="text-center text-green-600">
                    {formatCurrency(month.receitasNaoOperacionais.juros)}
                  </TableCell>
                ))}
                <TableCell className="text-center font-bold text-green-600 bg-gray-50">
                  {formatCurrency(dreData.reduce((sum, m) => sum + m.receitasNaoOperacionais.juros, 0))}
                </TableCell>
              </TableRow>

              {/* Receita Bruta */}
              <TableRow className="bg-green-100 border-t-2 border-green-300">
                <TableCell className="font-bold text-green-800">
                  RECEITA BRUTA
                </TableCell>
                {dreData.map(month => (
                  <TableCell key={month.monthNumber} className="text-center font-bold text-green-800">
                    {formatCurrency(month.receitaBruta)}
                  </TableCell>
                ))}
                <TableCell className="text-center font-bold text-green-800 bg-green-200">
                  {formatCurrency(dreData.reduce((sum, m) => sum + m.receitaBruta, 0))}
                </TableCell>
              </TableRow>

              {/* Tributos sobre Receitas */}
              <TableRow className="bg-red-50">
                <TableCell className="font-semibold text-red-600">
                  (-) Simples Nacional
                </TableCell>
                {dreData.map(month => (
                  <TableCell key={month.monthNumber} className="text-center text-red-600">
                    {formatCurrency(month.tributosReceitas.simplesNacional)}
                  </TableCell>
                ))}
                <TableCell className="text-center font-bold text-red-600 bg-red-100">
                  {formatCurrency(yearTotals.tributosReceitas)}
                </TableCell>
              </TableRow>

              {/* Custos/Despesas Operacionais */}
              <TableRow className="bg-orange-50">
                <TableCell className="font-semibold text-orange-700">
                  CUSTOS/DESPESAS OPERACIONAIS
                </TableCell>
                {dreData.map(month => (
                  <TableCell key={month.monthNumber} className="text-center text-orange-700 font-bold">
                    {formatCurrency(month.custosOperacionais.total)}
                  </TableCell>
                ))}
                <TableCell className="text-center font-bold text-orange-700 bg-orange-100">
                  {formatCurrency(yearTotals.custosOperacionais)}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium text-red-600 pl-4">
                  (-) Seguro Rastreador
                </TableCell>
                {dreData.map(month => (
                  <TableCell key={month.monthNumber} className="text-center text-red-600">
                    {formatCurrency(month.custosOperacionais.seguroRastreador)}
                  </TableCell>
                ))}
                <TableCell className="text-center font-bold text-red-600 bg-gray-50">
                  {formatCurrency(dreData.reduce((sum, m) => sum + m.custosOperacionais.seguroRastreador, 0))}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium text-red-600 pl-4">
                  (-) Manutenção
                </TableCell>
                {dreData.map(month => (
                  <TableCell key={month.monthNumber} className="text-center text-red-600">
                    {formatCurrency(month.custosOperacionais.manutencao)}
                  </TableCell>
                ))}
                <TableCell className="text-center font-bold text-red-600 bg-gray-50">
                  {formatCurrency(dreData.reduce((sum, m) => sum + m.custosOperacionais.manutencao, 0))}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium text-red-600 pl-4">
                  (-) Taxa de Espaço
                </TableCell>
                {dreData.map(month => (
                  <TableCell key={month.monthNumber} className="text-center text-red-600">
                    {formatCurrency(month.custosOperacionais.taxaEspaco)}
                  </TableCell>
                ))}
                <TableCell className="text-center font-bold text-red-600 bg-gray-50">
                  {formatCurrency(dreData.reduce((sum, m) => sum + m.custosOperacionais.taxaEspaco, 0))}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium text-red-600 pl-4">
                  (-) Royalties
                </TableCell>
                {dreData.map(month => (
                  <TableCell key={month.monthNumber} className="text-center text-red-600">
                    {formatCurrency(month.custosOperacionais.royalties)}
                  </TableCell>
                ))}
                <TableCell className="text-center font-bold text-red-600 bg-gray-50">
                  {formatCurrency(dreData.reduce((sum, m) => sum + m.custosOperacionais.royalties, 0))}
                </TableCell>
              </TableRow>


              <TableRow>
                <TableCell className="font-medium text-red-600 pl-4">
                  (-) Fundo de Marketing
                </TableCell>
                {dreData.map(month => (
                  <TableCell key={month.monthNumber} className="text-center text-red-600">
                    {formatCurrency(month.custosOperacionais.fundoMarketing)}
                  </TableCell>
                ))}
                <TableCell className="text-center font-bold text-red-600 bg-gray-50">
                  {formatCurrency(dreData.reduce((sum, m) => sum + m.custosOperacionais.fundoMarketing, 0))}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium text-red-600 pl-4">
                  (-) Sistema de Gestão
                </TableCell>
                {dreData.map(month => (
                  <TableCell key={month.monthNumber} className="text-center text-red-600">
                    {formatCurrency(month.custosOperacionais.sistemaGestao)}
                  </TableCell>
                ))}
                <TableCell className="text-center font-bold text-red-600 bg-gray-50">
                  {formatCurrency(dreData.reduce((sum, m) => sum + m.custosOperacionais.sistemaGestao, 0))}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium text-red-600 pl-4">
                  (-) Honorários Contábeis
                </TableCell>
                {dreData.map(month => (
                  <TableCell key={month.monthNumber} className="text-center text-red-600">
                    {formatCurrency(month.custosOperacionais.honorariosContabeis)}
                  </TableCell>
                ))}
                <TableCell className="text-center font-bold text-red-600 bg-gray-50">
                  {formatCurrency(dreData.reduce((sum, m) => sum + m.custosOperacionais.honorariosContabeis, 0))}
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

              {/* Receita Líquida por Moto */}
              <TableRow className="bg-green-50">
                <TableCell className="font-bold text-green-700">
                  Receita Líquida por Moto
                </TableCell>
                {dreData.map(month => (
                  <TableCell key={month.monthNumber} className="text-center font-bold text-green-700">
                    {formatCurrency(month.receitaLiquidaPorMoto)}
                  </TableCell>
                ))}
                <TableCell className="text-center font-bold text-green-700 bg-green-100">
                  {formatCurrency(dreData.reduce((sum, m, index, arr) => {
                    const totalMotorcycles = dreData.reduce((total, month) => {
                      const uniquePlates = new Set(motorcycles.filter(moto => {
                        if (!moto.data_ultima_mov) {
                          return moto.status === 'alugada' || moto.status === 'relocada';
                        }
                        
                        try {
                          const motoDate = new Date(moto.data_ultima_mov);
                          const motoYear = motoDate.getFullYear();
                          const motoMonth = motoDate.getMonth() + 1;
                          
                          if (motoYear === parseInt(selectedYear) && motoMonth === month.monthNumber) {
                            return true;
                          } else if (motoYear < parseInt(selectedYear) || (motoYear === parseInt(selectedYear) && motoMonth < month.monthNumber)) {
                            return moto.status === 'alugada' || moto.status === 'relocada';
                          }
                          
                          return false;
                        } catch {
                          return false;
                        }
                      }).filter(moto => selectedFranchisee === "all" || moto.franqueado?.trim() === selectedFranchisee).map(moto => moto.placa));
                      return total + uniquePlates.size;
                    }, 0);
                    
                    const totalLucroLiquido = dreData.reduce((total, month) => total + month.lucroLiquido, 0);
                    return totalMotorcycles > 0 ? totalLucroLiquido / totalMotorcycles : 0;
                  }, 0))}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>


        {/* Botão de Regras */}
        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            onClick={() => setShowRules(!showRules)}
            className="flex items-center gap-2"
          >
            <Info className="h-4 w-4" />
            {showRules ? 'Ocultar Regras' : 'Ver Regras de Cálculo'}
          </Button>
        </div>

        {/* Nota informativa - só aparece quando showRules é true */}
        {showRules && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="text-blue-700 border-blue-300">
                Informações
              </Badge>
              <div className="text-sm text-blue-700">
                <p className="mb-2"><strong>Regras de Cálculo:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Custos aplicados apenas em meses com receita:</strong></li>
                  <li>Taxa de Espaço: R$ 250 por moto no mês específico</li>
                  <li>Seguro Rastreador: R$ 139,90 por moto no mês específico</li>
                  <li>Fundo de Marketing: R$ 300 fixo por franqueado</li>
                  <li>Sistema de Gestão: R$ 80 fixo por franqueado</li>
                  <li>Honorários Contábeis: R$ 600 fixo por franqueado</li>
                  <li>Juros: R$ 212 a cada 10 motos no mês específico</li>
                  <li><strong>Outros:</strong></li>
                  <li>Manutenção: Será integrada com base de dados externa</li>
                  <li>Royalties: 5% sobre receita operacional</li>
                  <li>Caução: R$ 700 por moto alugada + R$ 400 por moto relocada no mês específico</li>
                  <li>Simples Nacional: 7% sobre receita bruta</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}