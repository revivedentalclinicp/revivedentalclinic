import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged, signInWithPopup, updateProfile,
} from 'firebase/auth';
import { auth, googleProvider, db } from '../firebase/config';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext();
export function useAuth() { return useContext(AuthContext); }

// Admin whitelist
const ADMIN_EMAILS = [
  'revivedentalclinicdigital@gmail.com',
  'revivedentalclinic@gmail.com',
];

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Register patient
  async function signup(email, password, name) {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(res.user, { displayName: name });
    await setDoc(doc(db, 'users', res.user.uid), {
      uid: res.user.uid,
      name,
      email,
      role: 'patient',
      createdAt: serverTimestamp(),
    });
    return res;
  }

  // Login (both patient and admin)
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Google OAuth
  async function loginWithGoogle() {
    const res = await signInWithPopup(auth, googleProvider);
    const userDoc = await getDoc(doc(db, 'users', res.user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', res.user.uid), {
        uid: res.user.uid,
        name: res.user.displayName,
        email: res.user.email,
        role: 'patient',
        createdAt: serverTimestamp(),
      });
    }
    return res;
  }

  // Check if user is admin
  async function checkAdminStatus(user) {
    if (!user) { setIsAdmin(false); return false; }
    if (ADMIN_EMAILS.includes(user.email?.toLowerCase())) {
      setIsAdmin(true);
      return true;
    }
    // Also check Firestore users collection
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists() && userDoc.data().role === 'admin') {
        setIsAdmin(true);
        return true;
      }
    } catch (e) { /* ignore */ }
    setIsAdmin(false);
    return false;
  }

  function logout() { return signOut(auth); }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await checkAdminStatus(user);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const value = { currentUser, isAdmin, signup, login, loginWithGoogle, logout, checkAdminStatus };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
