// Script para executar análise real de crescimento maio-julho
// Usa os mesmos serviços do Firebase que a aplicação

const admin = require('firebase-admin');
const path = require('path');

// Configurar Firebase Admin
const serviceAccount = require('./firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://painel-master-salvador-default-rtdb.firebaseio.com"
});

const db = admin.firestore();

async function executarAnaliseRealMaioJulho() {
  try {
    console.log('🔥 Conectando ao Firebase...');
    
    // Buscar dados das motos
    const motorcyclesRef = db.collection('motorcycles');
    const snapshot = await motorcyclesRef.get();
    
    if (snapshot.empty) {
      console.log('⚠️ Nenhuma moto encontrada na coleção');
      return;
    }
    
    const motorcycles = [];
    snapshot.forEach(doc => {
      motorcycles.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`📊 Total de registros encontrados: ${motorcycles.length}`);
    
    // Executar análise maio-julho
    const resultado = analisarCrescimentoMaioJulho(motorcycles);
    
    // Exibir resultados
    console.log('\n=== ANÁLISE DE CRESCIMENTO MAIO-JULHO 2025 ===');
    console.log(`Total de registros: ${resultado.totalRegistros}`);
    console.log(`Placas únicas: ${resultado.placasUnicas}`);
    console.log(`Base inicial (antes de 2025): ${resultado.baseInicial}`);
    
    console.log('\n=== CRESCIMENTO MENSAL 2025 ===');
    resultado.dadosMensais.forEach((item, index) => {
      const destaque = index >= 4 ? ' ⭐' : ''; // Maio em diante
      console.log(`${item.month}: ${item.novas} novas → ${item.acumulado} total${destaque}`);
    });
    
    console.log('\n=== FOCO: MAIO A JULHO ===');
    console.log(`Maio: ${resultado.maioJulho.maio} novas`);
    console.log(`Junho: ${resultado.maioJulho.junho} novas`);
    console.log(`Julho: ${resultado.maioJulho.julho} novas`);
    console.log(`Total maio-julho: ${resultado.maioJulho.total} novas`);
    console.log(`Média mensal: ${resultado.maioJulho.media} motos`);
    console.log(`Tendência: ${resultado.tendencia}`);
    
    console.log('\n=== PROJEÇÃO AGOSTO-DEZEMBRO ===');
    resultado.projecaoAgoDez.forEach(item => {
      console.log(`${item.mes}: +${item.incremento} → ${item.total} total`);
    });
    
    console.log('\n=== CONCLUSÃO ===');
    console.log(`Projeção para dezembro: ${resultado.projecaoFinal} motos`);
    console.log(`Meta (1000): ${resultado.atingeMeta ? 'ATINGÍVEL ✅' : 'DIFÍCIL ❌'}`);
    console.log(`Diferença: ${resultado.diferenca > 0 ? '+' : ''}${resultado.diferenca} motos`);
    
    if (resultado.atingeMeta) {
      console.log('\n✅ A meta de 1000 motos é ATINGÍVEL com base no crescimento maio-julho!');
    } else {
      console.log('\n❌ A meta de 1000 motos é DIFÍCIL com base no crescimento maio-julho.');
      console.log(`   Seria necessário um crescimento adicional de ${Math.abs(resultado.diferenca)} motos.`);
    }
    
    return resultado;
    
  } catch (error) {
    console.error('❌ Erro na análise:', error);
    throw error;
  }
}

function analisarCrescimentoMaioJulho(motorcycles) {
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const year = 2025;
  
  // Agrupar por placa única com data mais antiga
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
  
  // Analisar crescimento por mês
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
  
  // Calcular acumulado
  let cumulativeCount = baseCountForYearStart;
  monthlyData.forEach(item => {
    cumulativeCount += item.novas;
    item.acumulado = cumulativeCount;
  });
  
  const maioData = monthlyData[4]; // Maio
  const junhoData = monthlyData[5]; // Junho
  const julhoData = monthlyData[6]; // Julho
  
  const totalNovasMaioJulho = maioData.novas + junhoData.novas + julhoData.novas;
  const mediaMaioJulho = Math.round(totalNovasMaioJulho / 3);
  
  // Identificar tendência
  let tendencia = 'estável';
  if (junhoData.novas > maioData.novas && julhoData.novas > junhoData.novas) {
    tendencia = 'crescente';
  } else if (junhoData.novas < maioData.novas && julhoData.novas < junhoData.novas) {
    tendencia = 'decrescente';
  }
  
  // Projeção baseada na tendência recente
  let projecaoAgoDez = [];
  const mesesRestantes = ['Ago', 'Set', 'Out', 'Nov', 'Dez'];
  let baseParaProjecao = julhoData.acumulado;
  
  if (tendencia === 'crescente') {
    let incremento = julhoData.novas;
    mesesRestantes.forEach(mes => {
      incremento += 5;
      baseParaProjecao += incremento;
      projecaoAgoDez.push({ mes, incremento, total: baseParaProjecao });
    });
  } else if (tendencia === 'decrescente') {
    let incremento = julhoData.novas;
    mesesRestantes.forEach(mes => {
      incremento = Math.max(10, incremento - 5);
      baseParaProjecao += incremento;
      projecaoAgoDez.push({ mes, incremento, total: baseParaProjecao });
    });
  } else {
    const incremento = mediaMaioJulho;
    mesesRestantes.forEach(mes => {
      baseParaProjecao += incremento;
      projecaoAgoDez.push({ mes, incremento, total: baseParaProjecao });
    });
  }
  
  return {
    totalRegistros: motorcycles.length,
    placasUnicas: earliestDateByPlaca.size,
    baseInicial: baseCountForYearStart,
    dadosMensais: monthlyData.slice(0, 7), // Jan-Jul
    maioJulho: { 
      maio: maioData.novas, 
      junho: junhoData.novas, 
      julho: julhoData.novas,
      total: totalNovasMaioJulho,
      media: mediaMaioJulho
    },
    tendencia: tendencia,
    projecaoAgoDez: projecaoAgoDez,
    projecaoFinal: baseParaProjecao,
    atingeMeta: baseParaProjecao >= 1000,
    diferenca: 1000 - baseParaProjecao
  };
}

// Executar análise
if (require.main === module) {
  executarAnaliseRealMaioJulho()
    .then(() => {
      console.log('\n✅ Análise concluída!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Erro:', error);
      process.exit(1);
    });
}

module.exports = { executarAnaliseRealMaioJulho };