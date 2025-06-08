
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

const fromFirestore = (docData: any): Omit<Motorcycle, 'id'> => {
  const data = { ...docData };
  if (data.data_ultima_mov && data.data_ultima_mov instanceof Timestamp) {
    data.data_ultima_mov = data.data_ultima_mov.toDate().toISOString().split('T')[0];
  }
  // Make sure these are numbers if they exist, otherwise undefined
  if (data.valorDiaria !== undefined && data.valorDiaria !== null) {
    data.valorDiaria = Number(data.valorDiaria);
  } else {
    delete data.valorDiaria;
  }
  if (data.tempo_ocioso_dias !== undefined && data.tempo_ocioso_dias !== null) {
    data.tempo_ocioso_dias = Number(data.tempo_ocioso_dias);
  } else {
    delete data.tempo_ocioso_dias;
  }

  const allowedStatus: MotorcycleStatus[] = ['active', 'inadimplente', 'recolhida', 'relocada', 'manutencao', 'alugada'];
  if (data.status && !allowedStatus.includes(data.status)) {
    console.warn(`Invalid status "${data.status}" from Firestore for doc, defaulting to 'alugada'.`);
    data.status = 'alugada';
  } else if (!data.status) {
    data.status = 'alugada'; 
  }

  // Ensure optional string fields are strings or undefined
  const optionalStringFields: (keyof Motorcycle)[] = ['model', 'type', 'franqueado', 'qrCodeUrl'];
  optionalStringFields.forEach(field => {
    if (data[field] === null) data[field] = undefined;
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
  const dataToSave = { ...motorcycleData };

  // Ensure status has a default if not provided from form
  if (dataToSave.status === undefined) {
    (dataToSave as Motorcycle).status = 'alugada'; // Default status
  }
  
  // Firestore's addDoc naturally omits fields that are `undefined` in dataToSave.
  // The form logic in AddMotorcycleForm.tsx already ensures optional empty strings become undefined.
  
  const docRef = await addDoc(motorcyclesCollectionRef, dataToSave);
  return docRef.id;
}

export async function updateMotorcycle(
  id: string,
  motorcycleData: Partial<Omit<Motorcycle, 'id'>>
): Promise<void> {
  const motorcycleDocRef = doc(db, 'motorcycles', id);
  
  const rawDataToUpdate = { ...motorcycleData };

  // Firestore's updateDoc throws error for `undefined` values.
  // We must filter them out. Null values are acceptable for clearing fields.
  const cleanedDataToUpdate: { [key: string]: any } = {};
  for (const key in rawDataToUpdate) {
    if (Object.prototype.hasOwnProperty.call(rawDataToUpdate, key)) {
      const typedKey = key as keyof typeof rawDataToUpdate;
      if (rawDataToUpdate[typedKey] !== undefined) {
        cleanedDataToUpdate[key] = rawDataToUpdate[typedKey];
      }
      // If an empty string for an optional field should remove it or set to null,
      // that logic would be here or in the form.
      // For example, if data_ultima_mov: "" should mean data_ultima_mov: null
      if (key === 'data_ultima_mov' && cleanedDataToUpdate[key] === '') {
         cleanedDataToUpdate[key] = null; // Or use deleteField() if you want to remove field
      }
    }
  }

  if (Object.keys(cleanedDataToUpdate).length > 0) {
    await updateDoc(motorcycleDocRef, cleanedDataToUpdate);
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
    const dataToSave = { ...moto };
    
    if (dataToSave.status === undefined || !allowedStatus.includes(dataToSave.status)) {
      (dataToSave as Motorcycle).status = 'alugada'; 
    }
    if (dataToSave.data_ultima_mov === '') {
      (dataToSave as Motorcycle).data_ultima_mov = undefined;
    }

    // Ensure other optional fields are undefined if empty, so they are omitted by Firestore
     const optionalFields: (keyof Omit<Motorcycle, 'id' | 'placa' | 'status'>)[] = ['model', 'type', 'franqueado', 'qrCodeUrl', 'valorDiaria', 'tempo_ocioso_dias', 'data_ultima_mov'];
     optionalFields.forEach(field => {
         if (dataToSave[field] === '') {
            (dataToSave as any)[field] = undefined;
         }
     });


    const newMotoRef = doc(motorcyclesCollectionRef);
    batch.set(newMotoRef, dataToSave);
    addedMotorcycleIds.push(newMotoRef.id);
  });
  await batch.commit();
  return addedMotorcycleIds;
}

export async function updateMotorcycleStatus(id: string, status: MotorcycleStatus): Promise<void> {
  const todayStr = new Date().toISOString().split('T')[0];
  await updateMotorcycle(id, { status, data_ultima_mov: todayStr });
}

export async function deleteAllMotorcycles(): Promise<void> {
  const snapshot = await getDocs(motorcyclesCollectionRef);
  if (snapshot.empty) {
    return;
  }
  const batch = writeBatch(db);
  snapshot.docs.forEach(docSingle => { // Renamed doc to docSingle to avoid conflict
    batch.delete(docSingle.ref);
  });
  await batch.commit();
}

    