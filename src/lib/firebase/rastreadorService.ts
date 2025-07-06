
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  writeBatch,
} from "firebase/firestore";
import { db } from "./config";

const RASTREADORES_COLLECTION = "rastreadores";

export interface RastreadorData {
  id?: string;
  cnpj: string;
  empresa: string;
  franqueado: string;
  chassi: string;
  placa: string;
  rastreador: string;
  tipo: string;
  moto: string;
  mes: string;
  valor: string;
}

// Adicionar um novo rastreador
export const addRastreador = async (rastreadorData: any) => {
  try {
    const docRef = await addDoc(
      collection(db, RASTREADORES_COLLECTION),
      rastreadorData
    );
    return docRef.id;
  } catch (e) {
    console.error("Erro ao adicionar rastreador: ", e);
    return null;
  }
};

// Obter todos os rastreadores
export const getRastreadores = async () => {
  try {
    const querySnapshot = await getDocs(
      collection(db, RASTREADORES_COLLECTION)
    );
    const rastreadores = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return rastreadores;
  } catch (e) {
    console.error("Erro ao obter rastreadores: ", e);
    return [];
  }
};

// Atualizar um rastreador
export const updateRastreador = async (id: string, rastreadorData: any) => {
  try {
    const rastreadorRef = doc(db, RASTREADORES_COLLECTION, id);
    await updateDoc(rastreadorRef, rastreadorData);
    return true;
  } catch (e) {
    console.error("Erro ao atualizar rastreador: ", e);
    return false;
  }
};

// Excluir um rastreador
export const deleteRastreador = async (id: string) => {
  try {
    const rastreadorRef = doc(db, RASTREADORES_COLLECTION, id);
    await deleteDoc(rastreadorRef);
    return true;
  } catch (e) {
    console.error("Erro ao excluir rastreador: ", e);
    return false;
  }
};

// Ouvir alterações em tempo real
export const subscribeToRastreadores = (callback: (rastreadores: any[]) => void) => {
  const q = collection(db, RASTREADORES_COLLECTION);
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const rastreadores = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(rastreadores);
  });
  return unsubscribe;
};

export const importRastreadoresBatch = async (rastreadores: Omit<RastreadorData, 'id'>[]) => {
  const batch = writeBatch(db);
  const rastreadoresCollection = collection(db, RASTREADORES_COLLECTION);

  rastreadores.forEach((rastreadorData) => {
    const docRef = doc(rastreadoresCollection); 
    batch.set(docRef, rastreadorData);
  });

  try {
    await batch.commit();
    console.log("Lote de rastreadores importado com sucesso!");
    return { success: true, message: "Lote de rastreadores importado com sucesso!" };
  } catch (error) {
    console.error("Erro ao importar lote de rastreadores:", error);
    
    if (error instanceof Error) {
      throw new Error(`Falha na importação em lote: ${error.message}`);
    } else {
      throw new Error("Ocorreu um erro desconhecido durante a importação em lote.");
    }
  }
};
