// Script para executar análise de crescimento maio-julho no contexto real
const { execSync } = require('child_process');
const puppeteer = require('puppeteer');

async function executeAnalysisOnRealPage() {
  try {
    console.log('🚀 Iniciando análise de crescimento maio-julho...');
    
    // Verificar se o servidor está rodando
    console.log('📡 Verificando se o servidor está ativo...');
    
    const browser = await puppeteer.launch({ 
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Navegar para a página de projeção
    console.log('🌐 Navegando para a página de projeção...');
    await page.goto('http://localhost:9002/projecao-motos', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Aguardar os dados carregarem
    console.log('⏳ Aguardando dados carregarem...');
    await page.waitForTimeout(5000);
    
    // Executar a análise maio-julho
    console.log('📊 Executando análise maio-julho...');
    
    const resultado = await page.evaluate(() => {
      // Código de análise maio-julho
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
      
      // Tentar acessar os dados das motos
      try {
        // Verificar se os dados estão disponíveis no contexto global
        if (typeof window !== 'undefined' && window.motorcycles) {
          return analisarCrescimentoMaioJulho(window.motorcycles);
        }
        
        // Tentar acessar via React DevTools ou contexto do componente
        const reactRoot = document.querySelector('#__next');
        if (reactRoot && reactRoot._reactInternalInstance) {
          // Procurar dados no estado do React
          // Esta é uma implementação simplificada
          console.log('Procurando dados no React...');
        }
        
        // Fallback: simular execução com dados de exemplo
        console.log('⚠️ Dados reais não encontrados, usando análise baseada na estrutura atual');
        
        // Retornar resultado indicando que precisa de acesso aos dados reais
        return {
          erro: 'Dados reais não acessíveis via JavaScript',
          mensagem: 'É necessário executar a análise diretamente no contexto da aplicação React'
        };
        
      } catch (error) {
        return {
          erro: error.message,
          tipo: 'Erro de execução'
        };
      }
    });
    
    console.log('📋 Resultado da análise:', resultado);
    
    await browser.close();
    
    return resultado;
    
  } catch (error) {
    console.error('❌ Erro durante a análise:', error.message);
    return { erro: error.message };
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  executeAnalysisOnRealPage()
    .then(resultado => {
      console.log('\n=== RESULTADO FINAL ===');
      console.log(JSON.stringify(resultado, null, 2));
    })
    .catch(error => {
      console.error('Erro:', error);
    });
}

module.exports = { executeAnalysisOnRealPage };