#!/usr/bin/env node

/**
 * Script de teste para validar a análise de crescimento real das motos
 * 
 * Execute com: node test-real-growth.js
 * 
 * Este script simula dados de motos e demonstra como a análise funciona
 * com dados reais versus estimativas lineares.
 */

const { parseISO, isValid, getYear, getMonth, format } = require('date-fns');

// Simula as constantes e funções do sistema
const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const monthAbbreviations = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

/**
 * Função IDÊNTICA à do dashboard (linhas 102-137)
 */
function analyzeRealMotorcycleGrowth(motorcycles, year = 2025) {
  console.log(`\n=== ANÁLISE DE CRESCIMENTO REAL - ${year} ===`);
  console.log(`Total de registros: ${motorcycles.length}`);

  // Lógica IDÊNTICA às linhas 102-118
  const earliestDateByPlaca = new Map();
  
  motorcycles.forEach(moto => {
    if (moto.placa) {
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
          // Ignora datas inválidas
        }
      }
    }
  });

  console.log(`Motos únicas identificadas: ${earliestDateByPlaca.size}`);

  // Lógica IDÊNTICA às linhas 120-131
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

  console.log(`Base início do ano: ${baseCountForYearStart}`);

  // Lógica IDÊNTICA às linhas 133-137
  let cumulativeCount = baseCountForYearStart;
  const realGrowthData = monthAbbreviations.map((month, index) => {
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

  console.log('\n=== CRESCIMENTO MENSAL ===');
  realGrowthData.forEach(month => {
    if (month.newMotorcycles > 0 || month.cumulativeCount > baseCountForYearStart) {
      console.log(`${month.monthName}: +${month.newMotorcycles} motos (Total: ${month.cumulativeCount}, Crescimento: ${month.growthRate.toFixed(1)}%)`);
    }
  });

  return {
    year,
    baseCount: baseCountForYearStart,
    totalUniqueMotorcycles: earliestDateByPlaca.size,
    monthlyNewMotorcycles,
    realGrowthData
  };
}

/**
 * Gera dados de teste realistas
 */
function generateTestData() {
  const motorcycles = [];
  
  // Motos da base histórica (2024 e antes)
  for (let i = 0; i < 150; i++) {
    motorcycles.push({
      placa: `BASE${i.toString().padStart(3, '0')}`,
      data_criacao: `2024-${(Math.floor(Math.random() * 12) + 1).toString().padStart(2, '0')}-${(Math.floor(Math.random() * 28) + 1).toString().padStart(2, '0')}T10:00:00.000Z`,
      status: 'active'
    });
  }

  // Crescimento realista para 2025
  const monthlyTargets = [
    { month: 0, target: 25 }, // Janeiro
    { month: 1, target: 18 }, // Fevereiro
    { month: 2, target: 30 }, // Março
    { month: 3, target: 15 }, // Abril
    { month: 4, target: 22 }, // Maio
    { month: 5, target: 28 }, // Junho
    { month: 6, target: 35 }, // Julho (até aqui - dados reais)
    { month: 7, target: 20 }, // Agosto
    { month: 8, target: 25 }, // Setembro
    { month: 9, target: 30 }, // Outubro
    { month: 10, target: 18 }, // Novembro
    { month: 11, target: 24 } // Dezembro
  ];

  monthlyTargets.forEach(({ month, target }) => {
    for (let i = 0; i < target; i++) {
      const day = Math.floor(Math.random() * 28) + 1;
      motorcycles.push({
        placa: `2025${month.toString().padStart(2, '0')}${i.toString().padStart(3, '0')}`,
        data_criacao: `2025-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${Math.floor(Math.random() * 12) + 8}:00:00.000Z`,
        status: 'active'
      });
    }
  });

  return motorcycles;
}

/**
 * Compara com projeção linear
 */
function compareWithLinearProjection(realData, baseCount) {
  console.log('\n=== COMPARAÇÃO COM PROJEÇÃO LINEAR ===');
  
  const currentMonth = new Date().getMonth();
  const totalNewSoFar = realData.slice(0, currentMonth + 1).reduce((sum, month) => sum + month.newMotorcycles, 0);
  const avgMonthlyGrowth = totalNewSoFar / Math.max(currentMonth + 1, 1);
  
  console.log(`Crescimento médio mensal real: ${avgMonthlyGrowth.toFixed(1)} motos`);
  console.log(`Projeção para fim do ano: ${Math.round(baseCount + (avgMonthlyGrowth * 12))} motos`);
  
  console.log('\nComparação mês a mês:');
  realData.forEach((realMonth, index) => {
    const projectedCumulative = baseCount + (avgMonthlyGrowth * (index + 1));
    const difference = realMonth.cumulativeCount - projectedCumulative;
    const status = difference > 0 ? 'ACIMA' : difference < 0 ? 'ABAIXO' : 'IGUAL';
    
    console.log(`${realMonth.monthName}: Real ${realMonth.cumulativeCount} | Projeção ${Math.round(projectedCumulative)} | Diferença ${Math.round(difference)} (${status})`);
  });
}

/**
 * Gera dados compatíveis com BaseGrowthChart
 */
function generateChartData(realData) {
  console.log('\n=== DADOS PARA GRÁFICO (BaseGrowthChart) ===');
  const chartData = realData.map(month => ({
    month: month.month,
    cumulativeCount: month.cumulativeCount
  }));
  
  console.log('Formato JSON para BaseGrowthChart:');
  console.log(JSON.stringify(chartData, null, 2));
  
  return chartData;
}

/**
 * Função principal de teste
 */
function runTest() {
  console.log('🔍 TESTE DE ANÁLISE DE CRESCIMENTO REAL DAS MOTOS');
  console.log('=' .repeat(60));
  
  // Gera dados de teste
  const testMotorcycles = generateTestData();
  
  // Executa análise
  const analysis = analyzeRealMotorcycleGrowth(testMotorcycles, 2025);
  
  // Compara com projeção
  compareWithLinearProjection(analysis.realGrowthData, analysis.baseCount);
  
  // Gera dados para gráfico
  const chartData = generateChartData(analysis.realGrowthData);
  
  // Resumo executivo
  const currentMonth = new Date().getMonth();
  const currentData = analysis.realGrowthData[currentMonth];
  
  console.log('\n=== RESUMO EXECUTIVO ===');
  console.log(`📊 Total atual de motos: ${currentData.cumulativeCount}`);
  console.log(`📈 Crescimento total: ${currentData.growthRate.toFixed(1)}%`);
  console.log(`🎯 Melhor mês: ${analysis.realGrowthData.reduce((best, current) => 
    current.newMotorcycles > best.newMotorcycles ? current : best
  ).monthName}`);
  
  console.log('\n✅ Teste concluído com sucesso!');
  console.log('📋 Use os dados acima para integrar no dashboard');
  
  return {
    analysis,
    chartData,
    testMotorcycles
  };
}

// Executa o teste
if (require.main === module) {
  try {
    runTest();
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

module.exports = {
  analyzeRealMotorcycleGrowth,
  generateTestData,
  compareWithLinearProjection,
  generateChartData,
  runTest
};