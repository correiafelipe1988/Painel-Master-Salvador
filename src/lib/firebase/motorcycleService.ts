
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
} from 'firebase/firestore';
import { db } from './config';
import type { Motorcycle, MotorcycleStatus } from '@/lib/types';

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
  
  if (data.valorDiaria !== undefined && data.valorDiaria !== null) {
    data.valorDiaria = Number(data.valorDiaria);
  } else {
    delete data.valorDiaria; // Ensure it's not present if null/undefined from DB
  }
  if (data.tempo_ocioso_dias !== undefined && data.tempo_ocioso_dias !== null) {
    data.tempo_ocioso_dias = Number(data.tempo_ocioso_dias);
  } else {
    delete data.tempo_ocioso_dias; // Ensure it's not present
  }

  const allowedStatus: MotorcycleStatus[] = ['active', 'inadimplente', 'recolhida', 'relocada', 'manutencao', 'alugada'];
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
  const allowedStatus: MotorcycleStatus[] = ['active', 'inadimplente', 'recolhida', 'relocada', 'manutencao', 'alugada'];

  motorcycles.forEach((moto) => {
    let preProcessedMoto: Partial<Omit<Motorcycle, 'id'>> = { ...moto };
    
    if (preProcessedMoto.status === undefined || !allowedStatus.includes(preProcessedMoto.status as MotorcycleStatus)) {
      preProcessedMoto.status = 'alugada'; 
    }
    if (preProcessedMoto.data_ultima_mov === '') {
      preProcessedMoto.data_ultima_mov = undefined;
    }

     const optionalFields: (keyof Omit<Motorcycle, 'id' | 'placa' | 'status'>)[] = ['model', 'type', 'franqueado', 'qrCodeUrl', 'valorDiaria', 'tempo_ocioso_dias', 'data_ultima_mov'];
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
  // updateMotorcycle already handles cleaning undefined fields
  await updateMotorcycle(id, { status, data_ultima_mov: todayStr });
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
