import { CHROME_UA } from './constants';

export interface ProviderCredentials {
  apiUrl: string;
  model: string;
  headers: Record<string, string>;
  extraBody?: Record<string, unknown>;
}

function jarvisModeUrlFromChatUrl(chatUrl: string): string {
  try {
    const parsed = new URL(chatUrl);
    if (/\/chat\/?$/i.test(parsed.pathname)) {
      parsed.pathname = parsed.pathname.replace(/\/chat\/?$/i, '/mode');
      return parsed.toString();
    }
    return new URL('/mode', parsed).toString();
  } catch {
    return '';
  }
}

function buildJarvisApiCandidates(primaryApiUrl: string): string[] {
  const out: string[] = [];
  const add = (url: string) => {
    if (url && !out.includes(url)) out.push(url);
  };
  add(primaryApiUrl);
  try {
    const parsed = new URL(primaryApiUrl);
    const isLocalHost = parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost';
    if (!isLocalHost) return out;
    if (parsed.port === '8765') {
      const alt = new URL(parsed.toString());
      alt.port = '8865';
      add(alt.toString());
    } else if (parsed.port === '8865') {
      const alt = new URL(parsed.toString());
      alt.port = '8765';
      add(alt.toString());
    }
  } catch {
    // Keep primary only when URL parsing fails.
  }
  return out;
}

const OLLAMA_HOST_ALLOWLIST = new Set([
  'localhost', '127.0.0.1', '::1', '[::1]', 'host.docker.internal',
]);

function isSidecar(): boolean {
  return typeof process !== 'undefined' &&
    (process.env?.LOCAL_API_MODE || '').includes('sidecar');
}

function resolveJarvisBaseUrl(): string {
  const configured = String(process.env.JARVIS_API_URL || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (configured.length > 0) return configured[0]!;
  const port = String(process.env.JARVIS_API_PORT || '').trim();
  if (/^\d+$/.test(port)) return `http://127.0.0.1:${port}`;
  return 'http://127.0.0.1:8865';
}

export function getProviderCredentials(provider: string): ProviderCredentials | null {
  if (provider === 'ollama') {
    const baseUrl = String(process.env.OLLAMA_API_URL || 'http://127.0.0.1:11434').trim();
    if (!baseUrl) return null;

    if (!isSidecar()) {
      try {
        const hostname = new URL(baseUrl).hostname;
        if (!OLLAMA_HOST_ALLOWLIST.has(hostname)) {
          console.warn(`[llm] Ollama blocked: hostname "${hostname}" not in allowlist`);
          return null;
        }
      } catch {
        return null;
      }
    }

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const apiKey = process.env.OLLAMA_API_KEY;
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

    return {
      apiUrl: new URL('/v1/chat/completions', baseUrl).toString(),
      model: process.env.OLLAMA_MODEL || 'jarvis-local:latest',
      headers,
      extraBody: { think: false },
    };
  }

  if (provider === 'jarvis') {
    const rawBaseUrl = resolveJarvisBaseUrl();
    if (!rawBaseUrl) return null;
    let apiUrl = '';
    try {
      apiUrl = /\/chat(?:\/raw)?\/?$/i.test(rawBaseUrl)
        ? rawBaseUrl.replace(/\/chat(?:\/raw)?\/?$/i, '/chat/raw')
        : new URL('/chat/raw', rawBaseUrl).toString();
    } catch {
      return null;
    }
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = String(process.env.JARVIS_API_TOKEN || '').trim();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return {
      apiUrl,
      model: process.env.JARVIS_MODEL || 'jarvis-open-source',
      headers,
    };
  }

  if (provider === 'groq') {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return null;
    return {
      apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
      model: 'llama-3.1-8b-instant',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    };
  }

  if (provider === 'openrouter') {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return null;
    return {
      apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
      model: 'openrouter/free',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://worldmonitor.app',
        'X-Title': 'WorldMonitor',
      },
    };
  }

  return null;
}

export function stripThinkingTags(text: string): string {
  let s = text
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<\|thinking\|>[\s\S]*?<\|\/thinking\|>/gi, '')
    .replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, '')
    .replace(/<reflection>[\s\S]*?<\/reflection>/gi, '')
    .replace(/<\|begin_of_thought\|>[\s\S]*?<\|end_of_thought\|>/gi, '')
    .trim();

  s = s
    .replace(/<think>[\s\S]*/gi, '')
    .replace(/<\|thinking\|>[\s\S]*/gi, '')
    .replace(/<reasoning>[\s\S]*/gi, '')
    .replace(/<reflection>[\s\S]*/gi, '')
    .replace(/<\|begin_of_thought\|>[\s\S]*/gi, '')
    .trim();

  return s;
}

