import type { Motorcycle } from '@/lib/types';
import { parseISO, isValid, getYear, getMonth, format, startOfMonth, endOfMonth, differenceInDays } from 'date-fns';

export interface FranchiseeRevenue {
  franqueadoName: string;
  totalRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  motorcycleCount: number;
  motorcycles: Motorcycle[];
  averageRevenuePerMoto: number;
  occupationRate: number;
  totalMotorcycles: number;
}

export interface FinancialKPI {
  totalWeeklyRevenue: number;
  totalMonthlyRevenue: number;
  averageRevenuePerFranchisee: number;
  totalRentedMotorcycles: number;
  financialOccupationRate: number;
  revenueGrowth: number;
  averageTicketPerMoto: number;
  receitaLiquidaPorMoto: number;
}

export interface MonthlyRevenueData {
  month: string;
  revenue: number;
  motorcycleCount: number;
  averageTicket: number;
}

export interface RevenueProjection {
  currentWeekly: number;
  projectedMonthly: number;
  projectedQuarterly: number;
  projectedYearly: number;
  optimisticMonthly: number;
  pessimisticMonthly: number;
}

// Função para calcular receita proporcional baseada no período de locação no mês
function calculateProportionalRevenue(
  moto: Motorcycle,
  modelAverages: Record<string, number>,
  targetYear?: number,
  targetMonth?: number
): number {
  const weeklyValue = getEstimatedWeeklyValue(moto, modelAverages);
  if (weeklyValue <= 0) return 0;

  // Se não há filtro de mês específico, retorna valor semanal completo
  if (!targetYear || !targetMonth) {
    return weeklyValue;
  }

  // Se não está alugada/relocada, não gera receita
  if (moto.status !== 'alugada' && moto.status !== 'relocada') {
    return 0;
  }

  // Para filtro por mês, retornar apenas o valor semanal
  // O valor semanal já representa a receita semanal da moto
  // Não devemos multiplicar por dias do mês
  return weeklyValue;
}

// Função para calcular média de valor semanal por modelo
function calculateAverageWeeklyValueByModel(motorcycles: Motorcycle[]): Record<string, number> {
  const modelValues: Record<string, { total: number; count: number }> = {};
  
  motorcycles.forEach(moto => {
    if (moto.model && moto.valorSemanal && moto.valorSemanal > 0) {
      const model = moto.model.trim().toLowerCase();
      if (!modelValues[model]) {
        modelValues[model] = { total: 0, count: 0 };
      }
      modelValues[model].total += moto.valorSemanal;
      modelValues[model].count += 1;
    }
  });

  const averages: Record<string, number> = {};
  Object.entries(modelValues).forEach(([model, data]) => {
    averages[model] = data.count > 0 ? data.total / data.count : 0;
  });

  return averages;
}

// Função para obter valor semanal estimado para uma moto
function getEstimatedWeeklyValue(moto: Motorcycle, modelAverages: Record<string, number>): number {
  // Se já tem valor semanal, usar o valor existente
  if (moto.valorSemanal && moto.valorSemanal > 0) {
    return moto.valorSemanal;
  }

  // Se não tem valor mas tem modelo, usar a média do modelo
  if (moto.model) {
    const modelKey = moto.model.trim().toLowerCase();
    const averageValue = modelAverages[modelKey];
    if (averageValue && averageValue > 0) {
      return averageValue;
    }
  }

  // Se não conseguir estimar, retornar 0
  return 0;
}

