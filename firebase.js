import { initializeApp } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js';
import {
  addDoc, collection, deleteDoc, doc, getDocs, getFirestore, onSnapshot, orderBy,
  query, serverTimestamp, updateDoc
} from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyD0E49DtgOTDabsEUeLD8nqJ7Z1fCp6emg',
  authDomain: 'hekaya-store-ac7c5.firebaseapp.com',
  projectId: 'hekaya-store-ac7c5',
  storageBucket: 'hekaya-store-ac7c5.firebasestorage.app',
  messagingSenderId: '773590480196',
  appId: '1:773590480196:web:38d65c1e81d5563d639311',
  measurementId: 'G-BVTB51GQ7Q'
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const firebaseAuth = { onAuthStateChanged, signInWithEmailAndPassword, signOut };
export const ordersDb = { addDoc, collection, deleteDoc, doc, getDocs, getFirestore, onSnapshot, orderBy, query, serverTimestamp, updateDoc };
