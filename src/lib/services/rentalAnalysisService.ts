import { Motorcycle, ManutencaoData } from "@/lib/types";

export interface RentalPeriod {
  placa: string;
  startDate: string;
  endDate: string | null; // null se ainda estiver alugada/relocada
  status: 'alugada' | 'relocada';
  durationDays: number;
  maintenanceCount: number;
  maintenanceRecords: ManutencaoData[];
}

export interface RentalAnalysis {
  placa: string;
  modelo: string;
  periods: RentalPeriod[];
  totalDays: number;
  averageDays: number;
  totalPeriods: number;
  totalMaintenances: number;
  currentStatus: string;
  isCurrentlyRented: boolean;
}

export interface ModelRentalStats {
  modelo: string;
  totalMotorcycles: number;
  completedPeriods: number;
  totalDays: number;
  averageDays: number;
  totalMaintenances: number;
  averageMaintenancesPerPeriod: number;
}

/**
 * Calcula períodos de locação baseado no histórico de mudanças de status
 */
export function calculateRentalPeriods(
  motorcycles: Motorcycle[],
  maintenanceData: ManutencaoData[]
): RentalAnalysis[] {
  // Agrupar motos por placa
  const motorcyclesByPlaca = new Map<string, Motorcycle[]>();
  
  motorcycles.forEach(moto => {
    if (!moto.placa) return;
    
    if (!motorcyclesByPlaca.has(moto.placa)) {
      motorcyclesByPlaca.set(moto.placa, []);
    }
    motorcyclesByPlaca.get(moto.placa)!.push(moto);
  });

  const results: RentalAnalysis[] = [];

  // Processar cada placa
  motorcyclesByPlaca.forEach((motos, placa) => {
    // Ordenar por data_ultima_mov (mais antiga primeiro)
    const sortedMotos = motos
      .filter(m => m.data_ultima_mov)
      .sort((a, b) => new Date(a.data_ultima_mov!).getTime() - new Date(b.data_ultima_mov!).getTime());

    if (sortedMotos.length === 0) return;

    const periods: RentalPeriod[] = [];
    let currentRentalStart: { date: string; status: 'alugada' | 'relocada' } | null = null;

    // Analisar sequência de mudanças de status
    for (let i = 0; i < sortedMotos.length; i++) {
      const current = sortedMotos[i];
      const currentStatus = current.status;
      const currentDate = current.data_ultima_mov!;

      // Se está entrando em locação (alugada ou relocada)
      if ((currentStatus === 'alugada' || currentStatus === 'relocada') && !currentRentalStart) {
        currentRentalStart = { date: currentDate, status: currentStatus };
      }
      // Se está saindo de locação
      else if (currentRentalStart && currentStatus !== 'alugada' && currentStatus !== 'relocada') {
        const startDate = new Date(currentRentalStart.date);
        const endDate = new Date(currentDate);
        const durationDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

        // Buscar manutenções no período
        const maintenanceInPeriod = maintenanceData.filter(m => {
          if (m.veiculo_placa !== placa) return false;
          const maintenanceDate = new Date(m.data);
          return maintenanceDate >= startDate && maintenanceDate <= endDate;
        });

        periods.push({
          placa,
          startDate: currentRentalStart.date,
          endDate: currentDate,
          status: currentRentalStart.status,
          durationDays: Math.max(0, durationDays),
          maintenanceCount: maintenanceInPeriod.length,
          maintenanceRecords: maintenanceInPeriod
        });

        currentRentalStart = null;
      }
      // Se mudou de alugada para relocada ou vice-versa (continua locação)
      else if (currentRentalStart && 
               (currentStatus === 'alugada' || currentStatus === 'relocada') && 
               currentStatus !== currentRentalStart.status) {
        // Atualiza o status mas mantém a data de início
        currentRentalStart.status = currentStatus;
      }
    }

    // Se ainda está em locação (período aberto)
    if (currentRentalStart) {
      const startDate = new Date(currentRentalStart.date);
      const today = new Date();
      const durationDays = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      // Buscar manutenções no período até hoje
      const maintenanceInPeriod = maintenanceData.filter(m => {
        if (m.veiculo_placa !== placa) return false;
        const maintenanceDate = new Date(m.data);
        return maintenanceDate >= startDate && maintenanceDate <= today;
      });

      periods.push({
        placa,
        startDate: currentRentalStart.date,
        endDate: null,
        status: currentRentalStart.status,
        durationDays: Math.max(0, durationDays),
        maintenanceCount: maintenanceInPeriod.length,
        maintenanceRecords: maintenanceInPeriod
      });
    }

    // Calcular estatísticas
    const completedPeriods = periods.filter(p => p.endDate !== null);
    const totalDays = completedPeriods.reduce((sum, p) => sum + p.durationDays, 0);
    const averageDays = completedPeriods.length > 0 ? Math.round(totalDays / completedPeriods.length) : 0;
    const totalMaintenances = periods.reduce((sum, p) => sum + p.maintenanceCount, 0);
    
    const latestMoto = sortedMotos[sortedMotos.length - 1];
    const currentStatus = latestMoto.status || 'unknown';
    const isCurrentlyRented = currentStatus === 'alugada' || currentStatus === 'relocada';

    results.push({
      placa,
      modelo: latestMoto.model || 'Modelo não especificado',
      periods,
      totalDays,
      averageDays,
      totalPeriods: periods.length,
      totalMaintenances,
      currentStatus,
      isCurrentlyRented
    });
  });

  return results;
}

