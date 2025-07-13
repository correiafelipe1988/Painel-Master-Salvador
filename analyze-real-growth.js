// Análise dos dados reais de crescimento das motos
const motorcycles = [
  {placa: 'ABC-1234', data_criacao: '2025-01-15T10:00:00Z'},
  {placa: 'DEF-5678', data_criacao: '2025-02-20T14:30:00Z'},
  {placa: 'GHI-9012', data_criacao: '2025-03-10T09:15:00Z'},
  {placa: 'JKL-3456', data_criacao: '2025-04-25T16:45:00Z'},
  {placa: 'MNO-7890', data_criacao: '2025-05-08T11:20:00Z'},
  {placa: 'PQR-2468', data_criacao: '2025-06-12T13:10:00Z'},
  {placa: 'STU-1357', data_criacao: '2025-07-05T15:30:00Z'}
];

function getRealGrowthData(motorcycles, year = 2025) {
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  
  const earliestDateByPlaca = new Map();
  
  motorcycles.forEach(moto => {
    if (moto.placa && moto.data_criacao) {
      const date = new Date(moto.data_criacao);
      if (!isNaN(date.getTime())) {
        const existingDate = earliestDateByPlaca.get(moto.placa);
        if (!existingDate || date < existingDate) {
          earliestDateByPlaca.set(moto.placa, date);
        }
      }
    }
  });
  
  const monthlyData = Array(12).fill(0).map((_, index) => ({
    month: monthNames[index],
    monthNumber: index + 1,
    novas: 0,
    acumulado: 0
  }));
  
  let baseCountForYearStart = 0;
  
  earliestDateByPlaca.forEach(date => {
    const entryYear = date.getFullYear();
    if (entryYear < year) {
      baseCountForYearStart++;
    } else if (entryYear === year) {
      const monthIndex = date.getMonth();
      monthlyData[monthIndex].novas++;
    }
  });
  
  let cumulativeCount = baseCountForYearStart;
  monthlyData.forEach(item => {
    cumulativeCount += item.novas;
    item.acumulado = cumulativeCount;
  });
  
  return {
    baseAnterior: baseCountForYearStart,
    monthlyData: monthlyData,
    totalAtual: cumulativeCount
  };
}

// Análise dos dados reais
const realData = getRealGrowthData(motorcycles, 2025);
console.log('=== ANÁLISE DE CRESCIMENTO REAL ===');
console.log('Base anterior a 2025:', realData.baseAnterior);
console.log('Total atual:', realData.totalAtual);
console.log('');
console.log('Crescimento mensal REAL:');
realData.monthlyData.forEach(item => {
  console.log(`${item.month}: ${item.novas} novas → ${item.acumulado} total`);
});

// Comparar com lógica atual (estimativa linear)
const mesAtual = 7; // julho
const baseAtual = realData.totalAtual;
const crescimentoMedio = Math.round(baseAtual / mesAtual);

console.log('');
console.log('=== COMPARAÇÃO COM LÓGICA ATUAL ===');
console.log('Crescimento médio estimado:', crescimentoMedio, 'motos/mês');
console.log('');
console.log('Estimativa linear atual vs Dados reais:');
for (let i = 1; i <= 7; i++) {
  const realValue = realData.monthlyData[i-1].acumulado;
  const estimatedValue = crescimentoMedio * i;
  const diff = realValue - estimatedValue;
  const monthName = realData.monthlyData[i-1].month;
  console.log(`${monthName}: Real=${realValue} | Estimado=${estimatedValue} | Diff=${diff > 0 ? '+' : ''}${diff}`);
}