// Análise específica: crescimento de maio em diante
// Execute este código no console da página de projeção ou dashboard

function analisarCrescimentoMaioJulho(motorcycles) {
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const year = 2025;
  
  console.log('=== ANÁLISE: MAIO A JULHO 2025 ===');
  console.log('Total de registros:', motorcycles.length);
  
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
  
  console.log('Placas únicas encontradas:', earliestDateByPlaca.size);
  
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
  
  console.log('');
  console.log('=== CRESCIMENTO MENSAL 2025 ===');
  monthlyData.forEach((item, index) => {
    if (index <= 6) { // Jan a Jul
      const status = index >= 4 ? ' ⭐' : ''; // Destacar maio em diante
      console.log(`${item.month}: ${item.novas} novas → ${item.acumulado} total${status}`);
    }
  });
  
  // Foco em maio-julho
  const maioData = monthlyData[4]; // Maio
  const junhoData = monthlyData[5]; // Junho
  const julhoData = monthlyData[6]; // Julho
  
  console.log('');
  console.log('=== FOCO: MAIO A JULHO ===');
  console.log(`Maio: ${maioData.novas} novas (total: ${maioData.acumulado})`);
  console.log(`Junho: ${junhoData.novas} novas (total: ${junhoData.acumulado})`);
  console.log(`Julho: ${julhoData.novas} novas (total: ${julhoData.acumulado})`);
  
  const totalNovasMaioJulho = maioData.novas + junhoData.novas + julhoData.novas;
  const mediaMaioJulho = Math.round(totalNovasMaioJulho / 3);
  
  console.log('');
  console.log('=== ESTATÍSTICAS MAIO-JULHO ===');
  console.log('Total de novas motos:', totalNovasMaioJulho);
  console.log('Média mensal:', mediaMaioJulho);
  console.log('Crescimento por mês:', `Mai: ${maioData.novas}, Jun: ${junhoData.novas}, Jul: ${julhoData.novas}`);
  
  // Identificar tendência
  let tendencia = 'estável';
  if (junhoData.novas > maioData.novas && julhoData.novas > junhoData.novas) {
    tendencia = 'crescente';
  } else if (junhoData.novas < maioData.novas && julhoData.novas < junhoData.novas) {
    tendencia = 'decrescente';
  }
  
  console.log('Tendência:', tendencia);
  
  // Projeção baseada na tendência recente
  console.log('');
  console.log('=== PROJEÇÃO BASEADA EM MAIO-JULHO ===');
  
  let projecaoAgoDez = [];
  const mesesRestantes = ['Ago', 'Set', 'Out', 'Nov', 'Dez'];
  let baseParaProjecao = julhoData.acumulado;
  
  if (tendencia === 'crescente') {
    // Crescimento acelerado
    let incremento = julhoData.novas;
    mesesRestantes.forEach(mes => {
      incremento += 5; // Acelerar crescimento
      baseParaProjecao += incremento;
      projecaoAgoDez.push(`${mes}: +${incremento} → ${baseParaProjecao} total`);
    });
  } else if (tendencia === 'decrescente') {
    // Crescimento desacelerado
    let incremento = julhoData.novas;
    mesesRestantes.forEach(mes => {
      incremento = Math.max(10, incremento - 5); // Não deixar muito baixo
      baseParaProjecao += incremento;
      projecaoAgoDez.push(`${mes}: +${incremento} → ${baseParaProjecao} total`);
    });
  } else {
    // Crescimento estável
    const incremento = mediaMaioJulho;
    mesesRestantes.forEach(mes => {
      baseParaProjecao += incremento;
      projecaoAgoDez.push(`${mes}: +${incremento} → ${baseParaProjecao} total`);
    });
  }
  
  projecaoAgoDez.forEach(linha => console.log(linha));
  
  console.log('');
  console.log('=== CONCLUSÃO ===');
  console.log(`Projeção para dezembro: ${baseParaProjecao} motos`);
  console.log(`Meta (1000): ${baseParaProjecao >= 1000 ? 'ATINGÍVEL' : 'DIFÍCIL'}`);
  console.log(`Diferença: ${1000 - baseParaProjecao > 0 ? '+' : ''}${1000 - baseParaProjecao} motos`);
  
  return {
    maioJulho: { maio: maioData.novas, junho: junhoData.novas, julho: julhoData.novas },
    tendencia: tendencia,
    projecaoFinal: baseParaProjecao,
    atingeMeta: baseParaProjecao >= 1000
  };
}

// Instruções de uso:
console.log('=== INSTRUÇÕES ===');
console.log('1. Copie este código');
console.log('2. Vá para a página de projeção ou dashboard');
console.log('3. Abra o console (F12)');
console.log('4. Execute: analisarCrescimentoMaioJulho(motorcycles)');
console.log('');
console.log('Ou execute diretamente se os dados estiverem disponíveis:');
console.log('analisarCrescimentoMaioJulho(motorcycles);');