// Função principal para calcular receita por franqueado evitando duplicação
export function calculateFranchiseeRevenue(motorcycles: Motorcycle[], targetYear?: number, targetMonth?: number): FranchiseeRevenue[] {
  // 1. Calcular médias de valor semanal por modelo
  const modelAverages = calculateAverageWeeklyValueByModel(motorcycles);
  
  // 2. Agrupar por placa e pegar apenas o registro mais recente (data_ultima_mov)
  const uniqueMotorcyclesByPlaca: { [placa: string]: Motorcycle } = {};
  
  motorcycles.forEach(moto => {
    if (!moto.placa) return;
    
    const existingMoto = uniqueMotorcyclesByPlaca[moto.placa];
    
    if (!existingMoto) {
      uniqueMotorcyclesByPlaca[moto.placa] = moto;
    } else {
      const existingDateStr = existingMoto.data_ultima_mov;
      const currentDateStr = moto.data_ultima_mov;
      
      if (currentDateStr && existingDateStr) {
        if (new Date(currentDateStr) > new Date(existingDateStr)) {
          uniqueMotorcyclesByPlaca[moto.placa] = moto;
        }
      } else if (currentDateStr && !existingDateStr) {
        uniqueMotorcyclesByPlaca[moto.placa] = moto;
      }
    }
  });

  const representativeMotorcycles = Object.values(uniqueMotorcyclesByPlaca);

  // 3. Filtrar motos alugadas/relocadas
  const allRentedMotorcycles = representativeMotorcycles.filter(moto =>
    (moto.status === 'alugada' || moto.status === 'relocada') &&
    moto.franqueado &&
    moto.franqueado.trim() !== ''
  );

  // 4. Agrupar todas as motos alugadas/relocadas por franqueado
  const allRentedByFranchisee = allRentedMotorcycles.reduce((acc, moto) => {
    const franchisee = moto.franqueado!.trim();
    if (!acc[franchisee]) {
      acc[franchisee] = [];
    }
    acc[franchisee].push(moto);
    return acc;
  }, {} as Record<string, Motorcycle[]>);

  // 5. Calcular estatísticas por franqueado usando valores proporcionais
  const franchiseeRevenues: FranchiseeRevenue[] = Object.entries(allRentedByFranchisee).map(([name, allRentedMotos]) => {
    // Calcular receita total usando valores proporcionais ao período
    const totalWeeklyRevenue = allRentedMotos.reduce((sum: number, moto: Motorcycle) => {
      const proportionalValue = calculateProportionalRevenue(moto, modelAverages, targetYear, targetMonth);
      return sum + proportionalValue;
    }, 0);
    
    const monthlyRevenue = totalWeeklyRevenue * 4.33; // Conversão semanal para mensal
    const rentedMotorcycleCount = allRentedMotos.length; // Total de motos alugadas/relocadas
    
    // Contar quantas motos têm valor real vs estimado
    const motosWithRealValue = allRentedMotos.filter(moto => moto.valorSemanal && moto.valorSemanal > 0).length;
    const motosWithEstimatedValue = allRentedMotos.filter(moto => {
      const hasRealValue = moto.valorSemanal && moto.valorSemanal > 0;
      const hasEstimatedValue = !hasRealValue && getEstimatedWeeklyValue(moto, modelAverages) > 0;
      return hasEstimatedValue;
    }).length;
    
    const averageRevenuePerMoto = rentedMotorcycleCount > 0 ? totalWeeklyRevenue / rentedMotorcycleCount : 0;
    
    // Calcular total de motos do franqueado (para taxa de ocupação)
    const totalMotorcyclesForFranchisee = representativeMotorcycles.filter(
      moto => moto.franqueado?.trim() === name
    ).length;
    
    const occupationRate = totalMotorcyclesForFranchisee > 0 ?
      (rentedMotorcycleCount / totalMotorcyclesForFranchisee) * 100 : 0;

    return {
      franqueadoName: name,
      totalRevenue: totalWeeklyRevenue,
      weeklyRevenue: totalWeeklyRevenue,
      monthlyRevenue: monthlyRevenue,
      motorcycleCount: rentedMotorcycleCount, // Todas as motos alugadas/relocadas
      motorcycles: allRentedMotos, // Inclui todas as motos alugadas/relocadas
      averageRevenuePerMoto: averageRevenuePerMoto,
      occupationRate: occupationRate,
      totalMotorcycles: totalMotorcyclesForFranchisee
    };
  });

  // 7. Filtrar apenas franqueados que têm motos gerando receita e ordenar
  return franchiseeRevenues
    .filter(fr => fr.totalRevenue > 0) // Só mostra franqueados com receita
    .sort((a, b) => b.totalRevenue - a.totalRevenue);
}

