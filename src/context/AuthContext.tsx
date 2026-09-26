import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  limit,
  query,
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  hasAnyAdmin: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string) => Promise<{ wasFirstAdmin: boolean }>;
  logout: () => Promise<void>;
  refreshAdminStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SUPER_ADMIN_EMAIL = 'mdmahburrahman323@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasAnyAdmin, setHasAnyAdmin] = useState<boolean>(true);

  // Check if there are any admins in the system
  const checkHasAnyAdmin = async (): Promise<boolean> => {
    try {
      const adminCol = collection(db, 'admins');
      const snap = await getDocs(query(adminCol, limit(1)));
      const exists = !snap.empty;
      setHasAnyAdmin(exists);
      return exists;
    } catch {
      // If error (e.g. security rules deny listing admins), fallback
      return true;
    }
  };

  const evaluateAdminRole = async (currentUser: User | null) => {
    if (!currentUser) {
      setIsAdmin(false);
      return;
    }

    try {
      // Super admin email bypass
      if (currentUser.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
        setIsAdmin(true);
        // Ensure doc exists
        await setDoc(
          doc(db, 'admins', currentUser.uid),
          { email: currentUser.email, role: 'admin', createdAt: Date.now() },
          { merge: true }
        ).catch(() => {});
        return;
      }

      // Check admins/{uid} document
      const adminDocRef = doc(db, 'admins', currentUser.uid);
      const adminSnap = await getDoc(adminDocRef);

      if (adminSnap.exists() && adminSnap.data()?.role === 'admin') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch {
      // Fallback
      if (currentUser.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    }
  };

  useEffect(() => {
    checkHasAnyAdmin().catch(() => {});

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      await evaluateAdminRole(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, pass: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    await evaluateAdminRole(cred.user);
  };

  const signUp = async (email: string, pass: string): Promise<{ wasFirstAdmin: boolean }> => {
    // Check if system has any admin before creation
    const alreadyHasAdmin = await checkHasAnyAdmin();
    const isOwnerEmail = email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    let wasFirst = false;

    // Rule: When the application has no Admin yet: The FIRST successfully registered Firebase email/password account becomes the initial Admin.
    if (!alreadyHasAdmin || isOwnerEmail) {
      try {
        await setDoc(doc(db, 'admins', cred.user.uid), {
          email: cred.user.email,
          role: 'admin',
          createdAt: Date.now(),
        });
        setIsAdmin(true);
        setHasAnyAdmin(true);
        wasFirst = true;
      } catch (err) {
        console.error('Failed to set initial admin doc:', err);
      }
    } else {
      setIsAdmin(false);
    }

    return { wasFirstAdmin: wasFirst };
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setIsAdmin(false);
  };

  const refreshAdminStatus = async () => {
    if (auth.currentUser) {
      await evaluateAdminRole(auth.currentUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        hasAnyAdmin,
        signIn,
        signUp,
        logout,
        refreshAdminStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
