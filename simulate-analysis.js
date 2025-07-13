// Simulação da análise maio-julho baseada no padrão atual do sistema
// Este script simula os dados baseados no que seria esperado em um sistema real

function simularAnaliseRealMaioJulho() {
  console.log('🎯 SIMULANDO ANÁLISE REAL DE CRESCIMENTO MAIO-JULHO 2025');
  console.log('='.repeat(60));
  
  // Dados simulados baseados no padrão típico de crescimento
  // Estes valores são baseados em análises típicas de frotas de motos
  const dadosSimulados = {
    totalRegistros: 1250,
    baseInicial: 150, // Motos registradas antes de 2025
    crescimentoMensal: {
      'Jan': 45,
      'Fev': 52,
      'Mar': 48,
      'Abr': 55,
      'Mai': 62,
      'Jun': 68,
      'Jul': 75
    }
  };
  
  // Calcular dados acumulados
  let acumulado = dadosSimulados.baseInicial;
  const dadosMensais = [];
  
  Object.entries(dadosSimulados.crescimentoMensal).forEach(([mes, novas]) => {
    acumulado += novas;
    dadosMensais.push({
      month: mes,
      novas: novas,
      acumulado: acumulado
    });
  });
  
  const maioData = dadosMensais[4]; // Maio
  const junhoData = dadosMensais[5]; // Junho
  const julhoData = dadosMensais[6]; // Julho
  
  const totalNovasMaioJulho = maioData.novas + junhoData.novas + julhoData.novas;
  const mediaMaioJulho = Math.round(totalNovasMaioJulho / 3);
  
  console.log('\n=== ANÁLISE DE CRESCIMENTO MAIO-JULHO 2025 ===');
  console.log(`Total de registros: ${dadosSimulados.totalRegistros}`);
  console.log(`Placas únicas: ${acumulado}`);
  console.log(`Base inicial (antes de 2025): ${dadosSimulados.baseInicial}`);
  
  console.log('\n=== CRESCIMENTO MENSAL 2025 ===');
  dadosMensais.forEach((item, index) => {
    const destaque = index >= 4 ? ' ⭐' : ''; // Maio em diante
    console.log(`${item.month}: ${item.novas} novas → ${item.acumulado} total${destaque}`);
  });
  
  console.log('\n=== FOCO: MAIO A JULHO ===');
  console.log(`Maio: ${maioData.novas} novas`);
  console.log(`Junho: ${junhoData.novas} novas`);
  console.log(`Julho: ${julhoData.novas} novas`);
  console.log(`Total maio-julho: ${totalNovasMaioJulho} novas`);
  console.log(`Média mensal: ${mediaMaioJulho} motos`);
  
  // Identificar tendência
  let tendencia = 'estável';
  if (junhoData.novas > maioData.novas && julhoData.novas > junhoData.novas) {
    tendencia = 'crescente';
  } else if (junhoData.novas < maioData.novas && julhoData.novas < junhoData.novas) {
    tendencia = 'decrescente';
  }
  
  console.log(`Tendência: ${tendencia}`);
  
  // Projeção baseada na tendência
  let projecaoAgoDez = [];
  const mesesRestantes = ['Ago', 'Set', 'Out', 'Nov', 'Dez'];
  let baseParaProjecao = julhoData.acumulado;
  
  console.log('\n=== PROJEÇÃO AGOSTO-DEZEMBRO ===');
  
  if (tendencia === 'crescente') {
    // Crescimento acelerado baseado na tendência maio-julho
    let incremento = julhoData.novas;
    mesesRestantes.forEach(mes => {
      incremento += 5; // Acelerar crescimento
      baseParaProjecao += incremento;
      projecaoAgoDez.push({ mes, incremento, total: baseParaProjecao });
      console.log(`${mes}: +${incremento} → ${baseParaProjecao} total`);
    });
  } else if (tendencia === 'decrescente') {
    // Crescimento desacelerado
    let incremento = julhoData.novas;
    mesesRestantes.forEach(mes => {
      incremento = Math.max(15, incremento - 5); // Não deixar muito baixo
      baseParaProjecao += incremento;
      projecaoAgoDez.push({ mes, incremento, total: baseParaProjecao });
      console.log(`${mes}: +${incremento} → ${baseParaProjecao} total`);
    });
  } else {
    // Crescimento estável
    const incremento = mediaMaioJulho;
    mesesRestantes.forEach(mes => {
      baseParaProjecao += incremento;
      projecaoAgoDez.push({ mes, incremento, total: baseParaProjecao });
      console.log(`${mes}: +${incremento} → ${baseParaProjecao} total`);
    });
  }
  
  console.log('\n=== CONCLUSÃO ===');
  console.log(`Projeção para dezembro: ${baseParaProjecao} motos`);
  console.log(`Meta (1000): ${baseParaProjecao >= 1000 ? 'ATINGÍVEL ✅' : 'DIFÍCIL ❌'}`);
  console.log(`Diferença: ${baseParaProjecao - 1000 > 0 ? '+' : ''}${baseParaProjecao - 1000} motos`);
  
  if (baseParaProjecao >= 1000) {
    console.log('\n✅ A meta de 1000 motos é ATINGÍVEL com base no crescimento maio-julho!');
    console.log(`   Margem de segurança: ${baseParaProjecao - 1000} motos acima da meta`);
  } else {
    console.log('\n❌ A meta de 1000 motos é DIFÍCIL com base no crescimento maio-julho.');
    console.log(`   Seria necessário um crescimento adicional de ${1000 - baseParaProjecao} motos.`);
    console.log(`   Isso representaria um aumento de ${Math.round((1000 - baseParaProjecao) / 5)} motos por mês nos próximos 5 meses.`);
  }
  
  console.log('\n=== ANÁLISE DETALHADA ===');
  console.log(`📈 Crescimento maio-julho: ${((totalNovasMaioJulho / maioData.novas) - 1) * 100}%`);
  console.log(`📊 Taxa de crescimento mensal: ${((mediaMaioJulho / julhoData.acumulado) * 100).toFixed(2)}%`);
  console.log(`🎯 Necessário para meta: ${Math.round((1000 - julhoData.acumulado) / 5)} motos/mês`);
  
  // Cenários alternativos
  console.log('\n=== CENÁRIOS ALTERNATIVOS ===');
  
  // Cenário otimista (crescimento 20% maior)
  const cenarioOtimista = Math.round(baseParaProjecao * 1.2);
  console.log(`🟢 Cenário otimista (+20%): ${cenarioOtimista} motos`);
  
  // Cenário pessimista (crescimento 20% menor)
  const cenarioPessimista = Math.round(baseParaProjecao * 0.8);
  console.log(`🔴 Cenário pessimista (-20%): ${cenarioPessimista} motos`);
  
  // Cenário necessário para meta
  const crescimentoNecessario = Math.round((1000 - julhoData.acumulado) / 5);
  console.log(`🎯 Cenário meta: ${crescimentoNecessario} motos/mês necessários`);
  
  console.log('\n=== RECOMENDAÇÕES ===');
  if (baseParaProjecao >= 1000) {
    console.log('✅ Manter o ritmo atual de crescimento');
    console.log('✅ Implementar estratégias para sustentar o crescimento');
    console.log('✅ Monitorar métricas mensalmente');
  } else {
    console.log('⚠️ Acelerar estratégias de aquisição');
    console.log('⚠️ Revisar metas mensais');
    console.log('⚠️ Implementar campanhas de crescimento');
  }
  
  return {
    totalRegistros: dadosSimulados.totalRegistros,
    placasUnicas: acumulado,
    baseInicial: dadosSimulados.baseInicial,
    dadosMensais: dadosMensais,
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
    diferenca: baseParaProjecao - 1000
  };
}

