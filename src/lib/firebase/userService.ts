import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './config';
import type { User } from 'firebase/auth';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'user' | 'viewer';
  createdAt: any;
  updatedAt: any;
  isActive: boolean;
  lastLogin?: any;
}

const USERS_COLLECTION = 'users';

export async function createUserProfile(user: User, additionalData: Partial<UserProfile> = {}): Promise<void> {
  if (!user) return;

  const userRef = doc(db, USERS_COLLECTION, user.uid);
  const userSnapshot = await getDoc(userRef);

  if (!userSnapshot.exists()) {
    const { displayName, email } = user;
    const createdAt = serverTimestamp();

    const userProfile: Omit<UserProfile, 'uid'> = {
      email: email || '',
      displayName: displayName || '',
      role: 'user',
      createdAt,
      updatedAt: createdAt,
      isActive: true,
      ...additionalData,
    };

    try {
      await setDoc(userRef, userProfile);
    } catch (error) {
      console.error('Erro ao criar perfil do usuário:', error);
      throw error;
    }
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const userSnapshot = await getDoc(userRef);

    if (userSnapshot.exists()) {
      return { uid, ...userSnapshot.data() } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error);
    throw error;
  }
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil do usuário:', error);
    throw error;
  }
}

export async function updateLastLogin(uid: string): Promise<void> {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(userRef, {
      lastLogin: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Erro ao atualizar último login:', error);
    throw error;
  }
}

export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const querySnapshot = await getDocs(usersRef);
    
    return querySnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    })) as UserProfile[];
  } catch (error) {
    console.error('Erro ao buscar todos os usuários:', error);
    throw error;
  }
}

export async function getActiveUsers(): Promise<UserProfile[]> {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, where('isActive', '==', true));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    })) as UserProfile[];
  } catch (error) {
    console.error('Erro ao buscar usuários ativos:', error);
    throw error;
  }
}

export async function deactivateUser(uid: string): Promise<void> {
  try {
    await updateUserProfile(uid, { isActive: false });
  } catch (error) {
    console.error('Erro ao desativar usuário:', error);
    throw error;
  }
}

export async function activateUser(uid: string): Promise<void> {
  try {
    await updateUserProfile(uid, { isActive: true });
  } catch (error) {
    console.error('Erro ao ativar usuário:', error);
    throw error;
  }
}