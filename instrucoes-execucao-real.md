# 🚀 INSTRUÇÕES PARA EXECUTAR ANÁLISE MAIO-JULHO NO SISTEMA REAL

## 📋 Pré-requisitos

1. **Servidor em execução**: O sistema deve estar rodando em `http://localhost:9002`
2. **Dados do Firebase**: Acesso às motos cadastradas no Firestore
3. **Navegador**: Chrome, Firefox ou Safari com console de desenvolvedor

## 🎯 Passos para Execução

### 1. Acessar a Página de Projeção
```
http://localhost:9002/projecao-motos
```

### 2. Aguardar Carregamento dos Dados
- Aguarde a página carregar completamente
- Verifique se os dados das motos estão sendo exibidos
- Os gráficos e cards devem mostrar informações atualizadas

### 3. Abrir Console do Navegador
- Pressione **F12** (ou **Cmd+Option+I** no Mac)
- Vá para a aba **Console**
- Certifique-se de que não há erros críticos

### 4. Executar o Código de Análise
Copie e cole o seguinte código no console:

```javascript
// Análise específica: crescimento de maio em diante
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

// Executar análise com os dados carregados
// Tentar acessar dados do contexto da página
try {
  // Aguardar um pouco para garantir que os dados estão carregados
  setTimeout(() => {
    // Tentar diferentes formas de acessar os dados
    let motorcycles = null;
    
    // Método 1: Verificar se há dados globais
    if (typeof window.motorcycles !== 'undefined') {
      motorcycles = window.motorcycles;
    }
    
    // Método 2: Verificar no React DevTools
    if (!motorcycles) {
      const reactRoot = document.querySelector('#__next');
      if (reactRoot && reactRoot._reactInternalFiber) {
        console.log('Buscando dados no React...');
        // Implementação específica dependeria da estrutura do React
      }
    }
    
    // Método 3: Executar análise se dados encontrados
    if (motorcycles && motorcycles.length > 0) {
      console.log('✅ Dados encontrados! Executando análise...');
      const resultado = analisarCrescimentoMaioJulho(motorcycles);
      console.log('📊 Análise concluída:', resultado);
    } else {
      console.log('⚠️ Dados não encontrados automaticamente.');
      console.log('📋 Execute manualmente: analisarCrescimentoMaioJulho(motorcycles)');
      console.log('📋 Onde "motorcycles" são os dados carregados da página');
    }
  }, 2000);
} catch (error) {
  console.error('❌ Erro ao executar análise:', error);
  console.log('📋 Tente executar manualmente: analisarCrescimentoMaioJulho(motorcycles)');
}
```

### 5. Executar Análise Manual (se necessário)
Se a execução automática não funcionar, execute manualmente:

```javascript
// Primeiro, identifique os dados das motos na página
// Eles podem estar em diferentes variáveis dependendo do contexto

// Exemplo de execução manual:
analisarCrescimentoMaioJulho(motorcycles);
```

## 📊 Resultados Esperados

A análise deve retornar:

1. **Crescimento Mensal**: Quantas placas únicas foram inseridas em cada mês
2. **Foco Maio-Julho**: Dados específicos dos três meses
3. **Tendência**: Crescente, decrescente ou estável
4. **Projeção**: Estimativa para agosto-dezembro
5. **Viabilidade**: Se a meta de 1000 motos é atingível

## 🔧 Solução de Problemas

### Erro: "motorcycles is not defined"
```javascript
// Verificar se os dados estão em outra variável
console.log(window); // Listar variáveis globais
// ou
console.log(Object.keys(window)); // Listar chaves do objeto window
```

### Erro: Dados não carregados
- Aguarde mais tempo para o carregamento
- Verifique se há erros de conexão com o Firebase
- Recarregue a página e tente novamente

### Erro: Permissões do Firebase
- Verifique se o usuário está autenticado
- Confirme as regras de segurança do Firestore
- Tente acessar em uma aba anônima

## 📋 Arquivo de Referência

O código completo está disponível em:
`/Users/felipecorreia/Downloads/Painel-Master-Salvador-master/analise-maio-julho.js`

## 🎯 Próximos Passos

1. Execute a análise com dados reais
2. Compare com as projeções simuladas
3. Documente os resultados reais
4. Ajuste as estratégias conforme necessário
5. Agende análises mensais regulares

---

**Nota**: Este documento fornece as instruções para executar a análise no sistema real. Os resultados podem variar dependendo dos dados reais no banco de dados do Firebase.