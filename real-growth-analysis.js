/**
 * Script para análise de crescimento mensal real das motos
 * Baseado na lógica existente do dashboard (src/app/dashboard/page.tsx linhas 105-131)
 * 
 * Este script processa os dados reais das motos usando data_criacao para calcular:
 * - Crescimento mensal real (não estimativas)
 * - Dados acumulados mês a mês
 * - Comparação com projeções lineares
 */

// Simulação das importações do date-fns (adapte conforme necessário)
const { parseISO, isValid, getYear, getMonth, format } = require('date-fns');

// Constantes baseadas no dashboard existente
const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const monthAbbreviations = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

/**
 * Função principal para analisar o crescimento real mensal das motos
 * Usa a mesma lógica do dashboard existente (linhas 102-137)
 * 
 * @param {Array} motorcycles - Array de motos do banco de dados
 * @param {number} year - Ano para análise (padrão: 2025)
 * @returns {Object} Dados de crescimento real e comparações
 */
function analyzeRealMotorcycleGrowth(motorcycles, year = 2025) {
  console.log(`\n=== ANÁLISE DE CRESCIMENTO REAL DAS MOTOS - ${year} ===`);
  console.log(`Total de registros de motos: ${motorcycles.length}`);

  // Lógica baseada nas linhas 102-118 do dashboard
  // Encontra a data mais antiga para cada placa (evita duplicatas)
  const earliestDateByPlaca = new Map();
  
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

  console.log(`Motos únicas identificadas: ${earliestDateByPlaca.size}`);

  // Lógica baseada nas linhas 120-131 do dashboard
  // Conta novas motos por mês
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

  console.log(`\nBase de motos no início de ${year}: ${baseCountForYearStart}`);
  console.log('Novas motos por mês:');
  
  // Lógica baseada nas linhas 133-137 do dashboard
  // Calcula dados acumulados
  let cumulativeCount = baseCountForYearStart;
  const realGrowthData = monthAbbreviations.map((month, index) => {
    const newMotosThisMonth = monthlyNewMotorcycles[index];
    cumulativeCount += newMotosThisMonth;
    
    console.log(`${monthNames[index]}: +${newMotosThisMonth} motos (Total: ${cumulativeCount})`);
    
    return {
      month,
      monthName: monthNames[index],
      newMotorcycles: newMotosThisMonth,
      cumulativeCount,
      growthRate: baseCountForYearStart > 0 ? ((cumulativeCount - baseCountForYearStart) / baseCountForYearStart * 100).toFixed(1) : '0'
    };
  });

  return {
    year,
    baseCount: baseCountForYearStart,
    totalUniqueMotorcycles: earliestDateByPlaca.size,
    monthlyNewMotorcycles,
    realGrowthData,
    summary: generateGrowthSummary(realGrowthData, baseCountForYearStart)
  };
}

/**
 * Gera resumo do crescimento
 */
function generateGrowthSummary(growthData, baseCount) {
  const currentMonth = new Date().getMonth();
  const dataUpToCurrentMonth = growthData.slice(0, currentMonth + 1);
  
  const totalNewMotorcycles = dataUpToCurrentMonth.reduce((sum, month) => sum + month.newMotorcycles, 0);
  const currentTotal = dataUpToCurrentMonth[dataUpToCurrentMonth.length - 1]?.cumulativeCount || baseCount;
  const overallGrowthRate = baseCount > 0 ? ((currentTotal - baseCount) / baseCount * 100).toFixed(1) : '0';
  
  const bestMonth = growthData.reduce((best, current) => 
    current.newMotorcycles > best.newMotorcycles ? current : best
  );
  
  const averageMonthlyGrowth = (totalNewMotorcycles / (currentMonth + 1)).toFixed(1);

  return {
    totalNewMotorcycles,
    currentTotal,
    overallGrowthRate: `${overallGrowthRate}%`,
    bestMonth: {
      month: bestMonth.monthName,
      count: bestMonth.newMotorcycles
    },
    averageMonthlyGrowth: `${averageMonthlyGrowth} motos/mês`
  };
}

