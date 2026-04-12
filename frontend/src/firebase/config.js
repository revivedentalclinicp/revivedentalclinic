import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCbFCBv9UD096gTCfo6LCjW0_lADieUBss",
  authDomain: "revive-dental-clinic.firebaseapp.com",
  projectId: "revive-dental-clinic",
  storageBucket: "revive-dental-clinic.firebasestorage.app",
  messagingSenderId: "740604655052",
  appId: "1:740604655052:web:0de318b94eddf6a9ef1969",
  measurementId: "G-KB2LQJMRPF"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
