import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  writeBatch,
  query,
  orderBy,
  where,
  Timestamp,
  serverTimestamp,
  getDoc,
} from 'firebase/firestore';
import { db } from './config';
import type { ManutencaoData } from '@/lib/types';

const MANUTENCAO_COLLECTION = 'manutencao';
const manutencaoCollectionRef = collection(db, MANUTENCAO_COLLECTION);

function cleanDataForFirestore<T extends object>(data: T): Partial<T> {
  const cleaned = { ...data };
  for (const key in cleaned) {
    if (cleaned[key as keyof T] === undefined) {
      delete cleaned[key as keyof T];
    }
  }
  return cleaned;
}

const fromFirestore = (docData: any): Omit<ManutencaoData, 'id'> => {
  const data = { ...docData };
  
  if (data.created_at && data.created_at instanceof Timestamp) {
    data.created_at = data.created_at.toDate().toISOString();
  }
  if (data.updated_at && data.updated_at instanceof Timestamp) {
    data.updated_at = data.updated_at.toDate().toISOString();
  }
  
  if (!data.valor_total) {
    data.valor_total = 0;
  }
  
  return data as Omit<ManutencaoData, 'id'>;
};

export function subscribeToManutencao(
  callback: (manutencao: ManutencaoData[]) => void
): () => void {
  const q = query(manutencaoCollectionRef, orderBy('created_at', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const manutencaoData = snapshot.docs.map((docSnapshot) => ({
      ...fromFirestore(docSnapshot.data()),
      id: docSnapshot.id,
    }));
    callback(manutencaoData);
  }, (error) => {
    console.error('Erro ao buscar dados de manutenção do Firestore:', error);
    callback([]);
  });
}

export async function addManutencao(
  manutencaoData: Omit<ManutencaoData, 'id' | 'created_at' | 'updated_at'>
): Promise<string> {
  const dataToSave = cleanDataForFirestore({
    ...manutencaoData,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
  
  if (!dataToSave.valor_total) {
    dataToSave.valor_total = 0;
  }
  
  const docRef = await addDoc(manutencaoCollectionRef, dataToSave);
  return docRef.id;
}

export async function updateManutencao(
  id: string,
  manutencaoData: Partial<Omit<ManutencaoData, 'id' | 'created_at'>>
): Promise<void> {
  const manutencaoDocRef = doc(db, MANUTENCAO_COLLECTION, id);
  
  const dataToUpdate = cleanDataForFirestore({
    ...manutencaoData,
    updated_at: serverTimestamp(),
  });
  
  if (Object.keys(dataToUpdate).length > 0) {
    await updateDoc(manutencaoDocRef, dataToUpdate);
  } else {
    console.log('Nenhum dado para atualizar para manutenção:', id);
  }
}

export async function deleteManutencao(id: string): Promise<void> {
  const manutencaoDocRef = doc(db, MANUTENCAO_COLLECTION, id);
  await deleteDoc(manutencaoDocRef);
}

export async function getManutencao(): Promise<ManutencaoData[]> {
  const q = query(manutencaoCollectionRef, orderBy('created_at', 'desc'));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map((docSnapshot) => ({
    ...fromFirestore(docSnapshot.data()),
    id: docSnapshot.id,
  }));
}

export async function getManutencaoById(id: string): Promise<ManutencaoData | null> {
  const manutencaoDocRef = doc(db, MANUTENCAO_COLLECTION, id);
  const docSnapshot = await getDoc(manutencaoDocRef);
  
  if (docSnapshot.exists()) {
    return {
      ...fromFirestore(docSnapshot.data()),
      id: docSnapshot.id,
    };
  }
  
  return null;
}

export async function getManutencaoByFabricante(
  fabricante: string
): Promise<ManutencaoData[]> {
  const q = query(
    manutencaoCollectionRef,
    where('veiculo_fabricante', '==', fabricante),
    orderBy('created_at', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnapshot) => ({
    ...fromFirestore(docSnapshot.data()),
    id: docSnapshot.id,
  }));
}

export async function importManutencaoBatch(
  manutencaoList: Omit<ManutencaoData, 'id' | 'created_at' | 'updated_at'>[]
): Promise<string[]> {
  try {
    console.log('Iniciando importação em lote de', manutencaoList.length, 'registros');
    
    // Para operações em lote grandes, vamos dividir em chunks menores
    const BATCH_SIZE = 100; // Firestore limita a 500 operações por batch
    const chunks = [];
    
    for (let i = 0; i < manutencaoList.length; i += BATCH_SIZE) {
      chunks.push(manutencaoList.slice(i, i + BATCH_SIZE));
    }
    
    const allIds: string[] = [];
    
    for (const chunk of chunks) {
      const batch = writeBatch(db);
      const chunkIds: string[] = [];
      
      chunk.forEach((manutencaoData) => {
        const processedData = {
          ...manutencaoData,
          valor_total: manutencaoData.valor_total || 0,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        };
        
        const dataToSave = cleanDataForFirestore(processedData);
        const newDocRef = doc(manutencaoCollectionRef);
        batch.set(newDocRef, dataToSave);
        chunkIds.push(newDocRef.id);
      });
      
      console.log('Commitando chunk de', chunk.length, 'registros');
      await batch.commit();
      allIds.push(...chunkIds);
    }
    
    console.log('Importação concluída com sucesso. Total de IDs:', allIds.length);
    return allIds;
  } catch (error) {
    console.error('Erro detalhado na importação em lote:', error);
    throw error;
  }
}

export async function deleteAllManutencao(): Promise<void> {
  const snapshot = await getDocs(manutencaoCollectionRef);
  if (snapshot.empty) {
    return;
  }
  
  const batch = writeBatch(db);
  snapshot.docs.forEach(docSnapshot => {
    batch.delete(docSnapshot.ref);
  });
  
  await batch.commit();
}

export async function getManutencaoByPlaca(placa: string): Promise<ManutencaoData[]> {
  const q = query(
    manutencaoCollectionRef,
    where('veiculo_placa', '==', placa),
    orderBy('created_at', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnapshot) => ({
    ...fromFirestore(docSnapshot.data()),
    id: docSnapshot.id,
  }));
}

export async function getManutencaoStats(): Promise<{
  total: number;
  valorTotal: number;
  valorMedio: number;
  fabricanteMaisManutencoes: string;
}> {
  const manutencaoList = await getManutencao();
  
  const fabricanteCount: Record<string, number> = {};
  
  const stats = manutencaoList.reduce((acc, item) => {
    acc.total++;
    acc.valorTotal += item.valor_total;
    
    if (item.veiculo_fabricante) {
      fabricanteCount[item.veiculo_fabricante] = (fabricanteCount[item.veiculo_fabricante] || 0) + 1;
    }
    
    return acc;
  }, {
    total: 0,
    valorTotal: 0,
  });
  
  const fabricanteMaisManutencoes = Object.entries(fabricanteCount)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || '';
  
  return {
    ...stats,
    valorMedio: stats.total > 0 ? stats.valorTotal / stats.total : 0,
    fabricanteMaisManutencoes,
  };
}