import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword, signOut as fbSignOut, onAuthStateChanged, User } from 'firebase/auth';

interface AuthContextType {
  user: User | { email: string; displayName: string } | null;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  authLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | { email: string; displayName: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // Check local fallback admin session first
    const savedLocalSession = localStorage.getItem('dr_joshi_admin_session');
    if (savedLocalSession) {
      try {
        const parsed = JSON.parse(savedLocalSession);
        setUser(parsed);
      } catch (e) {
        // ignore
      }
    }

    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          setUser(firebaseUser);
        } else if (!localStorage.getItem('dr_joshi_admin_session')) {
          setUser(null);
        }
        setAuthLoading(false);
      });
      return () => unsubscribe();
    } else {
      setAuthLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    // Default required credentials: admin@prem / Prem@admin
    const isDefaultAdmin = (cleanEmail === 'admin@prem' || cleanEmail === 'admin@prem.com' || cleanEmail === 'drpremrajjoshi@gmail.com') && cleanPass === 'Prem@admin';

    if (isDefaultAdmin) {
      const adminObj = {
        email: 'admin@prem',
        displayName: 'Dr. Prem Raj Joshi (Admin)'
      };
      setUser(adminObj);
      localStorage.setItem('dr_joshi_admin_session', JSON.stringify(adminObj));
      return { success: true };
    }

    // Try Firebase Auth if configured
    if (auth) {
      try {
        const res = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
        setUser(res.user);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'Invalid email or password' };
      }
    }

    return { success: false, error: 'Invalid credentials. Default: admin@prem / Prem@admin' };
  };

  const logout = async () => {
    localStorage.removeItem('dr_joshi_admin_session');
    setUser(null);
    if (auth) {
      try {
        await fbSignOut(auth);
      } catch (e) {
        // ignore
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: !!user,
        login,
        logout,
        authLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
