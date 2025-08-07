/**
 * Script para normalizar e padronizar as causas de distratos
 * Mapeia causas originais para os 15 grupos sugeridos
 */

const mapeamentoCausas = {
  // Grupo 1: Inadimplência/Financeiro
  "inadimplência": "Inadimplência/Financeiro",
  "sem condições financeiras": "Inadimplência/Financeiro", 
  "sublocação do veículo e inadimplência": "Inadimplência/Financeiro",
  "não pagamento de manutenção corretiva": "Inadimplência/Financeiro",
  "pendência financeira": "Inadimplência/Financeiro",
  "ausência de retorno": "Inadimplência/Financeiro", // geralmente relacionado à inadimplência
  
  // Grupo 2: Questões Pessoais do Cliente  
  "motivos pessoais": "Questões Pessoais do Cliente",
  
  // Grupo 3: Problemas Administrativos
  "sem informações": "Problemas Administrativos",
  "Sem informações": "Problemas Administrativos",
  
  // Grupo 4: Desistência do Cliente
  "não adaptação ao modelo da motocicleta": "Desistência do Cliente",
  "Desistencia": "Desistência do Cliente",
  
  // Grupo 5: Problemas Operacionais  
  "Desistência": "Problemas Operacionais",
  "Liberação de placa": "Problemas Operacionais",
  "Liberação de placa/desistência": "Problemas Operacionais",
  
  // Grupo 6: Mudança de Negócio
  "TROCA de moto": "Mudança de Negócio",
  "TROCA DE MOTO": "Mudança de Negócio", 
  "TROCA De MOTO": "Mudança de Negócio",
  "troca de moto": "Mudança de Negócio",
  "substituição de moto": "Mudança de Negócio",
  "mudança de contrato para fidelidade": "Mudança de Negócio",
  
  // Grupo 7: Problemas Mecânicos/Manutenção
  "moto reserva": "Problemas Mecânicos/Manutenção",
  "está com a moto reserva": "Problemas Mecânicos/Manutenção", 
  "utilização de moto reserva de outra franquia": "Problemas Mecânicos/Manutenção",
  "falhas técnicas na motocicleta": "Problemas Mecânicos/Manutenção",
  "manutenção": "Problemas Mecânicos/Manutenção",
  
  // Grupo 8: Relacionamento Comercial
  "insatisfação do cliente": "Performance Insatisfatória",
  
  // Grupo 9: Questões Legais/Regulatórias  
  "CNH suspensa": "Questões Legais/Regulatórias",
  "uso indevido da motocicleta": "Questões Legais/Regulatórias",
  
  // Grupo 10: Questões de Saúde/Acidente
  "acidente": "Questões de Saúde/Acidente",
  
  // Grupo 11: Fatores Externos
  "Locatário vai viajar para fora do estado": "Fatores Externos",
  
  // Grupo 12: Problemas Contratuais
  "encerrado em comum acordo entre as partes": "Problemas Contratuais",
  "decorrência do cumprimento integral do prazo": "Problemas Contratuais",
  
  // Grupo 13: Outros/Diversos
  "uso em carater de reserva": "Outros/Diversos",
  "FIM CONTRATO": "Outros/Diversos", 
  "Alteração": "Outros/Diversos",
  "devolução": "Outros/Diversos"
};

/**
 * Função para normalizar uma causa individual
 * @param {string} causaOriginal - A causa original do distrato
 * @returns {string} - O grupo normalizado
 */
function normalizarCausa(causaOriginal) {
  const causa = causaOriginal?.trim();
  
  if (!causa) {
    return "Problemas Administrativos"; // Para casos vazios
  }
  
  // Busca mapeamento direto
  if (mapeamentoCausas[causa]) {
    return mapeamentoCausas[causa];
  }
  
  // Busca por palavras-chave para casos não mapeados
  const causaLower = causa.toLowerCase();
  
  if (causaLower.includes('inadimpl') || causaLower.includes('financ')) {
    return "Inadimplência/Financeiro";
  }
  
  if (causaLower.includes('pessoal')) {
    return "Questões Pessoais do Cliente";
  }
  
  if (causaLower.includes('troca') || causaLower.includes('substitui')) {
    return "Mudança de Negócio"; 
  }
  
  if (causaLower.includes('desist') || causaLower.includes('abandon')) {
    return "Desistência do Cliente";
  }
  
  if (causaLower.includes('manut') || causaLower.includes('reserva') || causaLower.includes('técnic')) {
    return "Problemas Mecânicos/Manutenção";
  }
  
  if (causaLower.includes('acidente') || causaLower.includes('saúde')) {
    return "Questões de Saúde/Acidente";
  }
  
  if (causaLower.includes('cnh') || causaLower.includes('legal') || causaLower.includes('indevido')) {
    return "Questões Legais/Regulatórias";
  }
  
  // Caso não encontre correspondência, classifica como "Outros"
  console.warn(`Causa não mapeada: "${causa}" - classificada como Outros/Diversos`);
  return "Outros/Diversos";
}

/**
 * Função para processar um lote de distratos e normalizar as causas
 * @param {Array} distratos - Array de objetos distrato
 * @returns {Array} - Array com causas normalizadas
 */
function processarLoteDistratos(distratos) {
  return distratos.map(distrato => ({
    ...distrato,
    causaNormalizada: normalizarCausa(distrato.causa),
    causaOriginal: distrato.causa // Mantém a causa original para histórico
  }));
}

/**
 * Função para gerar estatísticas das causas normalizadas
 * @param {Array} distratos - Array de distratos processados
 * @returns {Object} - Estatísticas agrupadas
 */
function gerarEstatisticasCausas(distratos) {
  const estatisticas = {};
  const total = distratos.length;
  
  distratos.forEach(distrato => {
    const grupo = distrato.causaNormalizada;
    if (!estatisticas[grupo]) {
      estatisticas[grupo] = {
        total: 0,
        causasOriginais: {},
        percentual: 0
      };
    }
    
    estatisticas[grupo].total++;
    
    const causaOriginal = distrato.causaOriginal;
    if (!estatisticas[grupo].causasOriginais[causaOriginal]) {
      estatisticas[grupo].causasOriginais[causaOriginal] = 0;
    }
    estatisticas[grupo].causasOriginais[causaOriginal]++;
  });
  
  // Calcular percentuais
  Object.keys(estatisticas).forEach(grupo => {
    estatisticas[grupo].percentual = ((estatisticas[grupo].total / total) * 100).toFixed(1);
  });
  
  return {
    totalRegistros: total,
    estatisticasPorGrupo: estatisticas,
    ranking: Object.entries(estatisticas)
      .sort(([,a], [,b]) => b.total - a.total)
      .map(([grupo, dados]) => ({
        grupo,
        total: dados.total,
        percentual: dados.percentual
      }))
  };
}

// Exporta as funções para uso
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    mapeamentoCausas,
    normalizarCausa,
    processarLoteDistratos,
    gerarEstatisticasCausas
  };
}

// Para uso no browser
if (typeof window !== 'undefined') {
  window.DistratoUtils = {
    mapeamentoCausas,
    normalizarCausa,
    processarLoteDistratos,
    gerarEstatisticasCausas
  };
}

console.log('📊 Script de normalização de causas de distratos carregado com sucesso!');
console.log(`🎯 ${Object.keys(mapeamentoCausas).length} causas mapeadas para 15 grupos sugeridos`);