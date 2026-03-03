/**
 * Login Page — Retro-futuristic authentication gate
 * Matches the WorldView Palantir-style aesthetic
 */

import { useState, type FormEvent } from 'react';
import {
  Radio, Shield, Eye, EyeOff, AlertTriangle,
  Fingerprint, Github, Mail, Lock, User,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const {
    signInWithGoogle,
    signInWithGitHub,
    signInWithEmail,
    signUpWithEmail,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'register') {
        if (!displayName.trim()) throw new Error('Callsign is required');
        await signUpWithEmail(email, password, displayName);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      // Clean up Firebase error messages
      setError(
        msg
          .replace('Firebase: ', '')
          .replace(/\(auth\/.*\)/, '')
          .trim() || 'Authentication failed',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    setError(null);
    setLoading(true);
    try {
      if (provider === 'google') await signInWithGoogle();
      else await signInWithGitHub();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'OAuth failed';
      setError(msg.replace('Firebase: ', '').replace(/\(auth\/.*\)/, '').trim() || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center relative overflow-hidden">
      {/* Animated grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(240,160,48,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(240,160,48,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Scanline effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
        }}
      />

      {/* Corner decorations */}
      <div className="absolute top-4 left-4 text-[8px] font-mono text-amber/20 tracking-[0.3em] uppercase">
        SYS.AUTH.MODULE
      </div>
      <div className="absolute top-4 right-4 text-[8px] font-mono text-amber/20 tracking-[0.3em] uppercase">
        {new Date().toISOString().replace('T', ' ').split('.')[0]}Z
      </div>
      <div className="absolute bottom-4 left-4 text-[8px] font-mono text-amber/20 tracking-[0.3em] uppercase">
        ENCRYPTION: AES-256-GCM
      </div>
      <div className="absolute bottom-4 right-4 text-[8px] font-mono text-amber/20 tracking-[0.3em] uppercase">
        CLEARANCE: PENDING
      </div>

      {/* Main login card */}
      <div className="relative w-full max-w-md mx-4">
        {/* Top classification bar */}
        <div className="bg-red-900/40 border border-red-500/20 px-4 py-1 text-center mb-0">
          <span className="text-[8px] font-mono tracking-[0.4em] text-red-400/70 uppercase">
            TOP SECRET // SI-TK // NOFORN
          </span>
        </div>

        {/* Card */}
        <div className="border border-amber/15 bg-surface-card/90 backdrop-blur-sm">
          {/* Header */}
          <div className="px-8 pt-8 pb-4 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Radio className="h-6 w-6 text-amber animate-blink-slow" />
              <div>
                <h1 className="text-xl font-display tracking-[0.25em] text-amber text-glow-amber uppercase">
                  WORLDVIEW
                </h1>
                <p className="text-[8px] font-mono tracking-[0.3em] text-amber/30 uppercase">
                  OSINT Intelligence Platform
                </p>
              </div>
              <Shield className="h-6 w-6 text-amber/40" />
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-amber/20 to-transparent my-4" />
            <p className="text-[10px] font-mono text-gray-500 tracking-wider">
              {mode === 'login' ? 'AUTHENTICATE TO ACCESS SYSTEM' : 'REGISTER NEW OPERATOR'}
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mx-6 mb-4 p-2.5 border border-red-500/30 bg-red-500/5 flex items-start gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-[9px] font-mono text-red-400">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 space-y-3">
            {/* Display name (register only) */}
            {mode === 'register' && (
              <div>
                <label className="block text-[8px] font-mono text-amber/40 tracking-[0.2em] uppercase mb-1">
                  Callsign
                </label>
                <div className="flex items-center gap-2 px-3 py-2 border border-amber/15 bg-surface focus-within:border-amber/40 transition">
                  <User className="h-3.5 w-3.5 text-amber/30" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="OPERATOR CALLSIGN"
                    className="flex-1 bg-transparent text-[11px] font-mono text-amber placeholder:text-gray-700 outline-none tracking-wider"
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-[8px] font-mono text-amber/40 tracking-[0.2em] uppercase mb-1">
                Operator ID
              </label>
              <div className="flex items-center gap-2 px-3 py-2 border border-amber/15 bg-surface focus-within:border-amber/40 transition">
                <Mail className="h-3.5 w-3.5 text-amber/30" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="operator@agency.gov"
                  required
                  className="flex-1 bg-transparent text-[11px] font-mono text-amber placeholder:text-gray-700 outline-none tracking-wider"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[8px] font-mono text-amber/40 tracking-[0.2em] uppercase mb-1">
                Access Code
              </label>
              <div className="flex items-center gap-2 px-3 py-2 border border-amber/15 bg-surface focus-within:border-amber/40 transition">
                <Lock className="h-3.5 w-3.5 text-amber/30" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  minLength={6}
                  className="flex-1 bg-transparent text-[11px] font-mono text-amber placeholder:text-gray-700 outline-none tracking-wider"
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-amber/30 hover:text-amber transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={clsx(
                'w-full py-2.5 border font-mono text-[11px] tracking-[0.2em] uppercase transition-all duration-200',
                loading
                  ? 'border-amber/20 bg-amber/5 text-amber/40 cursor-wait'
                  : 'border-amber/40 bg-amber/10 text-amber hover:bg-amber/20 hover:border-amber/60 hover:text-glow-amber',
              )}
            >
              <div className="flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border border-amber/40 border-t-amber" />
                    AUTHENTICATING...
                  </>
                ) : (
                  <>
                    <Fingerprint className="h-3.5 w-3.5" />
                    {mode === 'login' ? 'AUTHENTICATE' : 'CREATE IDENTITY'}
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Divider */}
          <div className="px-6 my-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-amber/10" />
              <span className="text-[8px] font-mono text-gray-700 tracking-[0.2em] uppercase">
                OR AUTHENTICATE VIA
              </span>
              <div className="flex-1 h-px bg-amber/10" />
            </div>
          </div>

          {/* OAuth buttons */}
          <div className="px-6 pb-6 flex gap-2">
            <button
              onClick={() => handleOAuth('google')}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2 border border-amber/15 bg-surface hover:bg-amber/5 hover:border-amber/30 transition text-[10px] font-mono text-gray-500 hover:text-amber tracking-wider"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              GOOGLE
            </button>
            <button
              onClick={() => handleOAuth('github')}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2 border border-amber/15 bg-surface hover:bg-amber/5 hover:border-amber/30 transition text-[10px] font-mono text-gray-500 hover:text-amber tracking-wider"
            >
              <Github className="h-3.5 w-3.5" />
              GITHUB
            </button>
          </div>

          {/* Toggle login/register */}
          <div className="border-t border-amber/10 px-6 py-3 text-center">
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}
              className="text-[9px] font-mono text-gray-600 hover:text-amber tracking-wider transition"
            >
              {mode === 'login'
                ? 'NEW OPERATOR? → CREATE IDENTITY'
                : 'EXISTING OPERATOR? → AUTHENTICATE'}
            </button>
          </div>
        </div>

        {/* Bottom classification bar */}
        <div className="bg-red-900/40 border border-red-500/20 border-t-0 px-4 py-1 text-center">
          <span className="text-[8px] font-mono tracking-[0.4em] text-red-400/70 uppercase">
            UNAUTHORIZED ACCESS IS A FEDERAL OFFENSE
          </span>
        </div>
      </div>
    </div>
  );
}
