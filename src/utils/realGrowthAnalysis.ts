/**
 * Utilitário para análise de crescimento real das motos
 * Baseado na lógica existente do dashboard (src/app/dashboard/page.tsx linhas 105-131)
 * 
 * Este utilitário processa os dados reais das motos usando data_criacao para calcular
 * crescimento mensal real ao invés de estimativas lineares.
 */

import { parseISO, isValid, getYear, getMonth } from 'date-fns';
import type { Motorcycle } from '@/lib/types';

interface RealGrowthData {
  month: string;
  monthName: string;
  newMotorcycles: number;
  cumulativeCount: number;
  growthRate: number;
}

interface GrowthAnalysis {
  year: number;
  baseCount: number;
  totalUniqueMotorcycles: number;
  monthlyNewMotorcycles: number[];
  realGrowthData: RealGrowthData[];
  summary: {
    totalNewMotorcycles: number;
    currentTotal: number;
    overallGrowthRate: number;
    bestMonth: {
      month: string;
      count: number;
    };
    averageMonthlyGrowth: number;
  };
}

interface ComparisonData {
  month: string;
  real: number;
  projected: number;
  difference: number;
  percentDifference: number;
  status: 'above' | 'below' | 'equal';
}

// Constantes baseadas no dashboard existente
const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const monthAbbreviations = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

/**
 * Função principal para analisar o crescimento real mensal das motos
 * Usa exatamente a mesma lógica do dashboard existente (linhas 102-137)
 * 
 * @param motorcycles - Array de motos do banco de dados
 * @param year - Ano para análise (padrão: ano atual)
 * @returns Dados de crescimento real
 */
export function analyzeRealMotorcycleGrowth(motorcycles: Motorcycle[], year: number = new Date().getFullYear()): GrowthAnalysis {
  // Lógica IDÊNTICA às linhas 102-118 do dashboard
  const earliestDateByPlaca = new Map<string, Date>();
  
  motorcycles.forEach(moto => {
    if (moto.placa) {
      // Prioriza data_criacao conforme lógica original
      const dateString = moto.data_criacao || moto.data_ultima_mov;
      if (dateString) {
        try {
          const date = parseISO(dateString);
          if (isValid(date)) {
            const existingDate = earliestDateByPlaca.get(moto.placa);
            if (!existingDate || date < existingDate) {
              earliestDateByPlaca.set(moto.placa, date);
            }
          }
        } catch (e) {
          // Ignora datas inválidas conforme lógica original
        }
      }
    }
  });

  // Lógica IDÊNTICA às linhas 120-131 do dashboard
  const monthlyNewMotorcycles = Array(12).fill(0);
  let baseCountForYearStart = 0;

  earliestDateByPlaca.forEach(date => {
    const entryYear = getYear(date);
    if (entryYear < year) {
      baseCountForYearStart++;
    } else if (entryYear === year) {
      const monthIndex = getMonth(date);
      monthlyNewMotorcycles[monthIndex]++;
    }
  });

  // Lógica IDÊNTICA às linhas 133-137 do dashboard
  let cumulativeCount = baseCountForYearStart;
  const realGrowthData: RealGrowthData[] = monthAbbreviations.map((month, index) => {
    const newMotosThisMonth = monthlyNewMotorcycles[index];
    cumulativeCount += newMotosThisMonth;
    
    return {
      month,
      monthName: monthNames[index],
      newMotorcycles: newMotosThisMonth,
      cumulativeCount,
      growthRate: baseCountForYearStart > 0 ? ((cumulativeCount - baseCountForYearStart) / baseCountForYearStart * 100) : 0
    };
  });

  const summary = generateGrowthSummary(realGrowthData, baseCountForYearStart);

  return {
    year,
    baseCount: baseCountForYearStart,
    totalUniqueMotorcycles: earliestDateByPlaca.size,
    monthlyNewMotorcycles,
    realGrowthData,
    summary
  };
}

/**
 * Gera resumo executivo do crescimento
 */
