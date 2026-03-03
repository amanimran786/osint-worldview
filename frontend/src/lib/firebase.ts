/**
 * Firebase Configuration — OSINT WorldView
 *
 * To set up your own Firebase project:
 * 1. Go to https://console.firebase.google.com
 * 2. Create a new project (e.g., "osint-worldview")
 * 3. Enable Authentication → Sign-in methods → Email/Password & Google
 * 4. Go to Project Settings → General → Your apps → Add web app
 * 5. Copy the config values into your .env file (see .env.example)
 *
 * Environment variables (set in Vercel dashboard for production):
 *   VITE_FIREBASE_API_KEY
 *   VITE_FIREBASE_AUTH_DOMAIN
 *   VITE_FIREBASE_PROJECT_ID
 *   VITE_FIREBASE_STORAGE_BUCKET
 *   VITE_FIREBASE_MESSAGING_SENDER_ID
 *   VITE_FIREBASE_APP_ID
 */

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || 'demo-api-key',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || 'demo.firebaseapp.com',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || 'demo-project',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || 'demo.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || '1:000:web:000',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

/** Check if Firebase is configured with real credentials */
export const isFirebaseConfigured = firebaseConfig.apiKey !== 'demo-api-key';
