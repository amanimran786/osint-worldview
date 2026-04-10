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

const OLLAMA_HOST_ALLOWLIST = new Set([
  'localhost', '127.0.0.1', '::1', '[::1]', 'host.docker.internal',
]);

function isSidecar(): boolean {
  return typeof process !== 'undefined' &&
    (process.env?.LOCAL_API_MODE || '').includes('sidecar');
}

export function getProviderCredentials(provider: string): ProviderCredentials | null {
  if (provider === 'ollama') {
    const baseUrl = process.env.OLLAMA_API_URL;
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
      model: process.env.OLLAMA_MODEL || 'llama3.1:8b',
      headers,
      extraBody: { think: false },
    };
  }

  if (provider === 'jarvis') {
    const rawBaseUrl = String(process.env.JARVIS_API_URL || '').trim();
    if (!rawBaseUrl) return null;
    let apiUrl = '';
    try {
      apiUrl = /\/chat\/?$/i.test(rawBaseUrl)
        ? rawBaseUrl.replace(/\/+$/, '')
        : new URL('/chat', rawBaseUrl).toString();
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

const PROVIDER_CHAIN = ['ollama', 'jarvis', 'groq', 'openrouter'] as const;

export interface LlmCallOptions {
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  provider?: string;
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
    stripThinkingTags: shouldStrip = true,
    validate,
  } = opts;

  const providers = forcedProvider ? [forcedProvider] : [...PROVIDER_CHAIN];

  for (const providerName of providers) {
    const creds = getProviderCredentials(providerName);
    if (!creds) {
      if (forcedProvider) return null;
      continue;
    }

    try {
      const isJarvis = providerName === 'jarvis';
      if (isJarvis && String(process.env.JARVIS_ENFORCE_OPEN_SOURCE ?? '1').trim() !== '0') {
        const modeUrl = jarvisModeUrlFromChatUrl(creds.apiUrl);
        if (modeUrl) {
          try {
            await fetch(modeUrl, {
              method: 'POST',
              headers: { ...creds.headers, 'User-Agent': CHROME_UA },
              body: JSON.stringify({ mode: 'open-source' }),
              signal: AbortSignal.timeout(Math.min(timeoutMs, 4000)),
            });
          } catch {
            // Best-effort only; continue with chat request.
          }
        }
      }
      const jarvisMessage = messages
        .map((m) => `${String(m.role || 'user').toUpperCase()}: ${String(m.content || '')}`)
        .join('\n\n');
      const resp = await fetch(creds.apiUrl, {
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
        signal: AbortSignal.timeout(timeoutMs),
      });

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
