import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged, signInWithPopup, updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, googleProvider, db } from '../firebase/config';
import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';

const AuthContext = createContext();
export function useAuth() { return useContext(AuthContext); }

// Admin whitelist — all three clinic emails
const ADMIN_EMAILS = [
  'revivedentalclinicdigital@gmail.com',
  'revivedentalclinic@gmail.com',
  'revivedentalclinicp@gmail.com',
];

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://revivedentalbackend.onrender.com';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null); // includes phone, etc.
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // ── Register (email/password) ──────────────────────────────────
  async function signup(email, password, name, phone) {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(res.user, { displayName: name });
    
    const collectionName = ADMIN_EMAILS.includes(email.toLowerCase()) ? 'admins' : 'users';
    
    await setDoc(doc(db, collectionName, res.user.uid), {
      uid: res.user.uid,
      name,
      email,
      phone: phone || '',
      createdAt: serverTimestamp(),
    });
    return res;
  }

  // ── Login (patient & admin share same Firebase Auth) ──────────
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // ── Google OAuth ───────────────────────────────────────────────
  async function loginWithGoogle() {
    const res = await signInWithPopup(auth, googleProvider);
    const collectionName = ADMIN_EMAILS.includes(res.user.email?.toLowerCase()) ? 'admins' : 'users';
    const userDoc = await getDoc(doc(db, collectionName, res.user.uid));
    const isNewUser = !userDoc.exists();

    if (isNewUser) {
      await setDoc(doc(db, collectionName, res.user.uid), {
        uid: res.user.uid,
        name: res.user.displayName,
        email: res.user.email,
        phone: '',
        createdAt: serverTimestamp(),
      });
      // Send welcome email to new Google users
      try {
        await fetch(`${BACKEND_URL}/api/email/welcome`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userEmail: res.user.email,
            userName: res.user.displayName,
          }),
        });
      } catch (e) { /* ignore email errors */ }
    }
    return res;
  }

  // ── Check if user is admin ─────────────────────────────────────
  async function checkAdminStatus(user) {
    if (!user) { setIsAdmin(false); return false; }
    try {
      const adminDoc = await getDoc(doc(db, 'admins', user.uid));
      if (adminDoc.exists() || ADMIN_EMAILS.includes(user.email?.toLowerCase())) {
        setIsAdmin(true);
        return true;
      }
      
      if (user.email) {
        const q = query(collection(db, 'admins'), where('email', '==', user.email.toLowerCase()));
        const adminSnaps = await getDocs(q);
        if (!adminSnaps.empty) {
          setIsAdmin(true);
          return true;
        }
      }
    } catch (e) { /* ignore */ }
    setIsAdmin(false);
    return false;
  }

  // ── Check if user is standard patient ─────────────────────────
  async function checkUserStatus(user) {
    if (!user) return false;
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        return true;
      }
      
      if (user.email) {
        const q = query(collection(db, 'users'), where('email', '==', user.email.toLowerCase()));
        const userSnaps = await getDocs(q);
        if (!userSnaps.empty) {
          return true;
        }
      }
    } catch (e) { /* ignore */ }
    return false;
  }

  // ── Admin forgot password (validates against whitelist) ────────
  async function sendAdminPasswordReset(email) {
    const normalised = email.toLowerCase().trim();
    if (!ADMIN_EMAILS.includes(normalised)) {
      throw new Error('This email is not registered as an admin account.');
    }
    await sendPasswordResetEmail(auth, normalised);
  }

  // ── Orphan Account Healing ─────────────────────────────────────
  async function promoteToAdmin(user) {
    await setDoc(doc(db, 'admins', user.uid), {
      uid: user.uid,
      name: user.displayName || 'Admin',
      email: user.email,
      createdAt: serverTimestamp(),
    });
  }

  async function promoteToUser(user) {
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      name: user.displayName || 'Patient',
      email: user.email,
      phone: '',
      createdAt: serverTimestamp(),
    });
  }

  // ── Load user profile (phone etc.) from Firestore ─────────────
  async function loadUserProfile(uid, email) {
    try {
      let snap = await getDoc(doc(db, 'users', uid));
      if (!snap.exists()) snap = await getDoc(doc(db, 'admins', uid));
      if (snap.exists()) {
        setUserProfile(snap.data());
        return;
      }
      
      if (email) {
        const qUser = query(collection(db, 'users'), where('email', '==', email.toLowerCase()));
        const snapUser = await getDocs(qUser);
        if (!snapUser.empty) {
          setUserProfile(snapUser.docs[0].data());
          return;
        }
        
        const qAdmin = query(collection(db, 'admins'), where('email', '==', email.toLowerCase()));
        const snapAdmin = await getDocs(qAdmin);
        if (!snapAdmin.empty) {
          setUserProfile(snapAdmin.docs[0].data());
        }
      }
    } catch (e) { /* ignore */ }
  }

  function logout() {
    setUserProfile(null);
    return signOut(auth);
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await checkAdminStatus(user);
        await loadUserProfile(user.uid, user.email);
      } else {
        setIsAdmin(false);
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const value = {
    currentUser,
    userProfile,
    isAdmin,
    signup,
    login,
    loginWithGoogle,
    logout,
    checkAdminStatus,
    checkUserStatus,
    promoteToAdmin,
    promoteToUser,
    sendAdminPasswordReset,
    ADMIN_EMAILS,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
