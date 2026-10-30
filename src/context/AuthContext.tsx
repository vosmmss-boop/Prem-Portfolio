import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, ensureFirebaseAdminAuth } from '../services/firebase';
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
    // Purge old persistent localStorage admin session to ensure visitors are prompted for password
    try {
      localStorage.removeItem('dr_joshi_admin_session');
    } catch {
      // ignore
    }

    // Check active sessionStorage for current tab session
    try {
      const savedSession = sessionStorage.getItem('dr_joshi_admin_session');
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        setUser(parsed);
        ensureFirebaseAdminAuth().catch(() => {});
      }
    } catch {
      // ignore
    }

    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          setUser(firebaseUser);
        } else if (!sessionStorage.getItem('dr_joshi_admin_session')) {
          setUser(null);
        }
        setAuthLoading(false);
      });
      return () => unsubscribe();
    } else {
      setAuthLoading(false);
    }
  }, []);

  const login = async (usernameOrEmail: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const cleanUser = usernameOrEmail.trim().toLowerCase();
    const cleanPass = pass.trim();

    // Required credentials for both CMS and Inquiries Portal:
    // Username: webadmin_prem
    // Password: DrPrem@123
    const isAuthorizedAdmin =
      (cleanUser === 'webadmin_prem' || cleanUser === 'webadmin_prem@gmail.com') &&
      cleanPass === 'DrPrem@123';

    if (isAuthorizedAdmin) {
      const adminObj = {
        email: 'webadmin_prem@drpremrajjoshi.com.np',
        displayName: 'Dr. Prem Raj Joshi (Admin Desk)'
      };
      setUser(adminObj);
      sessionStorage.setItem('dr_joshi_admin_session', JSON.stringify(adminObj));
      await ensureFirebaseAdminAuth().catch(() => {});
      return { success: true };
    }

    // Fallback attempt to Firebase Auth if configured for this account
    if (auth && cleanUser.includes('@')) {
      try {
        const res = await signInWithEmailAndPassword(auth, cleanUser, cleanPass);
        setUser(res.user);
        sessionStorage.setItem('dr_joshi_admin_session', JSON.stringify({
          email: res.user.email || cleanUser,
          displayName: res.user.displayName || 'Authorized Admin'
        }));
        return { success: true };
      } catch (err: any) {
        return {
          success: false,
          error: 'Invalid credentials. Access restricted to authorized medical desk.'
        };
      }
    }

    return {
      success: false,
      error: 'Invalid credentials. Please enter the correct Username and Password.'
    };
  };

  const logout = async () => {
    try {
      sessionStorage.removeItem('dr_joshi_admin_session');
      localStorage.removeItem('dr_joshi_admin_session');
    } catch {
      // ignore
    }
    setUser(null);
    if (auth) {
      try {
        await fbSignOut(auth);
      } catch {
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
