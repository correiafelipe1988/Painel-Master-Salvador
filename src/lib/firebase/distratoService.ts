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

const DISTRATOS_COLLECTION = "distratos";

export interface DistratoData {
  id?: string;
  placa: string;
  franqueado: string;
  inicio_ctt: string; // Data formato DD/MM/YYYY
  fim_ctt: string;     // Data formato DD/MM/YYYY
  motivo: string;      // Motivo completo/detalhado
  causa: string;       // Causa resumida/categoria
}

// Adicionar um novo distrato
export const addDistrato = async (distratoData: Omit<DistratoData, 'id'>) => {
  try {
    const docRef = await addDoc(
      collection(db, DISTRATOS_COLLECTION),
      distratoData
    );
    return docRef.id;
  } catch (e) {
    console.error("Erro ao adicionar distrato: ", e);
    return null;
  }
};

// Obter todos os distratos
export const getDistratos = async () => {
  try {
    const querySnapshot = await getDocs(
      collection(db, DISTRATOS_COLLECTION)
    );
    const distratos = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return distratos;
  } catch (e) {
    console.error("Erro ao obter distratos: ", e);
    return [];
  }
};

// Atualizar um distrato
export const updateDistrato = async (id: string, distratoData: Partial<DistratoData>) => {
  try {
    const distratoRef = doc(db, DISTRATOS_COLLECTION, id);
    await updateDoc(distratoRef, distratoData);
    return true;
  } catch (e) {
    console.error("Erro ao atualizar distrato: ", e);
    return false;
  }
};

// Excluir um distrato
export const deleteDistrato = async (id: string) => {
  try {
    const distratoRef = doc(db, DISTRATOS_COLLECTION, id);
    await deleteDoc(distratoRef);
    return true;
  } catch (e) {
    console.error("Erro ao excluir distrato: ", e);
    return false;
  }
};

// Ouvir alterações em tempo real
export const subscribeToDistratos = (callback: (distratos: DistratoData[]) => void) => {
  const q = collection(db, DISTRATOS_COLLECTION);
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const distratos = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as DistratoData[];
    callback(distratos);
  });
  return unsubscribe;
};

// Importação em lote
export const importDistratosBatch = async (distratos: Omit<DistratoData, 'id'>[]) => {
  const batch = writeBatch(db);
  const distratosCollection = collection(db, DISTRATOS_COLLECTION);

  distratos.forEach((distratoData) => {
    const docRef = doc(distratosCollection); 
    batch.set(docRef, distratoData);
  });

  try {
    await batch.commit();
    console.log("Lote de distratos importado com sucesso!");
    return { success: true, message: "Lote de distratos importado com sucesso!" };
  } catch (error) {
    console.error("Erro ao importar lote de distratos:", error);
    
    if (error instanceof Error) {
      throw new Error(`Falha na importação em lote: ${error.message}`);
    } else {
      throw new Error("Ocorreu um erro desconhecido durante a importação em lote.");
    }
  }
};

// Deletar todos os distratos em lote
export const deleteAllDistratosBatch = async () => {
  try {
    // Primeiro, buscar todos os documentos
    const querySnapshot = await getDocs(collection(db, DISTRATOS_COLLECTION));
    
    if (querySnapshot.empty) {
      return { success: true, message: "Nenhum distrato encontrado para deletar." };
    }

    // Criar batch para deletar
    const batch = writeBatch(db);
    
    querySnapshot.docs.forEach((document) => {
      batch.delete(document.ref);
    });

    // Executar batch delete
    await batch.commit();
    
    console.log(`${querySnapshot.size} distratos deletados com sucesso!`);
    return { success: true, message: `${querySnapshot.size} distratos deletados com sucesso!`, count: querySnapshot.size };
  } catch (error) {
    console.error("Erro ao deletar distratos em lote:", error);
    
    if (error instanceof Error) {
      throw new Error(`Falha na exclusão em lote: ${error.message}`);
    } else {
      throw new Error("Ocorreu um erro desconhecido durante a exclusão em lote.");
    }
  }
};