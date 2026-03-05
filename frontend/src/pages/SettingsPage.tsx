/**
 * Settings Page — Operator profile, API keys, and configuration
 */

import { useState } from 'react';
import {
  User, Key, Eye, EyeOff, Shield, LogOut, Save, Check,
  AlertTriangle, Zap, Settings, ExternalLink, Copy,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../contexts/AuthContext';

export function SettingsPage() {
  const { user, logout, openAIKey, setOpenAIKey } = useAuth();
  const [keyInput, setKeyInput] = useState(openAIKey);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [testing, setTesting] = useState(false);

  /** Validate key against OpenAI API, then persist if valid */
  const handleSaveKey = async () => {
    const key = keyInput.trim();
    if (!key) {
      setTestResult({ ok: false, msg: 'No API key provided' });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${key}` },
      });
      if (res.ok) {
        setOpenAIKey(key);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        setTestResult({ ok: true, msg: 'API key verified & saved — AI features are now active across all pages' });
      } else {
        const data = await res.json().catch(() => ({}));
        setTestResult({
          ok: false,
          msg: data?.error?.message || `HTTP ${res.status}: Invalid API key — not saved`,
        });
      }
    } catch {
      setTestResult({ ok: false, msg: 'Network error — could not reach OpenAI. Key not saved.' });
    } finally {
      setTesting(false);
    }
  };

  /** Quick test without saving */
  const handleTestKey = async () => {
    const key = keyInput.trim();
    if (!key) {
      setTestResult({ ok: false, msg: 'No API key provided' });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${key}` },
      });
      if (res.ok) {
        setTestResult({ ok: true, msg: 'API key is valid — click "Save Key" to activate AI features' });
      } else {
        const data = await res.json().catch(() => ({}));
        setTestResult({
          ok: false,
          msg: data?.error?.message || `HTTP ${res.status}: Invalid API key`,
        });
      }
    } catch {
      setTestResult({ ok: false, msg: 'Network error — could not reach OpenAI' });
    } finally {
      setTesting(false);
    }
  };

  /* ── Derive display info ── */
  const maskedKey = openAIKey
    ? `${openAIKey.slice(0, 7)}${'•'.repeat(Math.max(0, openAIKey.length - 11))}${openAIKey.slice(-4)}`
    : '';
  const keyIsStored = openAIKey.length > 0;

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-amber/10 bg-surface-card/50 px-6 py-5">
        <div className="flex items-center gap-3">
          <Settings className="h-5 w-5 text-amber" />
          <div>
            <h1 className="text-sm font-display tracking-[0.2em] text-amber text-glow-amber uppercase">
              System Configuration
            </h1>
            <p className="text-[9px] font-mono text-gray-600 tracking-wider mt-0.5">
              OPERATOR PROFILE · API KEYS · PREFERENCES
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {/* ═══════ OPERATOR PROFILE ═══════ */}
        <section className="border border-amber/10 bg-surface-card">
          <div className="px-4 py-3 border-b border-amber/10 flex items-center gap-2">
            <User className="h-4 w-4 text-amber/60" />
            <h2 className="text-[11px] font-mono font-bold tracking-[0.15em] text-amber uppercase">
              Operator Profile
            </h2>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="h-14 w-14 rounded-full border-2 border-amber/30 bg-amber/10 flex items-center justify-center flex-shrink-0">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Avatar"
                    className="h-full w-full rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <User className="h-6 w-6 text-amber/60" />
                )}
              </div>
              <div className="space-y-1">
                <div className="text-[12px] font-mono font-semibold text-amber tracking-wider">
                  {user?.displayName || 'OPERATOR'}
                </div>
                <div className="text-[10px] font-mono text-gray-500">
                  {user?.email || 'No email'}
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-tactical-green" />
                  <span className="text-[8px] font-mono text-tactical-green/70 tracking-wider uppercase">
                    AUTHENTICATED
                  </span>
                </div>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 border border-red-500/20 text-[9px] font-mono text-red-400/70 hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/5 transition tracking-wider uppercase"
            >
              <LogOut className="h-3 w-3" />
              TERMINATE SESSION
            </button>
          </div>
        </section>

        {/* ═══════ OPENAI API KEY ═══════ */}
        <section className="border border-amber/10 bg-surface-card">
          <div className="px-4 py-3 border-b border-amber/10 flex items-center gap-2">
            <Key className="h-4 w-4 text-amber/60" />
            <h2 className="text-[11px] font-mono font-bold tracking-[0.15em] text-amber uppercase">
              OpenAI API Key
            </h2>
          </div>
          <div className="p-4 space-y-4">
            {/* Info banner */}
            <div className="p-3 border border-amber/15 bg-amber/5 space-y-2">
              <div className="flex items-start gap-2">
                <Zap className="h-3.5 w-3.5 text-amber/60 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-[9px] font-mono font-bold text-amber/70 tracking-wider uppercase">
                    AI-Powered OSINT Analysis
                  </p>
                  <p className="text-[8px] font-mono text-amber/50 leading-relaxed">
                    Your OpenAI API key enables AI threat analysis, signal summarization,
                    entity extraction, and automated intelligence reports. The key is stored
                    locally in your browser — it is never sent to our servers.
                  </p>
                </div>
              </div>
            </div>

            {/* Key input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[8px] font-mono text-amber/40 tracking-[0.2em] uppercase">
                  API Key
                </label>
                {keyIsStored && (
                  <span className="flex items-center gap-1 text-[8px] font-mono text-tactical-green tracking-wider">
                    <span className="h-1.5 w-1.5 rounded-full bg-tactical-green animate-pulse" />
                    ACTIVE — {maskedKey.slice(0, 12)}…
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 px-3 py-2 border border-amber/15 bg-surface focus-within:border-amber/40 transition">
                <Key className="h-3.5 w-3.5 text-amber/30 flex-shrink-0" />
                <input
                  type={showKey ? 'text' : 'password'}
                  value={keyInput}
                  onChange={e => { setKeyInput(e.target.value); setSaved(false); setTestResult(null); }}
                  onFocus={() => setShowKey(true)}
                  placeholder="sk-proj-..."
                  className="flex-1 bg-transparent text-[11px] font-mono text-amber placeholder:text-gray-700 outline-none tracking-wider"
                  autoComplete="off"
                  spellCheck={false}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="text-amber/30 hover:text-amber transition"
                  aria-label={showKey ? 'Hide key' : 'Show key'}
                >
                  {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
              <p className="text-[8px] font-mono text-gray-700 mt-1.5">
                Get your key from{' '}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber/40 hover:text-amber underline inline-flex items-center gap-0.5"
                >
                  platform.openai.com/api-keys
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveKey}
                disabled={!keyInput.trim() || testing}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2 border text-[9px] font-mono tracking-wider uppercase transition',
                  saved
                    ? 'border-tactical-green/40 bg-tactical-green/10 text-tactical-green'
                    : keyInput.trim() && !testing
                      ? 'border-amber/30 bg-amber/10 text-amber hover:bg-amber/20'
                      : 'border-gray-800 bg-surface text-gray-700 cursor-not-allowed',
                )}
              >
                {testing ? (
                  <div className="h-3 w-3 animate-spin rounded-full border border-amber/40 border-t-amber" />
                ) : saved ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Save className="h-3 w-3" />
                )}
                {testing ? 'VERIFYING...' : saved ? 'VERIFIED & SAVED' : 'SAVE KEY'}
              </button>
              <button
                onClick={handleTestKey}
                disabled={!keyInput.trim() || testing}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2 border text-[9px] font-mono tracking-wider uppercase transition',
                  keyInput.trim()
                    ? 'border-tactical-cyan/30 bg-tactical-cyan/5 text-tactical-cyan hover:bg-tactical-cyan/10'
                    : 'border-gray-800 bg-surface text-gray-700 cursor-not-allowed',
                )}
              >
                {testing ? (
                  <>
                    <div className="h-3 w-3 animate-spin rounded-full border border-tactical-cyan/40 border-t-tactical-cyan" />
                    TESTING...
                  </>
                ) : (
                  <>
                    <Shield className="h-3 w-3" />
                    TEST KEY
                  </>
                )}
              </button>
              {keyInput && (
                <button
                  onClick={() => { setKeyInput(''); setOpenAIKey(''); setTestResult(null); }}
                  className="flex items-center gap-2 px-3 py-2 border border-red-500/20 text-[9px] font-mono text-red-400/60 hover:text-red-400 hover:border-red-500/30 transition tracking-wider uppercase"
                >
                  REMOVE
                </button>
              )}
            </div>

            {/* Test result */}
            {testResult && (
              <div
                className={clsx(
                  'p-2.5 border flex items-start gap-2',
                  testResult.ok
                    ? 'border-tactical-green/30 bg-tactical-green/5'
                    : 'border-red-500/30 bg-red-500/5',
                )}
              >
                {testResult.ok ? (
                  <Check className="h-3.5 w-3.5 text-tactical-green flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <p className={clsx(
                  'text-[9px] font-mono',
                  testResult.ok ? 'text-tactical-green' : 'text-red-400',
                )}>
                  {testResult.msg}
                </p>
              </div>
            )}

            {/* Security notice */}
            <div className="p-2.5 border border-amber/10 bg-surface">
              <div className="flex items-start gap-2">
                <Shield className="h-3 w-3 text-amber/40 flex-shrink-0 mt-0.5" />
                <div className="text-[8px] font-mono text-gray-600 space-y-1">
                  <p className="font-bold text-amber/50 tracking-wider uppercase">Security Notice</p>
                  <p>• Your API key is stored in browser localStorage only</p>
                  <p>• It is never transmitted to WorldView servers</p>
                  <p>• API calls go directly from your browser to OpenAI</p>
                  <p>• Clear browser data to remove the key</p>
                  <p>• For production: use Vercel Edge Functions with server-side keys</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════ HOW TO USE OPENAI ═══════ */}
        <section className="border border-amber/10 bg-surface-card">
          <div className="px-4 py-3 border-b border-amber/10 flex items-center gap-2">
            <Copy className="h-4 w-4 text-amber/60" />
            <h2 className="text-[11px] font-mono font-bold tracking-[0.15em] text-amber uppercase">
              How to Get Your OpenAI API Key
            </h2>
          </div>
          <div className="p-4 space-y-2">
            {[
              { step: '1', text: 'Go to platform.openai.com and sign in (or create account)' },
              { step: '2', text: 'Navigate to API Keys page (Settings → API Keys)' },
              { step: '3', text: 'Click "Create new secret key" and give it a name (e.g., "WorldView OSINT")' },
              { step: '4', text: 'Copy the key (starts with sk-proj-...) — you can only see it once!' },
              { step: '5', text: 'Paste it in the field above and click "Save Key"' },
              { step: '6', text: 'Add credits to your OpenAI account ($5-10 is plenty to start)' },
            ].map(s => (
              <div key={s.step} className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-amber/10 border border-amber/20 text-[8px] font-mono font-bold text-amber">
                  {s.step}
                </span>
                <p className="text-[9px] font-mono text-gray-500 leading-relaxed pt-0.5">
                  {s.text}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