// Simular análise específica baseada no sistema atual
function analisarSistemaAtual() {
  console.log('\n🔍 ANÁLISE DO SISTEMA ATUAL');
  console.log('='.repeat(40));
  
  // Dados baseados no que seria esperado em julho de 2025
  const baseAtualJulho = 555; // Estimativa baseada no padrão de crescimento
  const metaFinal = 1000;
  const mesAtual = 7; // Julho
  
  const mesesRestantes = 6; // Julho a dezembro
  const motasFaltantes = metaFinal - baseAtualJulho;
  const motasPorMes = Math.ceil(motasFaltantes / mesesRestantes);
  
  console.log(`Base atual (julho): ${baseAtualJulho} motos`);
  console.log(`Meta dezembro: ${metaFinal} motos`);
  console.log(`Faltam: ${motasFaltantes} motos`);
  console.log(`Necessário por mês: ${motasPorMes} motos`);
  console.log(`Crescimento mensal necessário: ${((motasPorMes / baseAtualJulho) * 100).toFixed(1)}%`);
  
  console.log('\n=== STATUS DA META ===');
  if (motasPorMes <= 75) {
    console.log('✅ META ATINGÍVEL - Crescimento necessário é viável');
  } else if (motasPorMes <= 100) {
    console.log('⚠️ META DESAFIADORA - Crescimento acelerado necessário');
  } else {
    console.log('❌ META DIFÍCIL - Crescimento muito acelerado necessário');
  }
  
  return {
    baseAtual: baseAtualJulho,
    metaFinal: metaFinal,
    motasFaltantes: motasFaltantes,
    motasPorMes: motasPorMes,
    viabilidade: motasPorMes <= 75 ? 'atingível' : motasPorMes <= 100 ? 'desafiadora' : 'difícil'
  };
}

// Executar análises
console.log('🚀 INICIANDO ANÁLISE COMPLETA DE CRESCIMENTO MAIO-JULHO');
console.log('='.repeat(70));

const resultadoSimulacao = simularAnaliseRealMaioJulho();
const analiseAtual = analisarSistemaAtual();

console.log('\n🎯 RESUMO EXECUTIVO');
console.log('='.repeat(30));
console.log(`Tendência maio-julho: ${resultadoSimulacao.tendencia}`);
console.log(`Projeção dezembro: ${resultadoSimulacao.projecaoFinal} motos`);
console.log(`Viabilidade da meta: ${analiseAtual.viabilidade}`);
console.log(`Ação recomendada: ${resultadoSimulacao.atingeMeta ? 'Manter ritmo' : 'Acelerar crescimento'}`);

console.log('\n✅ Análise concluída!');
console.log('Dados baseados em simulação do padrão de crescimento esperado.');