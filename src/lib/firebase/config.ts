// src/lib/firebase/config.ts
import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
// Para autenticação futura: import { getAuth, type Auth } from "firebase/auth";

// Suas variáveis de ambiente devem ser configuradas em um arquivo .env.local
// Veja .env.example para o formato
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let db: Firestore;
// let auth: Auth; // Para autenticação futura

if (getApps().length) {
  app = getApp();
} else {
  app = initializeApp(firebaseConfig);
}

db = getFirestore(app);
// auth = getAuth(app); // Para autenticação futura

export { app, db /*, auth */ };
