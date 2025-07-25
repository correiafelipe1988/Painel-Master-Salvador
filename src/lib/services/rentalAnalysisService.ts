import { Motorcycle, ManutencaoData } from "@/lib/types";
import { normalizeMotorcycleModel } from "@/lib/utils/modelNormalizer";

/**
 * Calcula a diferença em dias entre duas datas incluindo ambos os dias (início e fim)
 * Adiciona 1 dia para incluir o dia final no período
 */
function calculateDaysDifference(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir o dia final
  return Math.max(0, diffDays);
}

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
 * Calcula períodos de locação baseado nos dados disponíveis
 * ESTRATÉGIA ALTERNATIVA: Como não há histórico múltiplo, calcula baseado no tempo atual de locação
 */
export function calculateRentalPeriods(
  motorcycles: Motorcycle[],
  maintenanceData: ManutencaoData[]
): RentalAnalysis[] {
  console.log('🔍 Iniciando análise de períodos de locação (estratégia alternativa)...');
  console.log(`📊 Total de registros de motos: ${motorcycles.length}`);
  console.log(`🔧 Total de registros de manutenção: ${maintenanceData.length}`);

  // Verificar se há múltiplos registros por placa (confirmar estrutura de dados)
  const motorcyclesByPlaca = new Map<string, Motorcycle[]>();
  
  motorcycles.forEach(moto => {
    if (!moto.placa) return;
    
    if (!motorcyclesByPlaca.has(moto.placa)) {
      motorcyclesByPlaca.set(moto.placa, []);
    }
    motorcyclesByPlaca.get(moto.placa)!.push(moto);
  });

  console.log(`🏍️ Placas únicas encontradas: ${motorcyclesByPlaca.size}`);
  
  // Verificar estrutura de dados
  let hasMultipleRecordsPerPlate = false;
  motorcyclesByPlaca.forEach((motos, placa) => {
    if (motos.length > 1) {
      hasMultipleRecordsPerPlate = true;
      console.log(`📝 Placa ${placa} tem ${motos.length} registros históricos`);
    }
  });

  const results: RentalAnalysis[] = [];
  let totalPeriodsFound = 0;
  let totalCompletedPeriods = 0;

  if (hasMultipleRecordsPerPlate) {
    console.log('✅ Encontrado histórico múltiplo - usando análise de transições');
    
    // Lógica original para dados com histórico
    motorcyclesByPlaca.forEach((motos, placa) => {
      const sortedMotos = motos
        .filter(m => m.data_ultima_mov)
        .sort((a, b) => new Date(a.data_ultima_mov!).getTime() - new Date(b.data_ultima_mov!).getTime());

      if (sortedMotos.length <= 1) return;

      const periods: RentalPeriod[] = [];
      
      // Analisar transições sequenciais
      for (let i = 0; i < sortedMotos.length - 1; i++) {
        const current = sortedMotos[i];
        const next = sortedMotos[i + 1];
        
        if (current.status === 'alugada' || current.status === 'relocada') {
          const startDateObj = new Date(current.data_ultima_mov!);
          const endDateObj = new Date(next.data_ultima_mov!);
          const durationDays = calculateDaysDifference(current.data_ultima_mov!, next.data_ultima_mov!);

          const maintenanceInPeriod = maintenanceData.filter(m => {
            if (m.veiculo_placa !== placa) return false;
            const maintenanceDate = new Date(m.data);
            return maintenanceDate >= startDateObj && maintenanceDate <= endDateObj;
          });

          periods.push({
            placa,
            startDate: current.data_ultima_mov!,
            endDate: next.data_ultima_mov!,
            status: current.status,
            durationDays: durationDays,
            maintenanceCount: maintenanceInPeriod.length,
            maintenanceRecords: maintenanceInPeriod
          });

          totalCompletedPeriods++;
          console.log(`    ✅ Período histórico: ${current.data_ultima_mov} → ${next.data_ultima_mov} (${durationDays} dias)`);
        }
      }

      if (periods.length > 0) {
        const latestMoto = sortedMotos[sortedMotos.length - 1];
        const completedPeriods = periods.filter(p => p.endDate !== null);
        const totalDays = completedPeriods.reduce((sum, p) => sum + p.durationDays, 0);
        
        results.push({
          placa,
          modelo: normalizeMotorcycleModel(latestMoto.model || 'Modelo não especificado'),
          periods,
          totalDays,
          averageDays: completedPeriods.length > 0 ? Math.round(totalDays / completedPeriods.length) : 0,
          totalPeriods: periods.length,
          totalMaintenances: periods.reduce((sum, p) => sum + p.maintenanceCount, 0),
          currentStatus: latestMoto.status || 'unknown',
          isCurrentlyRented: latestMoto.status === 'alugada' || latestMoto.status === 'relocada'
        });
      }
    });
  } else {
    console.log('⚠️ Sem histórico múltiplo - usando estratégia alternativa baseada em tempo atual');
    
    // Nova estratégia: calcular baseado no tempo atual de locação + estimativas da manutenção
    motorcyclesByPlaca.forEach((motos, placa) => {
      const moto = motos[0]; // Único registro por placa
      
      if (!moto.data_ultima_mov) return;

      const currentStatus = moto.status;
      const lastMovementDate = new Date(moto.data_ultima_mov);
      const today = new Date();
      const daysSinceLastMovement = Math.ceil((today.getTime() - lastMovementDate.getTime()) / (1000 * 60 * 60 * 24));

      const periods: RentalPeriod[] = [];

      // Se está atualmente alugada/relocada, criar período em andamento
      if (currentStatus === 'alugada' || currentStatus === 'relocada') {
        const maintenanceInPeriod = maintenanceData.filter(m => {
          if (m.veiculo_placa !== placa) return false;
          const maintenanceDate = new Date(m.data);
          return maintenanceDate >= lastMovementDate && maintenanceDate <= today;
        });

        periods.push({
          placa,
          startDate: moto.data_ultima_mov,
          endDate: null, // Em andamento
          status: currentStatus,
          durationDays: Math.max(0, daysSinceLastMovement),
          maintenanceCount: maintenanceInPeriod.length,
          maintenanceRecords: maintenanceInPeriod
        });

        totalPeriodsFound++;
        console.log(`    🔄 Período atual: ${moto.data_ultima_mov} → hoje (${daysSinceLastMovement} dias, status: ${currentStatus})`);
      }
      // Se não está alugada/relocada, simular um período completo baseado nas manutenções
      else {
        // Buscar manutenções desta placa para estimar períodos passados
        const plateMaintenances = maintenanceData.filter(m => m.veiculo_placa === placa);
        
        if (plateMaintenances.length > 0) {
          // Criar períodos estimados baseados nas datas das manutenções
          plateMaintenances.forEach(maintenance => {
            const maintenanceDate = new Date(maintenance.data);
            // Estimar que a moto estava alugada por 30 dias antes da manutenção
            const estimatedStartDate = new Date(maintenanceDate);
            estimatedStartDate.setDate(estimatedStartDate.getDate() - 30);
            
            periods.push({
              placa,
              startDate: estimatedStartDate.toISOString().split('T')[0],
              endDate: maintenance.data,
              status: 'alugada', // Assumir que estava alugada
              durationDays: 30, // Período estimado
              maintenanceCount: 1,
              maintenanceRecords: [maintenance]
            });

            totalCompletedPeriods++;
            console.log(`    📊 Período estimado (manutenção): ${estimatedStartDate.toISOString().split('T')[0]} → ${maintenance.data} (30 dias estimados)`);
          });
        }
        
        // Se tem tempo ocioso registrado, usar para estimar período anterior
        if (moto.tempo_ocioso_dias && moto.tempo_ocioso_dias > 0) {
          const estimatedRentalEnd = new Date(lastMovementDate);
          const estimatedRentalStart = new Date(lastMovementDate);
          estimatedRentalStart.setDate(estimatedRentalStart.getDate() - 30); // Estimar 30 dias de locação

          periods.push({
            placa,
            startDate: estimatedRentalStart.toISOString().split('T')[0],
            endDate: moto.data_ultima_mov,
            status: 'alugada',
            durationDays: 30,
            maintenanceCount: 0,
            maintenanceRecords: []
          });

          totalCompletedPeriods++;
          console.log(`    💡 Período estimado (tempo ocioso): 30 dias antes de ${moto.data_ultima_mov}`);
        }
      }

      if (periods.length > 0) {
        const completedPeriods = periods.filter(p => p.endDate !== null);
        const totalDays = completedPeriods.reduce((sum, p) => sum + p.durationDays, 0);
        
        results.push({
          placa,
          modelo: normalizeMotorcycleModel(moto.model || 'Modelo não especificado'),
          periods,
          totalDays,
          averageDays: completedPeriods.length > 0 ? Math.round(totalDays / completedPeriods.length) : 0,
          totalPeriods: periods.length,
          totalMaintenances: periods.reduce((sum, p) => sum + p.maintenanceCount, 0),
          currentStatus: currentStatus || 'unknown',
          isCurrentlyRented: currentStatus === 'alugada' || currentStatus === 'relocada'
        });

        totalPeriodsFound += periods.length;
      }
    });
  }

  console.log(`\n🎯 Análise concluída:`);
  console.log(`   • Motos com períodos: ${results.length}`);
  console.log(`   • Total de períodos encontrados: ${totalPeriodsFound}`);
  console.log(`   • Períodos completos: ${totalCompletedPeriods}`);
  console.log(`   • Estratégia: ${hasMultipleRecordsPerPlate ? 'Histórico real' : 'Estimativa baseada em dados disponíveis'}`);

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
 * Formata período para exibição usando UTC para consistência com gestão de motos
 */
export function formatPeriod(period: RentalPeriod): string {
  const startDate = new Date(period.startDate + 'T00:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  const endDate = period.endDate 
    ? new Date(period.endDate + 'T00:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'UTC' })
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