/**
 * Calcula estatísticas por modelo baseado nos períodos de locação
 */
export function calculateModelRentalStats(rentalAnalyses: RentalAnalysis[]): ModelRentalStats[] {
  const modelStats = new Map<string, {
    motorcycles: Set<string>;
    completedPeriods: number;
    totalDays: number;
    totalMaintenances: number;
  }>();

  rentalAnalyses.forEach(analysis => {
    const modelo = analysis.modelo;
    
    if (!modelStats.has(modelo)) {
      modelStats.set(modelo, {
        motorcycles: new Set(),
        completedPeriods: 0,
        totalDays: 0,
        totalMaintenances: 0
      });
    }

    const stats = modelStats.get(modelo)!;
    stats.motorcycles.add(analysis.placa);
    
    // Contar apenas períodos completos para o cálculo da média
    const completedPeriods = analysis.periods.filter(p => p.endDate !== null);
    stats.completedPeriods += completedPeriods.length;
    stats.totalDays += completedPeriods.reduce((sum, p) => sum + p.durationDays, 0);
    stats.totalMaintenances += analysis.totalMaintenances;
  });

  return Array.from(modelStats.entries()).map(([modelo, stats]) => ({
    modelo,
    totalMotorcycles: stats.motorcycles.size,
    completedPeriods: stats.completedPeriods,
    totalDays: stats.totalDays,
    averageDays: stats.completedPeriods > 0 ? Math.round(stats.totalDays / stats.completedPeriods) : 0,
    totalMaintenances: stats.totalMaintenances,
    averageMaintenancesPerPeriod: stats.completedPeriods > 0 
      ? Math.round((stats.totalMaintenances / stats.completedPeriods) * 100) / 100 
      : 0
  })).sort((a, b) => b.averageDays - a.averageDays);
}

/**
 * Formata período para exibição
 */
export function formatPeriod(period: RentalPeriod): string {
  const startDate = new Date(period.startDate).toLocaleDateString('pt-BR');
  const endDate = period.endDate 
    ? new Date(period.endDate).toLocaleDateString('pt-BR')
    : 'Em andamento';
  
  return `${startDate} - ${endDate}`;
}

/**
 * Calcula estatísticas gerais de todas as locações
 */
export function calculateOverallStats(rentalAnalyses: RentalAnalysis[]) {
  const allCompletedPeriods = rentalAnalyses.flatMap(a => 
    a.periods.filter(p => p.endDate !== null)
  );
  
  const totalDays = allCompletedPeriods.reduce((sum, p) => sum + p.durationDays, 0);
  const totalMaintenances = allCompletedPeriods.reduce((sum, p) => sum + p.maintenanceCount, 0);
  
  return {
    totalMotorcycles: rentalAnalyses.length,
    totalCompletedPeriods: allCompletedPeriods.length,
    averageDays: allCompletedPeriods.length > 0 ? Math.round(totalDays / allCompletedPeriods.length) : 0,
    totalMaintenances,
    averageMaintenancesPerPeriod: allCompletedPeriods.length > 0 
      ? Math.round((totalMaintenances / allCompletedPeriods.length) * 100) / 100 
      : 0,
    currentlyRented: rentalAnalyses.filter(a => a.isCurrentlyRented).length
  };
}