// Função para calcular KPIs financeiros gerais
export function calculateFinancialKPIs(motorcycles: Motorcycle[], previousPeriodMotorcycles?: Motorcycle[], targetYear?: number, targetMonth?: number): FinancialKPI {
  const franchiseeRevenues = calculateFranchiseeRevenue(motorcycles, targetYear, targetMonth);
  
  const totalWeeklyRevenue = franchiseeRevenues.reduce((sum, fr) => sum + fr.totalRevenue, 0);
  const totalMonthlyRevenue = totalWeeklyRevenue * 4.33;
  const averageRevenuePerFranchisee = franchiseeRevenues.length > 0 ?
    totalWeeklyRevenue / franchiseeRevenues.length : 0;
  
  const totalRentedMotorcycles = franchiseeRevenues.reduce((sum, fr) => sum + fr.motorcycleCount, 0);
  
  // Calcular taxa de ocupação financeira (motos gerando receita vs total)
  const uniqueMotorcyclesByPlaca: { [placa: string]: Motorcycle } = {};
  motorcycles.forEach(moto => {
    if (!moto.placa) return;
    const existingMoto = uniqueMotorcyclesByPlaca[moto.placa];
    if (!existingMoto ||
        (moto.data_ultima_mov && existingMoto.data_ultima_mov &&
         new Date(moto.data_ultima_mov) > new Date(existingMoto.data_ultima_mov))) {
      uniqueMotorcyclesByPlaca[moto.placa] = moto;
    }
  });
  
  const totalUniqueMotorcycles = Object.values(uniqueMotorcyclesByPlaca).length;
  const financialOccupationRate = totalUniqueMotorcycles > 0 ?
    (totalRentedMotorcycles / totalUniqueMotorcycles) * 100 : 0;

  const averageTicketPerMoto = totalRentedMotorcycles > 0 ?
    totalWeeklyRevenue / totalRentedMotorcycles : 0;

  // Calcular crescimento da receita (se dados do período anterior estiverem disponíveis)
  let revenueGrowth = 0;
  if (previousPeriodMotorcycles) {
    const previousRevenues = calculateFranchiseeRevenue(previousPeriodMotorcycles, targetYear, targetMonth);
    const previousTotalRevenue = previousRevenues.reduce((sum, fr) => sum + fr.totalRevenue, 0);
    
    if (previousTotalRevenue > 0) {
      revenueGrowth = ((totalWeeklyRevenue - previousTotalRevenue) / previousTotalRevenue) * 100;
    }
  }

  // Calcular Receita Líquida por Moto usando a mesma lógica do DRE
  const receitaLiquidaPorMoto = calculateReceitaLiquidaPorMoto(motorcycles, targetYear, targetMonth);

  return {
    totalWeeklyRevenue,
    totalMonthlyRevenue,
    averageRevenuePerFranchisee,
    totalRentedMotorcycles,
    financialOccupationRate,
    revenueGrowth,
    averageTicketPerMoto,
    receitaLiquidaPorMoto
  };
}

