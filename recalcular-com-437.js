// RECÁLCULO COM BASE CORRETA
console.log('=== RECÁLCULO COM BASE CORRETA ===');

// Base atual real
const baseAtual = 451; // Atualizado para 451 motos
const mesAtual = 7; // julho
const metaFinal = 1000;

console.log(`Base atual (placas únicas): ${baseAtual}`);
console.log(`Mês atual: ${mesAtual} (julho)`);
console.log(`Meta final: ${metaFinal}`);

// Cálculo do crescimento médio estimado
const crescimentoMedio = Math.round(baseAtual / mesAtual);

console.log('\n=== ESTIMATIVA LINEAR ATUAL ===');
console.log(`Crescimento médio estimado: ${crescimentoMedio} motos/mês`);

// Distribuição estimada baseada na lógica atual
const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'];
console.log('\nDistribuição estimada (lógica atual):');
for (let i = 1; i <= 7; i++) {
  const estimativa = crescimentoMedio * i;
  console.log(`${meses[i-1]}: ${estimativa} motos`);
}

// Cálculo da projeção para meta
const mesesRestantes = 6; // jul-dez
const motasFaltantes = metaFinal - baseAtual;
const motasPorMes = Math.ceil(motasFaltantes / mesesRestantes);

console.log('\n=== PROJEÇÃO PARA META ===');
console.log(`Motos faltantes: ${motasFaltantes}`);
console.log(`Meses restantes: ${mesesRestantes} (jul-dez)`);
console.log(`Motos por mês necessárias: ${motasPorMes}`);

// Projeção detalhada
console.log('\nProjeção jul-dez:');
let acumulado = baseAtual;
const projecao = ['Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
for (let i = 0; i < 6; i++) {
  if (i === 0) {
    console.log(`${projecao[i]}: ${acumulado} (atual)`);
  } else {
    acumulado += motasPorMes;
    console.log(`${projecao[i]}: ${Math.min(acumulado, metaFinal)} motos`);
  }
}

// Análise da diferença
console.log('\n=== ANÁLISE DA DIFERENÇA ===');
const diferencaBase = 451 - 437;
console.log(`Diferença da base: ${diferencaBase} motos a mais`);
console.log('Impacto na projeção:');
console.log(`- Menos motos necessárias por mês: ${Math.ceil((1000 - 451) / 6)} vs ${Math.ceil((1000 - 437) / 6)}`);
console.log(`- Meta mais próxima: ${1000 - 451} vs ${1000 - 437} motos faltantes`);
console.log('- Crescimento mensal real pode ser diferente da estimativa');

// Análise específica do problema do volume fixo
console.log('\n=== ANÁLISE DO PROBLEMA DO VOLUME FIXO ===');
console.log('O volume necessário para julho fica fixo em 92 porque:');
console.log('1. O cálculo usa: motasPorMes = Math.ceil((1000 - baseAtual) / 6)');
console.log('2. Com baseAtual = 451: motasPorMes = Math.ceil((1000 - 451) / 6)');
console.log(`3. motasPorMes = Math.ceil(549 / 6) = Math.ceil(91.5) = 92`);
console.log('4. Este valor é fixo para todos os meses de julho a dezembro');
console.log('5. Não considera o crescimento real mensal, apenas divide o total faltante');

console.log('\n=== PERGUNTAS IMPORTANTES ===');
console.log('1. Como essas 451 motos se distribuem por mês?');
console.log('2. Qual o crescimento real jan-jul?');
console.log('3. Há sazonalidade no crescimento?');
console.log('4. O crescimento está acelerando ou desacelerando?');
console.log('5. Por que o sistema não considera o crescimento real mensal?');