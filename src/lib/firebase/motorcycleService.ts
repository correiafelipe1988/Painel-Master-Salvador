
// src/lib/firebase/motorcycleService.ts
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  writeBatch,
  Timestamp,
  orderBy,
  getDocs,
  getDoc,
} from 'firebase/firestore';
import { db } from './config';
import type { Motorcycle, MotorcycleStatus } from '@/lib/types';
import { differenceInCalendarDays, parseISO, isValid as dateIsValid } from 'date-fns';

const motorcyclesCollectionRef = collection(db, 'motorcycles');

// Helper function to remove undefined fields from an object
function cleanDataForFirestore<T extends object>(data: T): Partial<T> {
  const cleaned = { ...data }; // Create a shallow copy to modify
  for (const key in cleaned) {
    if (cleaned[key as keyof T] === undefined) {
      delete cleaned[key as keyof T];
    }
  }
  return cleaned;
}

const fromFirestore = (docData: any): Omit<Motorcycle, 'id'> => {
  const data = { ...docData };
  if (data.data_ultima_mov && data.data_ultima_mov instanceof Timestamp) {
    data.data_ultima_mov = data.data_ultima_mov.toDate().toISOString().split('T')[0];
  }
  
  if (data.valorSemanal !== undefined && data.valorSemanal !== null) {
    data.valorSemanal = Number(data.valorSemanal);
  } else {
    delete data.valorSemanal; // Ensure it's not present if null/undefined from DB
  }
  if (data.tempo_ocioso_dias !== undefined && data.tempo_ocioso_dias !== null) {
    data.tempo_ocioso_dias = Number(data.tempo_ocioso_dias);
  } else {
    delete data.tempo_ocioso_dias; // Ensure it's not present
  }

  const allowedStatus: MotorcycleStatus[] = ['active', 'inadimplente', 'recolhida', 'relocada', 'manutencao', 'alugada', 'indisponivel_rastreador', 'indisponivel_emplacamento'];
  if (data.status && !allowedStatus.includes(data.status)) {
    console.warn(`Invalid status "${data.status}" from Firestore for doc, defaulting to 'alugada'.`);
    data.status = 'alugada';
  } else if (!data.status) {
    data.status = 'alugada'; 
  }

  const optionalStringFields: (keyof Motorcycle)[] = ['model', 'type', 'franqueado', 'qrCodeUrl'];
  optionalStringFields.forEach(field => {
    if (data[field] === null || data[field] === undefined) {
         delete data[field]; // Ensure it's not present if null/undefined
    }
  });

  // Handle dias_ociosos_congelados field
  if (data.dias_ociosos_congelados !== undefined && data.dias_ociosos_congelados !== null) {
    data.dias_ociosos_congelados = Number(data.dias_ociosos_congelados);
  } else {
    delete data.dias_ociosos_congelados;
  }
  
  return data as Omit<Motorcycle, 'id'>;
};


export function subscribeToMotorcycles(
  callback: (motorcycles: Motorcycle[]) => void
): () => void {
  const q = query(motorcyclesCollectionRef, orderBy('placa'));
  return onSnapshot(q, (snapshot) => {
    const motorcyclesData = snapshot.docs.map((docSnapshot) => ({
      ...fromFirestore(docSnapshot.data()),
      id: docSnapshot.id,
    }));
    callback(motorcyclesData);
  }, (error) => {
    console.error("Erro ao buscar motocicletas do Firestore:", error);
    callback([]); 
  });
}

export async function addMotorcycle(
  motorcycleData: Omit<Motorcycle, 'id'>
): Promise<string> {
  let dataToSave = cleanDataForFirestore(motorcycleData);

  if (dataToSave.status === undefined) {
    dataToSave.status = 'alugada'; 
  }
  
  const docRef = await addDoc(motorcyclesCollectionRef, dataToSave);
  return docRef.id;
}

