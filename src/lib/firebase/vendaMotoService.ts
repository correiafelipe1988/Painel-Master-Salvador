import { db } from './config';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { VendaMoto } from '../types';

const VENDAS_COLLECTION = 'vendas_motos';

export const getVendasMotos = async (): Promise<VendaMoto[]> => {
  const snapshot = await getDocs(collection(db, VENDAS_COLLECTION));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VendaMoto));
};

export const addVendaMoto = async (venda: Omit<VendaMoto, 'id'>) => {
  return await addDoc(collection(db, VENDAS_COLLECTION), venda);
};

export const updateVendaMoto = async (id: string, venda: Partial<VendaMoto>) => {
  const docRef = doc(db, VENDAS_COLLECTION, id);
  return await updateDoc(docRef, venda);
};

export const deleteVendaMoto = async (id: string) => {
  const docRef = doc(db, VENDAS_COLLECTION, id);
  return await deleteDoc(docRef);
};

export const batchAddVendasMotos = async (vendas: Omit<VendaMoto, 'id'>[]) => {
  const batch = writeBatch(db);
  const vendasCollection = collection(db, VENDAS_COLLECTION);
  
  vendas.forEach(venda => {
    const docRef = doc(vendasCollection); // Gera um novo ID de documento
    batch.set(docRef, venda);
  });

  return await batch.commit();
}