// Função para análise temporal da receita
export function calculateMonthlyRevenueAnalysis(motorcycles: Motorcycle[], year: number): MonthlyRevenueData[] {
  const monthlyData: MonthlyRevenueData[] = [];
  const modelAverages = calculateAverageWeeklyValueByModel(motorcycles);
  
  for (let month = 0; month < 12; month++) {
    const targetMonth = month + 1;
    
    // Usar a mesma lógica de filtro da página principal
    const monthMotorcycles = motorcycles.filter(moto => {
      // Se não tem data de movimentação, incluir se está alugada/relocada
      if (!moto.data_ultima_mov) {
        return moto.status === 'alugada' || moto.status === 'relocada';
      }
      
      try {
        const motoDate = new Date(moto.data_ultima_mov);
        const motoYear = motoDate.getFullYear();
        const motoMonth = motoDate.getMonth() + 1;
        
        // Incluir motos que:
        // 1. Tiveram movimentação no mês/ano específico, OU
        // 2. Tiveram movimentação antes do mês/ano e estão alugadas/relocadas
        if (motoYear === year && motoMonth === targetMonth) {
          return true; // Movimentação no período específico
        } else if (motoYear < year || (motoYear === year && motoMonth < targetMonth)) {
          // Movimentação anterior ao período - incluir se está alugada/relocada
          return moto.status === 'alugada' || moto.status === 'relocada';
        }
        
        return false; // Movimentação posterior ao período
      } catch {
        return false;
      }
    });

    // Aplicar lógica de placa única para o mês
    const uniqueMotorcyclesByPlaca: { [placa: string]: Motorcycle } = {};
    monthMotorcycles.forEach(moto => {
      if (!moto.placa) return;
      const existingMoto = uniqueMotorcyclesByPlaca[moto.placa];
      if (!existingMoto ||
          (moto.data_ultima_mov && existingMoto.data_ultima_mov &&
           new Date(moto.data_ultima_mov) > new Date(existingMoto.data_ultima_mov))) {
        uniqueMotorcyclesByPlaca[moto.placa] = moto;
      }
    });

    const representativeMotorcycles = Object.values(uniqueMotorcyclesByPlaca);
    
    // Filtrar apenas motos alugadas/relocadas (mesma lógica dos KPIs)
    const rentedMotorcycles = representativeMotorcycles.filter(moto =>
      (moto.status === 'alugada' || moto.status === 'relocada') &&
      moto.franqueado &&
      moto.franqueado.trim() !== ''
    );
    
    // Calcular receita usando valores estimados quando necessário
    const monthlyRevenue = rentedMotorcycles.reduce((sum, moto) => {
      const estimatedValue = getEstimatedWeeklyValue(moto, modelAverages);
      return sum + estimatedValue;
    }, 0);
    
    const motorcycleCount = rentedMotorcycles.length;
    const averageTicket = motorcycleCount > 0 ? monthlyRevenue / motorcycleCount : 0;

    monthlyData.push({
      month: format(new Date(year, month), 'MMM'),
      revenue: monthlyRevenue,
      motorcycleCount: motorcycleCount,
      averageTicket: averageTicket
    });
  }

  return monthlyData;
}

// Função para projeção de receita
export function calculateRevenueProjection(motorcycles: Motorcycle[], targetYear?: number, targetMonth?: number): RevenueProjection {
  const kpis = calculateFinancialKPIs(motorcycles, undefined, targetYear, targetMonth);
  const currentWeekly = kpis.totalWeeklyRevenue;
  
  // Projeções baseadas na receita semanal atual
  const projectedMonthly = currentWeekly * 4.33;
  const projectedQuarterly = projectedMonthly * 3;
  const projectedYearly = projectedMonthly * 12;
  
  // Cenários otimista (+15%) e pessimista (-10%)
  const optimisticMonthly = projectedMonthly * 1.15;
  const pessimisticMonthly = projectedMonthly * 0.90;

  return {
    currentWeekly,
    projectedMonthly,
    projectedQuarterly,
    projectedYearly,
    optimisticMonthly,
    pessimisticMonthly
  };
}

// Função para análise de sazonalidade
export function calculateSeasonalAnalysis(motorcycles: Motorcycle[]): { month: string; averageRevenue: number; count: number }[] {
  const monthlyAverages = Array(12).fill(0).map(() => ({ total: 0, count: 0 }));
  
  motorcycles.forEach(moto => {
    if (!moto.data_ultima_mov || !moto.valorSemanal || 
        (moto.status !== 'alugada' && moto.status !== 'relocada')) return;
    
    try {
      const motoDate = parseISO(moto.data_ultima_mov);
      if (isValid(motoDate)) {
        const monthIndex = getMonth(motoDate);
        monthlyAverages[monthIndex].total += moto.valorSemanal;
        monthlyAverages[monthIndex].count += 1;
      }
    } catch {
      // Ignorar datas inválidas
    }
  });

  return monthlyAverages.map((data, index) => ({
    month: format(new Date(2024, index), 'MMM'),
    averageRevenue: data.count > 0 ? data.total / data.count : 0,
    count: data.count
  }));
}