export async function updateMotorcycle(
  id: string,
  motorcycleData: Partial<Omit<Motorcycle, 'id'>>
): Promise<void> {
  const motorcycleDocRef = doc(db, 'motorcycles', id);
  
  // The cleanDataForFirestore helper will remove undefined fields.
  // For updates, Firestore treats undefined differently from null (null clears a field).
  // The form logic should ensure empty optional fields become undefined.
  const dataToUpdate = cleanDataForFirestore(motorcycleData);

  // Specific handling for data_ultima_mov if it was an empty string, convert to null or ensure it's removed if undefined
  if (motorcycleData.data_ultima_mov === '') {
    (dataToUpdate as Motorcycle).data_ultima_mov = undefined; // Let cleanDataForFirestore remove it
  }


  if (Object.keys(dataToUpdate).length > 0) {
    await updateDoc(motorcycleDocRef, dataToUpdate);
  } else {
    console.log("Nenhum dado para atualizar para a moto:", id);
  }
}

export async function deleteMotorcycle(id: string): Promise<void> {
  const motorcycleDocRef = doc(db, 'motorcycles', id);
  await deleteDoc(motorcycleDocRef);
}

export async function importMotorcyclesBatch(motorcycles: Omit<Motorcycle, 'id'>[]): Promise<string[]> {
  const batch = writeBatch(db);
  const addedMotorcycleIds: string[] = [];
  const allowedStatus: MotorcycleStatus[] = ['active', 'inadimplente', 'recolhida', 'relocada', 'manutencao', 'alugada', 'indisponivel_rastreador', 'indisponivel_emplacamento'];

  motorcycles.forEach((moto) => {
    let preProcessedMoto: Partial<Omit<Motorcycle, 'id'>> = { ...moto };
    
    if (preProcessedMoto.status === undefined || !allowedStatus.includes(preProcessedMoto.status as MotorcycleStatus)) {
      preProcessedMoto.status = 'alugada'; 
    }
    if (preProcessedMoto.data_ultima_mov === '') {
      preProcessedMoto.data_ultima_mov = undefined;
    }

     const optionalFields: (keyof Omit<Motorcycle, 'id' | 'placa' | 'status'>)[] = ['model', 'type', 'franqueado', 'qrCodeUrl', 'valorSemanal', 'tempo_ocioso_dias', 'data_ultima_mov'];
     optionalFields.forEach(field => {
         if (preProcessedMoto[field] === '' || preProcessedMoto[field] === null) { // Also handle explicit null from CSV parsing if any
            (preProcessedMoto as any)[field] = undefined;
         }
     });

    const dataToSaveInBatch = cleanDataForFirestore(preProcessedMoto);

    // Ensure status has a default if it became undefined after cleaning
    if (dataToSaveInBatch.status === undefined) {
        dataToSaveInBatch.status = 'alugada';
    }

    const newMotoRef = doc(motorcyclesCollectionRef);
    batch.set(newMotoRef, dataToSaveInBatch);
    addedMotorcycleIds.push(newMotoRef.id);
  });
  await batch.commit();
  return addedMotorcycleIds;
}