function generateGrowthSummary(growthData: RealGrowthData[], baseCount: number) {
  const currentMonth = new Date().getMonth();
  const dataUpToCurrentMonth = growthData.slice(0, currentMonth + 1);
  
  const totalNewMotorcycles = dataUpToCurrentMonth.reduce((sum, month) => sum + month.newMotorcycles, 0);
  const currentTotal = dataUpToCurrentMonth[dataUpToCurrentMonth.length - 1]?.cumulativeCount || baseCount;
  const overallGrowthRate = baseCount > 0 ? ((currentTotal - baseCount) / baseCount * 100) : 0;
  
  const bestMonth = growthData.reduce((best, current) => 
    current.newMotorcycles > best.newMotorcycles ? current : best
  );
  
  const averageMonthlyGrowth = totalNewMotorcycles / Math.max(currentMonth + 1, 1);

  return {
    totalNewMotorcycles,
    currentTotal,
    overallGrowthRate,
    bestMonth: {
      month: bestMonth.monthName,
      count: bestMonth.newMotorcycles
    },
    averageMonthlyGrowth
  };
}

/**
 * Compara dados reais com projeção linear
 */
export function compareWithLinearProjection(realData: RealGrowthData[], baseCount: number): ComparisonData[] {
  const currentMonth = new Date().getMonth();
  const totalNewSoFar = realData.slice(0, currentMonth + 1).reduce((sum, month) => sum + month.newMotorcycles, 0);
  const avgMonthlyGrowth = totalNewSoFar / Math.max(currentMonth + 1, 1);
  
  return realData.map((realMonth, index) => {
    const projectedCumulative = baseCount + (avgMonthlyGrowth * (index + 1));
    const difference = realMonth.cumulativeCount - projectedCumulative;
    const percentDifference = projectedCumulative > 0 ? ((difference / projectedCumulative) * 100) : 0;
    
    return {
      month: realMonth.monthName,
      real: realMonth.cumulativeCount,
      projected: Math.round(projectedCumulative),
      difference: Math.round(difference),
      percentDifference,
      status: difference > 0 ? 'above' : difference < 0 ? 'below' : 'equal'
    };
  });
}

/**
 * Gera dados formatados para o componente BaseGrowthChart existente
 */
export function getRealGrowthDataForChart(motorcycles: Motorcycle[], year: number = new Date().getFullYear()) {
  const analysis = analyzeRealMotorcycleGrowth(motorcycles, year);
  return analysis.realGrowthData.map(month => ({
    month: month.month,
    cumulativeCount: month.cumulativeCount
  }));
}

/**
 * Função utilitária para substituir a lógica atual do dashboard
 * Mantém compatibilidade com o processMotorcycleData existente
 */
export function processRealMotorcycleData(motorcycles: Motorcycle[], year: number) {
  const analysis = analyzeRealMotorcycleGrowth(motorcycles, year);
  
  // Formato compatível com o dashboard existente
  return {
    baseGrowth: analysis.realGrowthData.map(month => ({
      month: month.month,
      cumulativeCount: month.cumulativeCount
    })),
    realGrowthAnalysis: analysis,
    monthlyBreakdown: analysis.realGrowthData.map(month => ({
      month: month.monthName,
      new: month.newMotorcycles,
      total: month.cumulativeCount,
      growth: `${month.growthRate.toFixed(1)}%`
    }))
  };
}

/**
 * Função para debug e logs detalhados
 */
export function logRealGrowthAnalysis(motorcycles: Motorcycle[], year: number = new Date().getFullYear()) {
  const analysis = analyzeRealMotorcycleGrowth(motorcycles, year);
  
  console.log(`\n=== ANÁLISE DE CRESCIMENTO REAL - ${year} ===`);
  console.log(`Total de registros: ${motorcycles.length}`);
  console.log(`Motos únicas: ${analysis.totalUniqueMotorcycles}`);
  console.log(`Base início do ano: ${analysis.baseCount}`);
  console.log(`Total atual: ${analysis.summary.currentTotal}`);
  console.log(`Crescimento total: ${analysis.summary.overallGrowthRate.toFixed(1)}%`);
  console.log(`Melhor mês: ${analysis.summary.bestMonth.month} (${analysis.summary.bestMonth.count} motos)`);
  console.log(`Média mensal: ${analysis.summary.averageMonthlyGrowth.toFixed(1)} motos/mês`);
  
  console.log('\n=== CRESCIMENTO MENSAL ===');
  analysis.realGrowthData.forEach(month => {
    console.log(`${month.monthName}: +${month.newMotorcycles} motos (Total: ${month.cumulativeCount}, Crescimento: ${month.growthRate.toFixed(1)}%)`);
  });

  return analysis;
}