// Função para identificar top performers
export function getTopPerformingFranchisees(motorcycles: Motorcycle[], limit: number = 5, targetYear?: number, targetMonth?: number): FranchiseeRevenue[] {
  const franchiseeRevenues = calculateFranchiseeRevenue(motorcycles, targetYear, targetMonth);
  return franchiseeRevenues.slice(0, limit);
}

// Função para análise de metas (assumindo meta de 91% de ocupação)
export function calculateGoalAnalysis(motorcycles: Motorcycle[], targetYear?: number, targetMonth?: number) {
  const franchiseeRevenues = calculateFranchiseeRevenue(motorcycles, targetYear, targetMonth);
  const occupationGoal = 91; // Meta de 91% como no franqueados
  
  const franchiseesAboveGoal = franchiseeRevenues.filter(fr => fr.occupationRate >= occupationGoal);
  const franchiseesBelowGoal = franchiseeRevenues.filter(fr => fr.occupationRate < occupationGoal);
  
  const averageOccupation = franchiseeRevenues.length > 0 ? 
    franchiseeRevenues.reduce((sum, fr) => sum + fr.occupationRate, 0) / franchiseeRevenues.length : 0;

  return {
    totalFranchisees: franchiseeRevenues.length,
    franchiseesAboveGoal: franchiseesAboveGoal.length,
    franchiseesBelowGoal: franchiseesBelowGoal.length,
    averageOccupation,
    goalAchievementRate: franchiseeRevenues.length > 0 ? 
      (franchiseesAboveGoal.length / franchiseeRevenues.length) * 100 : 0,
    topPerformers: franchiseesAboveGoal.slice(0, 3),
    needsImprovement: franchiseesBelowGoal.slice(0, 3)
  };
}

// Função para diagnosticar divergências entre dados financeiros e franqueados
export function diagnoseFranchiseeDiscrepancies(motorcycles: Motorcycle[], franchiseeName: string) {
  // 1. Calcular médias por modelo
  const modelAverages = calculateAverageWeeklyValueByModel(motorcycles);
  
  // 2. Agrupar por placa e pegar apenas o registro mais recente
  const uniqueMotorcyclesByPlaca: { [placa: string]: Motorcycle } = {};
  
  motorcycles.forEach(moto => {
    if (!moto.placa) return;
    
    const existingMoto = uniqueMotorcyclesByPlaca[moto.placa];
    
    if (!existingMoto) {
      uniqueMotorcyclesByPlaca[moto.placa] = moto;
    } else {
      const existingDateStr = existingMoto.data_ultima_mov;
      const currentDateStr = moto.data_ultima_mov;
      
      if (currentDateStr && existingDateStr) {
        if (new Date(currentDateStr) > new Date(existingDateStr)) {
          uniqueMotorcyclesByPlaca[moto.placa] = moto;
        }
      } else if (currentDateStr && !existingDateStr) {
        uniqueMotorcyclesByPlaca[moto.placa] = moto;
      }
    }
  });

  const representativeMotorcycles = Object.values(uniqueMotorcyclesByPlaca);

  // 3. Filtrar motos do franqueado específico
  const franchiseeMotorcycles = representativeMotorcycles.filter(
    moto => moto.franqueado?.trim() === franchiseeName
  );

  // 4. Categorizar as motos
  const rentedMotorcycles = franchiseeMotorcycles.filter(
    moto => moto.status === 'alugada' || moto.status === 'relocada'
  );

  const revenueGeneratingMotorcycles = rentedMotorcycles.filter(
    moto => moto.valorSemanal && moto.valorSemanal > 0
  );

  const rentedWithoutRevenue = rentedMotorcycles.filter(
    moto => !moto.valorSemanal || moto.valorSemanal <= 0
  );

  // 5. Calcular valores estimados
  const rentedWithEstimatedValue = rentedWithoutRevenue.filter(moto => {
    const estimatedValue = getEstimatedWeeklyValue(moto, modelAverages);
    return estimatedValue > 0;
  });

  const totalEstimatedRevenue = rentedMotorcycles.reduce((sum, moto) => {
    return sum + getEstimatedWeeklyValue(moto, modelAverages);
  }, 0);

  return {
    franchiseeName,
    totalMotorcycles: franchiseeMotorcycles.length,
    rentedMotorcycles: rentedMotorcycles.length,
    revenueGeneratingMotorcycles: revenueGeneratingMotorcycles.length,
    rentedWithoutRevenue: rentedWithoutRevenue.length,
    rentedWithEstimatedValue: rentedWithEstimatedValue.length,
    totalEstimatedRevenue: totalEstimatedRevenue,
    modelAverages: modelAverages,
    rentedWithoutRevenueDetails: rentedWithoutRevenue.map(moto => ({
      placa: moto.placa,
      status: moto.status,
      model: moto.model,
      valorSemanal: moto.valorSemanal,
      estimatedValue: getEstimatedWeeklyValue(moto, modelAverages),
      data_ultima_mov: moto.data_ultima_mov
    })),
    revenueGeneratingDetails: revenueGeneratingMotorcycles.map(moto => ({
      placa: moto.placa,
      status: moto.status,
      model: moto.model,
      valorSemanal: moto.valorSemanal,
      data_ultima_mov: moto.data_ultima_mov
    }))
  };
}