export async function updateMotorcycleStatus(id: string, status: MotorcycleStatus): Promise<void> {
  const todayStr = new Date().toISOString().split('T')[0];
  
  // Preparar dados para atualização
  const updateData: Partial<Omit<Motorcycle, 'id'>> = {
    status,
    data_ultima_mov: todayStr
  };
  
  // Se a moto está sendo marcada como alugada ou relocada, limpar os dias ociosos congelados
  if (status === 'alugada' || status === 'relocada') {
    updateData.contagemPausada = false;
    updateData.dias_ociosos_congelados = undefined; // Remove o valor congelado
  }
  // Se a moto está entrando em manutenção, calcular e congelar os dias ociosos atuais
  else if (status === 'manutencao') {
    // Buscar a moto atual para calcular os dias ociosos no momento da manutenção
    const motorcycleDocRef = doc(db, 'motorcycles', id);
    const motorcycleSnapshot = await getDoc(motorcycleDocRef);
    
    if (motorcycleSnapshot.exists()) {
      const motoData = fromFirestore(motorcycleSnapshot.data());
      if (motoData.data_ultima_mov) {
        try {
          const lastMoveDate = new Date(motoData.data_ultima_mov + 'T00:00:00Z');
          const today = new Date();
          const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const lastMoveDateMidnight = new Date(lastMoveDate.getFullYear(), lastMoveDate.getMonth(), lastMoveDate.getDate());
          
          const daysIdle = Math.max(0, Math.floor((todayMidnight.getTime() - lastMoveDateMidnight.getTime()) / (1000 * 60 * 60 * 24)));
          updateData.dias_ociosos_congelados = daysIdle;
        } catch (error) {
          console.error("Erro ao calcular dias ociosos para congelamento:", error);
        }
      }
    }
  }
  
  // updateMotorcycle already handles cleaning undefined fields
  await updateMotorcycle(id, updateData);
}

export async function deleteAllMotorcycles(): Promise<void> {
  const snapshot = await getDocs(motorcyclesCollectionRef);
  if (snapshot.empty) {
    return;
  }
  const batch = writeBatch(db);
  snapshot.docs.forEach(docSingle => { 
    batch.delete(docSingle.ref);
  });
  await batch.commit();
}

// Função para calcular dias ociosos considerando o histórico de movimentações
export function calculateCorrectIdleDays(motorcycles: Motorcycle[], currentMoto: Motorcycle): number | string {
  if (!currentMoto.data_ultima_mov || !currentMoto.placa) {
    return 'N/A';
  }

  // Se a contagem está pausada manualmente
  if (currentMoto.contagemPausada) {
    return 'Pausado';
  }

  // Para motos alugadas, relocadas, recolhidas ou indisponíveis, não mostrar dias ociosos
  if (currentMoto.status === 'alugada' || currentMoto.status === 'relocada' || currentMoto.status === 'recolhida' ||
      currentMoto.status === 'indisponivel_rastreador' || currentMoto.status === 'indisponivel_emplacamento') {
    return 'N/A';
  }

  // Se a moto está em manutenção, mostrar os dias ociosos congelados ou calcular
  if (currentMoto.status === 'manutencao') {
    if (currentMoto.dias_ociosos_congelados !== undefined) {
      return currentMoto.dias_ociosos_congelados;
    }
    // Se não tem valor congelado, calcular normalmente
  }

  try {
    const currentDate = parseISO(currentMoto.data_ultima_mov);
    if (!dateIsValid(currentDate)) {
      return 'N/A';
    }

    // Buscar todas as motos com a mesma placa
    const samePlateMotos = motorcycles.filter(moto =>
      moto.placa === currentMoto.placa &&
      moto.data_ultima_mov &&
      moto.id !== currentMoto.id
    );

    // Encontrar a próxima movimentação após a data atual
    let nextMovementDate: Date | null = null;
    
    for (const moto of samePlateMotos) {
      if (moto.data_ultima_mov) {
        const motoDate = parseISO(moto.data_ultima_mov);
        if (dateIsValid(motoDate) && motoDate > currentDate) {
          if (!nextMovementDate || motoDate < nextMovementDate) {
            nextMovementDate = motoDate;
          }
        }
      }
    }

    // Se há uma próxima movimentação, calcular dias até ela (para qualquer status exceto se já tem valor congelado)
    if (nextMovementDate) {
      // Para motos em manutenção com valor congelado, usar o valor congelado
      if (currentMoto.status === 'manutencao' && currentMoto.dias_ociosos_congelados !== undefined) {
        return currentMoto.dias_ociosos_congelados;
      }
      
      const currentDateMidnight = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      const nextDateMidnight = new Date(nextMovementDate.getFullYear(), nextMovementDate.getMonth(), nextMovementDate.getDate());
      
      const daysIdle = differenceInCalendarDays(nextDateMidnight, currentDateMidnight);
      return Math.max(0, daysIdle);
    }

    // Se não há próxima movimentação, calcular até hoje (para motos disponíveis ou em manutenção sem valor congelado)
    if (currentMoto.status === 'active' ||
        (currentMoto.status === 'manutencao' && currentMoto.dias_ociosos_congelados === undefined)) {
      const today = new Date();
      const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const currentDateMidnight = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      
      const daysIdle = differenceInCalendarDays(todayMidnight, currentDateMidnight);
      return Math.max(0, daysIdle);
    }

    return 'N/A';
  } catch (error) {
    console.error("Erro ao calcular dias ociosos:", error);
    return 'N/A';
  }
}

