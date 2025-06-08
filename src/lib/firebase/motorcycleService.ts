// src/lib/firebase/motorcycleService.ts
// REMOVED 'use server'; directive to allow both sync and async functions to be used by client components.

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
  getDocs, // Added getDocs for deleteAllMotorcycles if it's ever re-enabled or for other fetches
} from 'firebase/firestore';
import { db } from './config';
import type { Motorcycle, MotorcycleStatus } from '@/lib/types';

const motorcyclesCollectionRef = collection(db, 'motorcycles');

const fromFirestore = (docData: any): Omit<Motorcycle, 'id'> => {
  const data = { ...docData };
  if (data.data_ultima_mov && data.data_ultima_mov instanceof Timestamp) {
    data.data_ultima_mov = data.data_ultima_mov.toDate().toISOString().split('T')[0];
  }
  if (data.valorDiaria !== undefined) data.valorDiaria = Number(data.valorDiaria);
  if (data.tempo_ocioso_dias !== undefined) data.tempo_ocioso_dias = Number(data.tempo_ocioso_dias);

  // Ensure status is one of the allowed MotorcycleStatus values, default if not
  const allowedStatus: MotorcycleStatus[] = ['active', 'inadimplente', 'recolhida', 'relocada', 'manutencao', 'alugada'];
  if (data.status && !allowedStatus.includes(data.status)) {
    console.warn(`Invalid status "${data.status}" from Firestore, defaulting to 'alugada'.`);
    data.status = 'alugada';
  } else if (!data.status) {
    data.status = 'alugada'; // Default if status is missing
  }


  return data as Omit<Motorcycle, 'id'>;
};


export function subscribeToMotorcycles(
  callback: (motorcycles: Motorcycle[]) => void
): () => void {
  const q = query(motorcyclesCollectionRef, orderBy('placa'));
  return onSnapshot(q, (snapshot) => {
    const motorcycles = snapshot.docs.map((doc) => ({
      ...fromFirestore(doc.data()),
      id: doc.id,
    }));
    callback(motorcycles);
  }, (error) => {
    console.error("Erro ao buscar motocicletas do Firestore:", error);
    callback([]); // Call with empty array on error
  });
}

export async function addMotorcycle(
  motorcycleData: Omit<Motorcycle, 'id'>
): Promise<string> {
  const dataToSave = { ...motorcycleData };
  if (dataToSave.data_ultima_mov === '') dataToSave.data_ultima_mov = undefined;
  const docRef = await addDoc(motorcyclesCollectionRef, dataToSave);
  return docRef.id;
}

export async function updateMotorcycle(
  id: string,
  motorcycleData: Partial<Omit<Motorcycle, 'id'>>
): Promise<void> {
  const motorcycleDocRef = doc(db, 'motorcycles', id);
  const dataToUpdate = { ...motorcycleData };
  if (dataToUpdate.data_ultima_mov === '') dataToUpdate.data_ultima_mov = undefined;
  await updateDoc(motorcycleDocRef, dataToUpdate);
}

export async function deleteMotorcycle(id: string): Promise<void> {
  const motorcycleDocRef = doc(db, 'motorcycles', id);
  await deleteDoc(motorcycleDocRef);
}

export async function importMotorcyclesBatch(motorcycles: Omit<Motorcycle, 'id'>[]): Promise<string[]> {
  const batch = writeBatch(db);
  const addedMotorcycleIds: string[] = [];
  motorcycles.forEach((moto) => {
    const dataToSave = { ...moto };
    if (dataToSave.data_ultima_mov === '') dataToSave.data_ultima_mov = undefined;
    // Ensure status is valid or default it
    const allowedStatus: MotorcycleStatus[] = ['active', 'inadimplente', 'recolhida', 'relocada', 'manutencao', 'alugada'];
    if (!dataToSave.status || !allowedStatus.includes(dataToSave.status)) {
        dataToSave.status = 'alugada'; // Default status if missing or invalid
    }

    const newMotoRef = doc(motorcyclesCollectionRef);
    batch.set(newMotoRef, dataToSave);
    addedMotorcycleIds.push(newMotoRef.id);
  });
  await batch.commit();
  return addedMotorcycleIds;
}

export async function updateMotorcycleStatus(id: string, status: MotorcycleStatus): Promise<void> {
  // Ensure data_ultima_mov is updated to today when status changes, if appropriate
  const todayStr = new Date().toISOString().split('T')[0];
  await updateMotorcycle(id, { status, data_ultima_mov: todayStr });
}

// This function is potentially dangerous and resource-intensive.
// Re-enable with caution and appropriate UI confirmation.
export async function deleteAllMotorcycles(): Promise<void> {
  const snapshot = await getDocs(motorcyclesCollectionRef);
  if (snapshot.empty) {
    return;
  }
  const batch = writeBatch(db);
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  await batch.commit();
}