// Função para calcular receita de um mês específico usando a mesma lógica do DRE
export function calculateMonthlyRevenueForDRE(motorcycles: Motorcycle[], year: number, month: number, selectedFranchisee?: string): number {
  // Filtrar motos por mês (mesma lógica do DRE)
  const monthMotorcycles = motorcycles.filter(moto => {
    if (!moto.data_ultima_mov) {
      return moto.status === 'alugada' || moto.status === 'relocada';
    }
    
    try {
      const motoDate = new Date(moto.data_ultima_mov);
      const motoYear = motoDate.getFullYear();
      const motoMonth = motoDate.getMonth() + 1;
      
      if (motoYear === year && motoMonth === month) {
        return true;
      } else if (motoYear < year || (motoYear === year && motoMonth < month)) {
        return moto.status === 'alugada' || moto.status === 'relocada';
      }
      
      return false;
    } catch {
      return false;
    }
  });

  // Filtrar por franqueado se especificado
  let filteredMotorcycles = monthMotorcycles;
  if (selectedFranchisee && selectedFranchisee !== "all") {
    filteredMotorcycles = monthMotorcycles.filter(
      moto => moto.franqueado?.trim() === selectedFranchisee
    );
  }

  // Calcular receita do mês
  const franchiseeRevenues = calculateFranchiseeRevenue(filteredMotorcycles, year, month);
  return franchiseeRevenues.reduce((sum, fr) => sum + fr.weeklyRevenue, 0) * 4.33;
}

// Função para calcular Receita Líquida por Moto usando a mesma lógica do DRE
export function calculateReceitaLiquidaPorMoto(motorcycles: Motorcycle[], targetYear?: number, targetMonth?: number): number {
  const year = targetYear || new Date().getFullYear();
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  
  // Se um mês específico foi selecionado, calcular apenas para esse mês
  if (targetMonth) {
    return calculateMonthlyReceitaLiquidaPorMoto(motorcycles, year, targetMonth);
  }
  
  // Caso contrário, calcular a média anual (apenas meses realizados)
  const maxMonth = year === currentYear ? currentMonth : 12;
  let totalLucroLiquido = 0;
  let totalMotorcycles = 0;
  
  for (let month = 1; month <= maxMonth; month++) {
    const monthData = calculateMonthlyDREData(motorcycles, year, month);
    totalLucroLiquido += monthData.lucroLiquido;
    totalMotorcycles += monthData.motorcyclesInMonth;
  }
  
  return totalMotorcycles > 0 ? totalLucroLiquido / totalMotorcycles : 0;
}

