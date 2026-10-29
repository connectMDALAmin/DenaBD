import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  deleteDoc,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';

// Load config from firebase-applet-config.json
export const firebaseConfig = {
  projectId: "gen-lang-client-0521177835",
  appId: "1:201251377806:web:a80cbecd2ccaf94bfaafdf",
  apiKey: "AIzaSyD1JFBEwjg3FFZ2vlwViNF_EcwrgCaQWvM",
  authDomain: "gen-lang-client-0521177835.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-pawna-cbcff9c8-de63-455d-9cbe-7e53a42a98e3",
  storageBucket: "gen-lang-client-0521177835.firebasestorage.app",
  messagingSenderId: "201251377806",
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore with robust local persistent cache for offline-first support
let dbInstance: Firestore;
try {
  dbInstance = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  }, firebaseConfig.firestoreDatabaseId);
} catch (e) {
  dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}

export const firestore = dbInstance;
