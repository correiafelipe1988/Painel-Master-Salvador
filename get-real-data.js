// Script para analisar dados reais do banco de dados
// Execute este script para ver os dados reais de crescimento

// Importar as dependências necessárias
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Configuração do Firebase (substitua pela sua configuração)
const firebaseConfig = {
  // Suas credenciais do Firebase aqui
  // Você pode encontrar em src/lib/firebase/config.ts
};

// Função para analisar dados reais
async function analyzeRealData() {
  try {
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Buscar dados das motos
    const motorcyclesRef = collection(db, 'motorcycles');
    const snapshot = await getDocs(motorcyclesRef);
    
    const motorcycles = [];
    snapshot.forEach((doc) => {
      motorcycles.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log('=== DADOS DO BANCO DE DADOS ===');
    console.log('Total de registros:', motorcycles.length);
    
    // Processar dados usando a lógica correta
    const realData = getRealGrowthData(motorcycles, 2025);
    
    console.log('');
    console.log('=== CRESCIMENTO REAL 2025 ===');
    console.log('Base anterior:', realData.baseAnterior);
    console.log('Total atual:', realData.totalAtual);
    console.log('');
    
    realData.monthlyData.forEach(item => {
      if (item.monthNumber <= 7) { // Só mostrar até mês atual
        console.log(`${item.month}: ${item.novas} novas → ${item.acumulado} total`);
      }
    });
    
    // Comparar com lógica atual
    const mesAtual = 7;
    const baseAtual = realData.totalAtual;
    const crescimentoMedio = Math.round(baseAtual / mesAtual);
    
    console.log('');
    console.log('=== COMPARAÇÃO ===');
    console.log('Lógica atual (estimativa):', crescimentoMedio, 'motos/mês');
    console.log('Diferenças encontradas:');
    
    for (let i = 1; i <= 7; i++) {
      const realValue = realData.monthlyData[i-1].acumulado;
      const estimatedValue = crescimentoMedio * i;
      const diff = realValue - estimatedValue;
      const monthName = realData.monthlyData[i-1].month;
      
      if (diff !== 0) {
        console.log(`${monthName}: Real=${realValue} | Estimado=${estimatedValue} | Diff=${diff > 0 ? '+' : ''}${diff}`);
      }
    }
    
  } catch (error) {
    console.error('Erro ao analisar dados:', error);
  }
}

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

// Executar análise
analyzeRealData();