/**
 * Compara dados reais com projeção linear
 */
function compareWithLinearProjection(realData, baseCount) {
  console.log('\n=== COMPARAÇÃO: REAL vs PROJEÇÃO LINEAR ===');
  
  // Calcula projeção linear baseada no crescimento médio
  const currentMonth = new Date().getMonth();
  const totalNewSoFar = realData.slice(0, currentMonth + 1).reduce((sum, month) => sum + month.newMotorcycles, 0);
  const avgMonthlyGrowth = totalNewSoFar / (currentMonth + 1);
  
  console.log(`Crescimento médio mensal real: ${avgMonthlyGrowth.toFixed(1)} motos`);
  
  const comparison = realData.map((realMonth, index) => {
    const projectedCumulative = baseCount + (avgMonthlyGrowth * (index + 1));
    const difference = realMonth.cumulativeCount - projectedCumulative;
    const percentDifference = projectedCumulative > 0 ? ((difference / projectedCumulative) * 100).toFixed(1) : '0';
    
    return {
      month: realMonth.monthName,
      real: realMonth.cumulativeCount,
      projected: Math.round(projectedCumulative),
      difference: Math.round(difference),
      percentDifference: `${percentDifference}%`,
      status: difference > 0 ? 'Acima' : difference < 0 ? 'Abaixo' : 'Igual'
    };
  });

  console.log('\nComparação mês a mês:');
  comparison.forEach(comp => {
    console.log(`${comp.month}: Real ${comp.real} | Projeção ${comp.projected} | Diferença ${comp.difference} (${comp.percentDifference}) - ${comp.status}`);
  });

  return comparison;
}

/**
 * Gera dados formatados para o componente BaseGrowthChart
 */
function generateChartData(realData) {
  return realData.map(month => ({
    month: month.month,
    cumulativeCount: month.cumulativeCount
  }));
}

/**
 * Função para integração fácil no componente existente
 */
function getRealGrowthDataForChart(motorcycles, year = 2025) {
  const analysis = analyzeRealMotorcycleGrowth(motorcycles, year);
  return generateChartData(analysis.realGrowthData);
}

/**
 * Exemplo de uso com dados simulados
 */
function exampleUsage() {
  // Simula dados de motos (substitua pelos dados reais do seu banco)
  const sampleMotorcycles = [
    { placa: 'ABC-1234', data_criacao: '2025-01-15T10:00:00.000Z' },
    { placa: 'DEF-5678', data_criacao: '2025-02-20T14:30:00.000Z' },
    { placa: 'GHI-9012', data_criacao: '2025-02-25T09:15:00.000Z' },
    { placa: 'JKL-3456', data_criacao: '2025-03-10T16:45:00.000Z' },
    // Adicione mais dados conforme necessário
  ];

  const analysis = analyzeRealMotorcycleGrowth(sampleMotorcycles, 2025);
  
  console.log('\n=== RESUMO EXECUTIVO ===');
  console.log(`Total atual de motos: ${analysis.summary.currentTotal}`);
  console.log(`Crescimento total: ${analysis.summary.overallGrowthRate}`);
  console.log(`Melhor mês: ${analysis.summary.bestMonth.month} (${analysis.summary.bestMonth.count} motos)`);
  console.log(`Média mensal: ${analysis.summary.averageMonthlyGrowth}`);

  const comparison = compareWithLinearProjection(analysis.realGrowthData, analysis.baseCount);
  const chartData = generateChartData(analysis.realGrowthData);

  console.log('\n=== DADOS PARA GRÁFICO ===');
  console.log('Formato para BaseGrowthChart:');
  console.log(JSON.stringify(chartData, null, 2));

  return {
    analysis,
    comparison,
    chartData
  };
}

// Exporta as funções principais
module.exports = {
  analyzeRealMotorcycleGrowth,
  compareWithLinearProjection,
  generateChartData,
  getRealGrowthDataForChart,
  exampleUsage
};

// Executa exemplo se executado diretamente
if (require.main === module) {
  exampleUsage();
}