// Função auxiliar para calcular dados do DRE de um mês específico
function calculateMonthlyDREData(motorcycles: Motorcycle[], year: number, month: number) {
  // Filtrar motos por mês (mesma lógica do DRE)
  const monthMotorcycles = motorcycles.filter(moto => {
    if (!moto.data_ultima_mov) {
      return moto.status === 'alugada' || moto.status === 'relocada';
    }
    
    try {
      const motoDate = new Date(moto.data_ultima_mov);
      const motoYear = motoDate.getFullYear();
      const motoMonth = motoDate.getMonth() + 1;
      
      if (motoYear === year && motoMonth === month) {
        return true;
      } else if (motoYear < year || (motoYear === year && motoMonth < month)) {
        return moto.status === 'alugada' || moto.status === 'relocada';
      }
      
      return false;
    } catch {
      return false;
    }
  });

  // Calcular receita do mês
  const franchiseeRevenues = calculateFranchiseeRevenue(monthMotorcycles, year, month);
  const receita = franchiseeRevenues.reduce((sum, fr) => sum + fr.weeklyRevenue, 0) * 4.33;

  // Contar motos alugadas e relocadas especificamente neste mês (para cálculo de caução)
  const rentedMotorcycles = monthMotorcycles.filter(moto => {
    if (moto.status !== 'alugada' || !moto.data_ultima_mov) return false;
    
    try {
      const motoDate = new Date(moto.data_ultima_mov);
      const motoYear = motoDate.getFullYear();
      const motoMonth = motoDate.getMonth() + 1;
      
      return motoYear === year && motoMonth === month;
    } catch {
      return false;
    }
  }).length;

  const relocatedMotorcycles = monthMotorcycles.filter(moto => {
    if (moto.status !== 'relocada' || !moto.data_ultima_mov) return false;
    
    try {
      const motoDate = new Date(moto.data_ultima_mov);
      const motoYear = motoDate.getFullYear();
      const motoMonth = motoDate.getMonth() + 1;
      
      return motoYear === year && motoMonth === month;
    } catch {
      return false;
    }
  }).length;

  // Verificar se há receita no mês
  const hasRevenue = receita > 0;

  // Contar placas únicas para evitar duplicatas
  const uniquePlates = new Set(monthMotorcycles.map(moto => moto.placa));
  const motorcyclesInMonth = uniquePlates.size;

  // Receitas Não Operacionais
  const caucao = (rentedMotorcycles * 700) + (relocatedMotorcycles * 400);
  const juros = hasRevenue ? Math.floor(motorcyclesInMonth / 10) * 212 : 0;
  const receitasNaoOperacionais = caucao + juros;

  // Tributos sobre Receitas
  const receitaTotal = receita + receitasNaoOperacionais;
  const simplesNacional = receitaTotal * 0.07;

  // Custos Operacionais (só cobrar se há receita)
  const seguroRastreador = hasRevenue ? motorcyclesInMonth * 139.90 : 0;
  const manutencao = 0;
  const taxaEspaco = hasRevenue ? motorcyclesInMonth * 250 : 0;
  const royalties = receita * 0.05;
  const ipvaTaxas = 0;
  const fundoMarketing = hasRevenue ? 300 : 0;
  const sistemaGestao = hasRevenue ? 80 : 0;
  const honorariosContabeis = hasRevenue ? 600 : 0;

  const custosOperacionais = seguroRastreador + manutencao + taxaEspaco + royalties +
                            ipvaTaxas + fundoMarketing + sistemaGestao + honorariosContabeis;

  const lucroLiquido = receitaTotal - simplesNacional - custosOperacionais;

  return {
    receita,
    receitasNaoOperacionais,
    receitaTotal,
    simplesNacional,
    custosOperacionais,
    lucroLiquido,
    motorcyclesInMonth
  };
}

// Função auxiliar para calcular receita líquida por moto de um mês específico
function calculateMonthlyReceitaLiquidaPorMoto(motorcycles: Motorcycle[], year: number, month: number): number {
  const monthData = calculateMonthlyDREData(motorcycles, year, month);
  return monthData.motorcyclesInMonth > 0 ? monthData.lucroLiquido / monthData.motorcyclesInMonth : 0;
}