// Função para verificar se uma moto tem contagem de dias ociosos ativa (cenário atual)
export function hasActiveIdleCount(motorcycles: Motorcycle[], currentMoto: Motorcycle): boolean {
  if (!currentMoto.data_ultima_mov || !currentMoto.placa) {
    return false;
  }

  // Se a contagem está pausada manualmente, não é ativa
  if (currentMoto.contagemPausada) {
    return false;
  }

  // Para motos alugadas, relocadas, recolhidas ou indisponíveis, não há contagem ativa
  if (currentMoto.status === 'alugada' || currentMoto.status === 'relocada' || currentMoto.status === 'recolhida' ||
      currentMoto.status === 'indisponivel_rastreador' || currentMoto.status === 'indisponivel_emplacamento') {
    return false;
  }

  // Se não é active nem manutenção, não há contagem ativa
  if (currentMoto.status !== 'active' && currentMoto.status !== 'manutencao') {
    return false;
  }

  try {
    const currentDate = parseISO(currentMoto.data_ultima_mov);
    if (!dateIsValid(currentDate)) {
      return false;
    }
    
    // Buscar todas as motos com a mesma placa
    const samePlateMotos = motorcycles.filter(moto =>
      moto.placa === currentMoto.placa &&
      moto.data_ultima_mov &&
      moto.id !== currentMoto.id
    );

    // Verificar se há uma movimentação posterior que "congelou" a contagem
    for (const moto of samePlateMotos) {
      if (moto.data_ultima_mov) {
        const motoDate = parseISO(moto.data_ultima_mov);
        if (dateIsValid(motoDate) && motoDate > currentDate) {
          // Há uma movimentação posterior, então esta contagem foi "congelada"
          return false;
        }
      }
    }

    // Se chegou até aqui, a contagem está ativa (é o registro mais recente)
    return true;
  } catch (error) {
    console.error("Erro ao verificar contagem ativa:", error);
    return false;
  }
}

// Função para calcular dias ociosos apenas para motos com contagem ativa
export function calculateActiveIdleDays(motorcycles: Motorcycle[], currentMoto: Motorcycle): number | string {
  if (!hasActiveIdleCount(motorcycles, currentMoto)) {
    return 'N/A';
  }

  return calculateCorrectIdleDays(motorcycles, currentMoto);
}