const LOCAL_PROVIDER_CHAIN = ['jarvis', 'ollama'] as const;
const PAID_PROVIDERS = new Set(['groq', 'openrouter']);
const PROVIDER_CHAIN = [...LOCAL_PROVIDER_CHAIN, 'groq', 'openrouter'] as const;

export interface LlmCallOptions {
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  provider?: string;
  localOnly?: boolean;
  stripThinkingTags?: boolean;
  validate?: (content: string) => boolean;
}

export interface LlmCallResult {
  content: string;
  model: string;
  provider: string;
  tokens: number;
}

export async function callLlm(opts: LlmCallOptions): Promise<LlmCallResult | null> {
  const {
    messages,
    temperature = 0.3,
    maxTokens = 1500,
    timeoutMs = 25_000,
    provider: forcedProvider,
    localOnly = false,
    stripThinkingTags: shouldStrip = true,
    validate,
  } = opts;

  if (forcedProvider && localOnly && PAID_PROVIDERS.has(forcedProvider)) {
    return null;
  }

  const providers = forcedProvider
    ? [forcedProvider]
    : (localOnly ? [...LOCAL_PROVIDER_CHAIN] : [...PROVIDER_CHAIN]);

  for (const providerName of providers) {
    const creds = getProviderCredentials(providerName);
    if (!creds) {
      if (forcedProvider) return null;
      continue;
    }

    try {
      const isJarvis = providerName === 'jarvis';
      const providerTimeoutMs = providerName === 'ollama'
        ? Math.max(timeoutMs, 120_000)
        : providerName === 'jarvis'
          ? Math.max(timeoutMs, 60_000)
          : timeoutMs;
      const jarvisApiCandidates = isJarvis ? buildJarvisApiCandidates(creds.apiUrl) : [creds.apiUrl];
      if (isJarvis && String(process.env.JARVIS_ENFORCE_OPEN_SOURCE ?? '1').trim() !== '0') {
        for (const candidate of jarvisApiCandidates) {
          const modeUrl = jarvisModeUrlFromChatUrl(candidate);
          if (modeUrl) {
            try {
              await fetch(modeUrl, {
                method: 'POST',
                headers: { ...creds.headers, 'User-Agent': CHROME_UA },
                body: JSON.stringify({ mode: 'open-source' }),
                signal: AbortSignal.timeout(Math.min(providerTimeoutMs, 4000)),
              });
            } catch {
              // Best-effort only; continue with chat request.
            }
          }
        }
      }
      const jarvisMessage = messages
        .map((m) => `${String(m.role || 'user').toUpperCase()}: ${String(m.content || '')}`)
        .join('\n\n');
      let resp: Response | null = null;
      let lastError: unknown = null;
      const providerCandidates = isJarvis ? jarvisApiCandidates : [creds.apiUrl];
      for (const candidateUrl of providerCandidates) {
        try {
          const candidateResp = await fetch(candidateUrl, {
            method: 'POST',
            headers: { ...creds.headers, 'User-Agent': CHROME_UA },
            body: isJarvis
              ? JSON.stringify({
                message: jarvisMessage,
                stream: false,
              })
              : JSON.stringify({
                ...creds.extraBody,
                model: creds.model,
                messages,
                temperature,
                max_tokens: maxTokens,
              }),
            signal: AbortSignal.timeout(providerTimeoutMs),
          });
          resp = candidateResp;
          if (candidateResp.ok || !isJarvis) break;
        } catch (err) {
          lastError = err;
        }
      }

      if (!resp) {
        throw (lastError instanceof Error ? lastError : new Error('No provider response'));
      }

      if (!resp.ok) {
        console.warn(`[llm:${providerName}] HTTP ${resp.status}`);
        if (forcedProvider) return null;
        continue;
      }

      const data = (await resp.json()) as {
        response?: string;
        model?: string;
        choices?: Array<{ message?: { content?: string } }>;
        usage?: { total_tokens?: number };
      };

      let content = isJarvis
        ? String(data.response || '').trim()
        : (data.choices?.[0]?.message?.content?.trim() || '');
      if (!content) {
        if (forcedProvider) return null;
        continue;
      }

      const tokens = isJarvis ? 0 : (data.usage?.total_tokens ?? 0);
      const resolvedModel = isJarvis
        ? (String(data.model || '').trim() || creds.model)
        : creds.model;

      if (shouldStrip) {
        content = stripThinkingTags(content);
        if (!content) {
          if (forcedProvider) return null;
          continue;
        }
      }

      if (validate && !validate(content)) {
        console.warn(`[llm:${providerName}] validate() rejected response, trying next`);
        if (forcedProvider) return null;
        continue;
      }

      return { content, model: resolvedModel, provider: providerName, tokens };
    } catch (err) {
      console.warn(`[llm:${providerName}] ${(err as Error).message}`);
      if (forcedProvider) return null;
      continue;
    }
  }

  return null;
}
