// Utilitário para normalizar nomes de modelos de motocicletas
// Usado para unificar variações de nomes de modelos na interface

/**
 * Normaliza nomes de modelos Shineray SHI para unificar variações
 * @param model - Nome do modelo original
 * @returns Nome do modelo normalizado
 */
export function normalizeShinerayModel(model: string): string {
  const trimmedModel = model.trim();
  
  // Unificar todos os modelos Shineray SHI 175 como SHINERAY SHI 175
  if (trimmedModel === 'SHINERAY SHI 175' ||
      trimmedModel === 'SHINERAY SHI 175 INJETADA' ||
      trimmedModel === 'SHINERAY SHI 175s EFI 2025' ||
      trimmedModel === 'SHINERAY SHI 175s EFI' ||
      trimmedModel === 'SHINERAY SHI 175 CARBURADA' ||
      trimmedModel === 'SHINERAY SHI 175 2024') {
    return 'SHINERAY SHI 175';
  }
  
  // Adicione aqui outras normalizações conforme necessário
  // Exemplo:
  // if (trimmedModel === 'HONDA CG 160' || trimmedModel === 'HONDA CG160') {
  //   return 'HONDA CG 160';
  // }
  
  return trimmedModel;
}

/**
 * Normaliza nomes de modelos Dafra para unificar variações
 * @param model - Nome do modelo original
 * @returns Nome do modelo normalizado
 */
export function normalizeDafraModel(model: string): string {
  const trimmedModel = model.trim();
  
  // Unificar modelos Dafra NH 190
  if (trimmedModel === 'DAFRA NH 190' ||
      trimmedModel === 'DAFRA NH190') {
    return 'DAFRA NH190';
  }
  
  return trimmedModel;
}

/**
 * Normaliza nomes de modelos Haojue para unificar variações
 * @param model - Nome do modelo original
 * @returns Nome do modelo normalizado
 */
export function normalizeHaojueModel(model: string): string {
  const trimmedModel = model.trim();
  
  // Unificar modelos Haojue DK160
  if (trimmedModel === 'HAOJUE DK160' ||
      trimmedModel === 'HAOJUE DK 160') {
    return 'HAOJUE DK160';
  }
  
  return trimmedModel;
}

/**
 * Normaliza qualquer nome de modelo (função principal)
 * @param model - Nome do modelo original
 * @returns Nome do modelo normalizado
 */
export function normalizeMotorcycleModel(model: string): string {
  if (!model) return '';
  
  // Aplicar normalizações específicas
  let normalizedModel = normalizeShinerayModel(model);
  normalizedModel = normalizeDafraModel(normalizedModel);
  normalizedModel = normalizeHaojueModel(normalizedModel);
  
  return normalizedModel;
}