// Função para atualizar valores semanais das motos com status Alugada ou Relocada
export async function updateWeeklyValuesForRentedMotorcycles(): Promise<void> {
  // Valores de referência baseados nas imagens fornecidas
  const weeklyValues: { [key: string]: number } = {
    // Primeira lista
    'SKP9E30': 398.30,
    'TGU1F14': 398.30,
    'TGR3D83': 419.30,
    'SKI7A21': 398.30,
    'TGW4F38': 454.30,
    'TGW7J25': 454.30,
    'SKO2I81': 419.30,
    'TGW4F14': 454.30,
    'TGW3D07': 454.30,
    'SKR1I14': 384.30,
    // Segunda lista
    'TGU5A86': 398.30,
    'TGW9J57': 419.30,
    'TGW8G16': 419.30,
    'TGW0G06': 419.30,
    'TGW6F09': 454.30,
    'SKP6C81': 398.30,
    'TIV8A90': 384.30,
    'TGU0G13': 398.30,
    'TGV6C01': 419.30,
    'TGU4C56': 454.30,
    // Terceira lista
    'TGW4C60': 419.30,
    'TGV1E56': 419.30,
    'SKP5E44': 328.30,
    'SKP0A38': 398.30,
    'SKP2G58': 356.30,
    'SKP4A07': 398.30,
    'TGU0H71': 398.30,
    'SKP0J11': 328.30,
    'TGW1F57': 454.30,
    'TGT7B68': 454.30,
    // Quarta lista
    'TGU6A54': 454.30,
    'TLS0B69': 349.30,
    'TGU8A35': 454.30,
    'TGV7C20': 384.30,
    'TGV0H39': 419.30,
    'TGV1A25': 419.30,
    'TGT4D16': 349.30,
    'SKM8D69': 349.30,
    'TGV7F83': 419.30,
    'TGU4E36': 454.30,
    // Quinta lista
    'TMC1J87': 321.30,
    'SKO5B53': 349.30,
    'TGU8D15': 454.30,
    'TGU7H43': 454.30,
    'SKR1B62': 454.30,
    'TGR6H97': 419.30,
    'TGV3D69': 349.30,
    'TGU1B62': 398.30,
    'TMI2C46': 419.30,
    'TGV5E26': 419.30,
    // Sexta lista
    'TGT5B87': 454.30,
    'TGV6D29': 419.30,
    'TGV5E75': 419.30,
    'SKP2H46': 398.30,
    'SKM4B17': 356.30,
    'SKM9G55': 419.30,
    'TGU1E39': 454.30,
    'TGV1A91': 419.30,
    'SKM7D96': 356.30,
    'TGT9F10': 454.30,
    // Sétima lista
    'TGU5D64': 419.30,
    'SJX4E45': 349.30,
    'TGU4C26': 419.30,
    'TIU5G30': 384.30,
    'TGU6A18': 419.30,
    'SKI4A36': 356.30,
    'TKS4A46': 364.00,
    'TGU9I75': 419.30,
    'TGV6G16': 419.30,
    'TGV0I53': 419.30,
    // Oitava lista
    'TGU4B02': 419.30,
    'TGU5I58': 454.30,
    'SKO9E22': 349.30,
    'TKL3F75': 364.00,
    'SKO5D97': 364.00,
    'TGU6I16': 419.30,
    'SKS6A37': 342.30,
    'TGU4E74': 419.30,
    'TLQ1B67': 419.30,
    'SKS9H49': 349.30,
    // Nona lista
    'TGU7D25': 419.30,
    'TJA0J20': 384.30,
    'SKP9D51': 356.30,
    'SJX7H03': 321.30,
    'TLS3H03': 419.30,
    'TGU7F96': 419.30,
    'SKM9C49': 293.30,
    'TGU3G26': 419.30,
    'TGT9H82': 419.30,
    'TGU0G51': 419.30,
    // Décima lista
    'SKT8J98': 328.30,
    'TGU2H40': 454.30,
    'SJZ2E72': 349.30,
    'SKR1I39': 384.30,
    'SJX0G39': 80.62, // R$ 349,30 mensal ÷ 4.33 = ~80.62 semanal
    'TGT9A56': 419.30,
    'TGU9F92': 454.30,
    'TGT7I15': 454.30,
    'TGU2B50': 419.30,
    'TGU8D84': 419.30,
    // Décima primeira lista
    'TGU5E89': 349.30,
    'TGU8C18': 454.30,
    'TGU3C65': 419.30,
    'TGU9J73': 454.30,
    'SKO5F88': 349.30,
    'SKM6F26': 328.30,
    'TGU9A25': 454.30,
    'TGU3E44': 419.30,
    'SKM3I97': 328.30,
    'TGT8E27': 454.00,
    // Décima segunda lista
    'TGU9J80': 419.30,
    'TGT9F84': 349.30,
    'SKM9G21': 398.30,
    'SKS2G45': 419.30,
    'TGU5I11': 419.30,
    'SKQ7H58': 419.30,
    'TGU2H59': 419.30,
    'SKR9I75': 454.00,
    'TGT5F29': 419.30,
    'TGT7F98': 398.30,
    // Décima terceira lista
    'SKN0F63': 349.30,
    'TGU1B24': 419.30,
    'TGT4E20': 419.30,
    'SJX8B47': 384.30,
    'SKO4H87': 349.30,
    'TGT4F86': 419.30,
    'TKA4J90': 384.30,
    'TGT3F65': 419.30,
    'TGT8B37': 419.30,
    'TKJ8I20': 321.30,
    // Décima quarta lista
    'SKN4D04': 398.30,
    'TLA0G00': 384.30,
    'TKF4F70': 384.30,
    'TGT0A44': 419.30,
    'TGT8D08': 349.30,
    'TGR4C29': 454.30,
    'TGT8G68': 419.30,
    'SKM1A50': 398.30,
    'SKN8D69': 398.30,
    'SKI1I36': 398.30,
    // Décima quinta lista
    'TGT5D27': 419.30,
    'TGR6B56': 419.30,
    'TMC5C21': 419.30,
    'TKC8E81': 419.30,
    'SKR7D21': 454.30,
    'TGR9B30': 419.30,
    'TKJ3A92': 419.30,
    'TKS3J40': 321.30,
    'TLP1F32': 419.30,
    'SKO6G48': 419.30,
    // Décima sexta lista
    'SKK4I53': 349.30,
    'TIT8B40': 380.39, // R$ 1.647,00 mensal ÷ 4.33 = ~380.39 semanal
    'SKP6H49': 398.30,
    'SKP1D61': 398.30,
    'SKO7G66': 419.30,
    'SKM4E50': 398.00,
    'SKP5A91': 328.30,
    'SKI5E38': 356.30,
    'SKS2E32': 419.30,
    'SKO1H66': 398.30,
    // Décima sétima lista
    'SKT6F85': 398.30,
    'SKR2E46': 419.30,
    'SKN9J22': 349.30,
    'SKS1A13': 454.30,
    'TGR8D27': 398.30,
    'SKT2J56': 398.30,
    'SKO4E71': 419.30,
    'SKN3F02': 419.30,
    'TGR6I68': 419.30,
    'SKL7A45': 342.30,
    // Décima oitava lista
    'SKQ2E21': 398.30,
    'SKI6J68': 328.30,
    'TGR8J52': 419.30,
    'SKT9F77': 398.30,
    'TGR9A12': 419.30,
    'TGR3D76': 419.30,
    'SKT4G17': 398.30,
    'TMH4B79': 342.30,
    'SKT6E66': 398.30,
    'SKM4I78': 349.30,
    // Décima nona lista
    'SJX1E19': 349.30,
    'TGR7F54': 398.30,
    'TGR8E29': 454.30,
    'SKT2D64': 398.30,
    'TJP7G89': 419.30,
    'TGR7D45': 419.30,
    'TGR6C49': 419.30,
    'TGR3E71': 454.30,
    'TGR2C27': 454.30,
    'TGR9F96': 454.30,
    // Vigésima lista
    'TGR3A77': 328.30,
    'TGR2E63': 419.30,
    'TGR9E31': 419.30,
    'SKI6H41': 356.30,
    'SKS9E90': 384.30,
    'TGR2G44': 454.30,
    'TGR9H36': 454.30,
    'TGR4A73': 419.30,
    'TGR9G78': 454.30,
    'TGR4G37': 398.30,
    // Vigésima primeira lista
    'TGR4F94': 419.30,
    'SKT3H69': 398.30,
    'TGR4C79': 419.30,
    'TGR3G61': 419.30,
    'TGR4A82': 454.00,
    'SKI3C20': 398.30,
    'TGR4E75': 419.30,
    'TGR3G90': 454.30,
    'SKT1C71': 398.30,
    'SKT6B34': 419.30,
    // Vigésima segunda lista
    'TGR1A06': 419.30,
    'SKT2H96': 398.30,
    'TGR9C97': 419.30,
    'TGR6D09': 454.30,
    'TGR5A39': 454.30,
    'SKT6J94': 398.30,
    'TGR2I42': 454.30,
    'TGR1A76': 419.30,
    'SKR8G29': 419.30,
    'SKT7A67': 398.30,
    // Vigésima terceira lista
    'SKT5D63': 419.30,
    'TGR8B06': 398.30,
    'SKT1A23': 349.30,
    'SKT1J29': 419.30,
    'SKT5E46': 398.30,
    'TLF2I80': 384.30,
    'SKT9G16': 419.30,
    'SKT9I65': 419.30,
    'SKI7J01': 398.30,
    'TJR9J60': 321.30,
    // Vigésima quarta lista
    'SKN4I79': 419.30,
    'SKS1G83': 419.30,
    'SKO9H29': 419.30,
    'SKS9J22': 419.30,
    'SKS9J10': 419.30,
    'TLN9I32': 364.00,
    'SKS8D22': 419.30,
    'SKS2G41': 419.30,
    'TKR6J13': 419.30,
    'SKP5C26': 398.30,
    // Vigésima quinta lista
    'TIZ3G30': 398.30,
    'SKJ5D45': 363.30,
    'SKQ6B20': 419.30,
    'TJZ5I94': 419.30,
    'SKP4A06': 398.30,
    'SKN4H47': 398.30,
    'TJN5B10': 384.30,
    'SKM2J41': 398.30,
    'SKP3E03': 398.30,
    'TLH7A10': 384.30,
    // Vigésima sexta lista
    'SKR6J57': 419.30,
    'SKR1A38': 419.30,
    'SKP2A83': 398.30,
    'SKR4D71': 454.30,
    'SKQ1H55': 419.30,
    'SKS8F23': 454.30,
    'SKO2B13': 419.30,
    'SKS0H89': 454.30,
    'SKS2E12': 419.30,
    'SKS3D64': 398.30,
    // Vigésima sétima lista
    'SKR6E74': 454.30,
    'SKM5F60': 398.00,
    'SKP4A15': 398.30,
    'SKS8H18': 454.30,
    'SKR8I48': 454.30,
    'TJD8J40': 384.30,
    'TLD8C80': 384.30,
    'SKR5A86': 454.30,
    'TKC2B30': 384.30,
    'TLX5B34': 242.00,
    // Vigésima oitava lista
    'TJJ3E80': 342.30,
    'SKQ4D96': 454.30,
    'TJG0D80': 384.30,
    'SKR5E06': 419.30,
    'SKQ2I20': 454.30,
    'SKP8F01': 398.30,
    'SKL1C11': 419.30,
    'SKN2F71': 419.30,
    'SKM5I55': 398.30,
    'SKQ8I07': 384.30,
    // Vigésima nona lista
    'SKP7J89': 398.30,
    'SKP3D92': 398.30,
    'SKQ0F17': 384.30,
    'SKC9H20': 419.30,
    'SKQ3I22': 398.30,
    'SKP2D27': 398.30,
    'SKP9D60': 398.30,
    'SKP1A08': 398.30,
    'SKQ6D96': 419.30,
    'SKP7B90': 398.30,
    // Trigésima lista
    'SKP1J17': 398.30,
    'SKQ6A35': 419.30,
    'SKQ7D07': 419.30,
    'SKP6D54': 398.30,
    'SKK5C19': 293.30,
    'SKP9I37': 419.30,
    'SKP8C36': 398.30,
    'SKP0E71': 398.30,
    'SKK7C07': 293.30,
    'SKO8A18': 419.30,
    // Trigésima primeira lista
    'SKP9D96': 398.30,
    'SKP8D96': 419.30,
    'SKN1A44': 349.30,
    'SKM9F22': 398.30,
    'SKM1J86': 419.30,
    'SKO7G48': 419.30,
    'SKO3I09': 419.30,
    'SKO4D98': 419.30,
    'SKO6A23': 419.30,
    'SKM1B72': 398.30,
    // Trigésima segunda lista
    'SKN4J57': 419.30,
    'SKO2E49': 398.30,
    'SKO6F01': 398.30,
    'SKN5C95': 398.30,
    'SKN6F19': 398.30,
    'SKN2A46': 328.30,
    'SKN2I92': 398.30,
    'SJX4G75': 321.30,
    'SKO6I55': 398.30,
    'SKO1J91': 398.30,
    // Trigésima terceira lista
    'SKN8J33': 398.30,
    'SKN8H22': 398.30,
    'SKN2J71': 398.30,
    'SKN1A16': 398.30,
    'SKM6J04': 398.00,
    'SKN9C11': 398.30,
    'SKN2C84': 328.30,
    'SKM0H08': 398.30,
    'SKO2C86': 328.30,
    'SKN1D09': 398.30,
    // Trigésima quarta lista
    'SKM7H33': 328.30,
    'SKM5A19': 398.30,
    'SKM6F84': 398.30,
    'SKM3A81': 398.30,
    'SKM1A72': 398.30,
    'SKM0B75': 398.30,
    'SKM6C12': 398.30,
    'SKM0B78': 398.30,
    'SKM1E94': 398.30,
    'SKL9E13': 419.30,
    // Trigésima quinta lista
    'SKL5C09': 419.30,
    'SKL7D40': 419.30,
    'SKL7G64': 419.30,
    'SKL0H85': 419.30,
    'SKI6B70': 398.30,
    'SKK5F31': 363.30,
    'SKK8G32': 363.30,
    'SKK8H59': 293.30,
    'SKK7I50': 398.30,
    'SKJ0D91': 363.30,
    // Trigésima sexta lista
    'SKJ7E96': 363.30,
    'SKJ2E04': 293.30,
    'SKJ6B95': 363.30,
    'SKI7C42': 328.30,
    'SJX8G57': 363.30,
    'SKI9D14': 328.00,
    'SKI4H71': 398.30,
    'SJX2J11': 398.30,
    'SKJ3I37': 398.30,
    'SKJ1C64': 398.30,
  };

  try {
    // Buscar todas as motos
    const snapshot = await getDocs(motorcyclesCollectionRef);
    const batch = writeBatch(db);
    let updatedCount = 0;

    for (const docSnapshot of snapshot.docs) {
      const motoData = fromFirestore(docSnapshot.data());
      const motoId = docSnapshot.id;
      
      // Verificar se a moto tem status Alugada ou Relocada e se a placa está na lista de referência
      if ((motoData.status === 'alugada' || motoData.status === 'relocada') &&
          motoData.placa &&
          weeklyValues[motoData.placa]) {
        
        const weeklyValue = weeklyValues[motoData.placa];
        
        // Atualizar apenas se o valor for diferente do atual
        if (motoData.valorSemanal !== weeklyValue) {
          const motorcycleDocRef = doc(db, 'motorcycles', motoId);
          batch.update(motorcycleDocRef, { valorSemanal: weeklyValue });
          updatedCount++;
          console.log(`Atualizando moto ${motoData.placa} com valor semanal R$ ${weeklyValue}`);
        }
      }
    }

    if (updatedCount > 0) {
      await batch.commit();
      console.log(`${updatedCount} motos foram atualizadas com valores semanais.`);
    } else {
      console.log('Nenhuma moto precisou ser atualizada.');
    }
  } catch (error) {
    console.error('Erro ao atualizar valores semanais:', error);
    throw error;
  }
}
