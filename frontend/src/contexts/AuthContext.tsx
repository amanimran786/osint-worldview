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

/* ─── Authorized Operators (SHA-256 hashed for security) ─── */
// To add a new operator, hash their lowercase email with SHA-256 and add it here.
// Generate: echo -n "email@example.com" | shasum -a 256
const ALLOWED_HASHES = new Set([
  '3cef0b7e144607189ebfc695fa393a04c4f1e6e418cdafb51c2dfc13e39ce5a8',
  'bb8defcf84e250fbcdd91bd7b7f7786881841a1f9f9580a56caeb5d41f6e70db',
  'c81b6b0a8e64f9a5e925bee8b0de7dbb08ca8f6137b2323546d4dade66d0ab2e',
]);

/** Hash an email with SHA-256 using the Web Crypto API */
async function hashEmail(email: string): Promise<string> {
  const data = new TextEncoder().encode(email.toLowerCase().trim());
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Check if an email is on the allowlist. Empty set = allow everyone. */
async function isEmailAllowed(email: string | null | undefined): Promise<boolean> {
  if (ALLOWED_HASHES.size === 0) return true;
  if (!email) return false;
  const hash = await hashEmail(email);
  return ALLOWED_HASHES.has(hash);
}

/* ─── Types ─── */
interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  openAIKey: string;
  setOpenAIKey: (key: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/* ─── Storage keys ─── */
const OPENAI_KEY_STORAGE = 'wv_openai_key';

/* ─── Provider ─── */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [openAIKey, setOpenAIKeyState] = useState(() =>
    localStorage.getItem(OPENAI_KEY_STORAGE) ?? '',
  );

  // Persist OpenAI key to localStorage
  const setOpenAIKey = useCallback((key: string) => {
    setOpenAIKeyState(key);
    if (key) localStorage.setItem(OPENAI_KEY_STORAGE, key);
    else localStorage.removeItem(OPENAI_KEY_STORAGE);
  }, []);

  // Listen to Firebase auth state
  useEffect(() => {
    if (!isFirebaseConfigured) {
      // Firebase not configured — no one gets in
      setUser(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && !(await isEmailAllowed(firebaseUser.email))) {
        // User authenticated but not on the allowlist — kick them out
        await signOut(auth);
        setUser(null);
        setLoading(false);
        return;
      }
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  /* ─── Auth methods ─── */
  const signInWithGoogle = useCallback(async () => {
    if (!isFirebaseConfigured) {
      throw new Error('ACCESS DENIED — System not configured. Contact administrator.');
    }
    const cred = await signInWithPopup(auth, googleProvider);
    if (!(await isEmailAllowed(cred.user.email))) {
      await signOut(auth);
      throw new Error('ACCESS DENIED — Your account is not authorized for this system.');
    }
  }, []);

  const signInWithGitHub = useCallback(async () => {
    if (!isFirebaseConfigured) {
      throw new Error('ACCESS DENIED — System not configured. Contact administrator.');
    }
    const cred = await signInWithPopup(auth, githubProvider);
    if (!(await isEmailAllowed(cred.user.email))) {
      await signOut(auth);
      throw new Error('ACCESS DENIED — Your account is not authorized for this system.');
    }
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (!isFirebaseConfigured) {
      throw new Error('ACCESS DENIED — System not configured. Contact administrator.');
    }
    if (!(await isEmailAllowed(email))) {
      throw new Error('ACCESS DENIED — Your account is not authorized for this system.');
    }
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string, displayName: string) => {
    if (!isFirebaseConfigured) {
      throw new Error('ACCESS DENIED — System not configured. Contact administrator.');
    }
    if (!(await isEmailAllowed(email))) {
      throw new Error('ACCESS DENIED — Registration is restricted to authorized operators only.');
    }
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
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
