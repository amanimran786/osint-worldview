/**
 * Auth Context — React context + provider for Firebase Authentication
 *
 * Provides:
 *  - user: current Firebase user (or null)
 *  - loading: true while auth state is being resolved
 *  - signInWithGoogle / signInWithGitHub / signInWithEmail / signUpWithEmail
 *  - logout
 *  - openAIKey / setOpenAIKey: per-user OpenAI API key storage
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { auth, googleProvider, githubProvider, isFirebaseConfigured } from '../lib/firebase';

/* ─── Types ─── */
interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isDemo: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  openAIKey: string;
  setOpenAIKey: (key: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/* ─── Demo user for when Firebase isn't configured ─── */
const DEMO_USER = {
  uid: 'demo-user-001',
  email: 'operator@worldview.osint',
  displayName: 'OSINT Operator',
  photoURL: null,
  emailVerified: true,
} as unknown as User;

/* ─── Storage keys ─── */
const OPENAI_KEY_STORAGE = 'wv_openai_key';
const DEMO_AUTH_STORAGE  = 'wv_demo_authenticated';

/* ─── Provider ─── */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [openAIKey, setOpenAIKeyState] = useState(() =>
    localStorage.getItem(OPENAI_KEY_STORAGE) ?? '',
  );
  const isDemo = !isFirebaseConfigured;

  // Persist OpenAI key to localStorage
  const setOpenAIKey = useCallback((key: string) => {
    setOpenAIKeyState(key);
    if (key) localStorage.setItem(OPENAI_KEY_STORAGE, key);
    else localStorage.removeItem(OPENAI_KEY_STORAGE);
  }, []);

  // Listen to Firebase auth state
  useEffect(() => {
    if (isDemo) {
      // Demo mode — check if user previously "logged in"
      const wasAuthenticated = localStorage.getItem(DEMO_AUTH_STORAGE);
      if (wasAuthenticated === 'true') {
        setUser(DEMO_USER);
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, [isDemo]);

  /* ─── Auth methods ─── */
  const signInWithGoogle = useCallback(async () => {
    if (isDemo) {
      localStorage.setItem(DEMO_AUTH_STORAGE, 'true');
      setUser(DEMO_USER);
      return;
    }
    await signInWithPopup(auth, googleProvider);
  }, [isDemo]);

  const signInWithGitHub = useCallback(async () => {
    if (isDemo) {
      localStorage.setItem(DEMO_AUTH_STORAGE, 'true');
      setUser(DEMO_USER);
      return;
    }
    await signInWithPopup(auth, githubProvider);
  }, [isDemo]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (isDemo) {
      localStorage.setItem(DEMO_AUTH_STORAGE, 'true');
      setUser(DEMO_USER);
      return;
    }
    await signInWithEmailAndPassword(auth, email, password);
  }, [isDemo]);

  const signUpWithEmail = useCallback(async (email: string, password: string, displayName: string) => {
    if (isDemo) {
      localStorage.setItem(DEMO_AUTH_STORAGE, 'true');
      setUser(DEMO_USER);
      return;
    }
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
  }, [isDemo]);

  const logout = useCallback(async () => {
    if (isDemo) {
      localStorage.removeItem(DEMO_AUTH_STORAGE);
      setUser(null);
      return;
    }
    await signOut(auth);
  }, [isDemo]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isDemo,
        signInWithGoogle,
        signInWithGitHub,
        signInWithEmail,
        signUpWithEmail,
        logout,
        openAIKey,
        setOpenAIKey,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/** Hook to access auth context — throws if used outside AuthProvider */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
