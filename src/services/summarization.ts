/**
 * Summarization Service with Fallback Chain
 * Server-side Redis caching handles cross-user deduplication
 * Fallback: Ollama -> Jarvis -> Groq -> OpenRouter -> Browser T5
 *
 * Uses NewsServiceClient.summarizeArticle() RPC instead of legacy
 * per-provider fetch endpoints.
 */

import { mlWorker } from './ml-worker';
import { SITE_VARIANT } from '@/config';
import { BETA_MODE } from '@/config/beta';
import { isFeatureAvailable, type RuntimeFeatureId } from './runtime-config';
import { trackLLMUsage, trackLLMFailure } from './analytics';
import { getCurrentLanguage } from './i18n';
import { NewsServiceClient, type SummarizeArticleResponse } from '@/generated/client/worldmonitor/news/v1/service_client';
import { createCircuitBreaker } from '@/utils';
import { buildSummaryCacheKey } from '@/utils/summary-cache-key';

export type SummarizationProvider = 'ollama' | 'jarvis' | 'groq' | 'openrouter' | 'browser' | 'cache';

export interface SummarizationResult {
  summary: string;
  provider: SummarizationProvider;
  model: string;
  cached: boolean;
}

export type ProgressCallback = (step: number, total: number, message: string) => void;

export interface SummarizeOptions {
  skipCloudProviders?: boolean;  // true = skip API providers, go straight to browser T5
  skipBrowserFallback?: boolean; // true = skip browser T5 fallback
}

// ── Sebuf client (replaces direct fetch to /api/{provider}-summarize) ──

const newsClient = new NewsServiceClient('', { fetch: (...args) => globalThis.fetch(...args) });
const summaryBreaker = createCircuitBreaker<SummarizeArticleResponse>({ name: 'News Summarization', cacheTtlMs: 0 });

const emptySummaryFallback: SummarizeArticleResponse = { summary: '', provider: '', model: '', fallback: true, tokens: 0, error: '', errorType: '', status: 'SUMMARIZE_STATUS_UNSPECIFIED', statusDetail: '' };

// ── Provider definitions ──

interface ApiProviderDef {
  featureId: RuntimeFeatureId;
  provider: SummarizationProvider;
  label: string;
}

const FREE_API_PROVIDERS: ApiProviderDef[] = [
  { featureId: 'aiOllama',      provider: 'ollama',     label: 'Ollama' },
  { featureId: 'aiJarvis',      provider: 'jarvis',     label: 'Jarvis' },
];

const PAID_API_PROVIDERS: ApiProviderDef[] = [
  { featureId: 'aiGroq',        provider: 'groq',       label: 'Groq AI' },
  { featureId: 'aiOpenRouter',  provider: 'openrouter', label: 'OpenRouter' },
];

const API_PROVIDERS: ApiProviderDef[] = [...FREE_API_PROVIDERS, ...PAID_API_PROVIDERS];

let lastAttemptedProvider = 'none';

// ── Unified API provider caller (via SummarizeArticle RPC) ──

async function tryApiProvider(
  providerDef: ApiProviderDef,
  headlines: string[],
  geoContext?: string,
  lang?: string,
): Promise<SummarizationResult | null> {
  if (!isFeatureAvailable(providerDef.featureId)) return null;
  lastAttemptedProvider = providerDef.provider;
  try {
    const resp: SummarizeArticleResponse = await summaryBreaker.execute(async () => {
      return newsClient.summarizeArticle({
        provider: providerDef.provider,
        headlines,
        mode: 'brief',
        geoContext: geoContext || '',
        variant: SITE_VARIANT,
        lang: lang || 'en',
      });
    }, emptySummaryFallback);

    // Provider skipped (credentials missing) or signaled fallback
    if (resp.status === 'SUMMARIZE_STATUS_SKIPPED' || resp.fallback) return null;

    const summary = typeof resp.summary === 'string' ? resp.summary.trim() : '';
    if (!summary) return null;

    const cached = resp.status === 'SUMMARIZE_STATUS_CACHED';
    const resultProvider = cached ? 'cache' : providerDef.provider;
    return {
      summary,
      provider: resultProvider as SummarizationProvider,
      model: resp.model || providerDef.provider,
      cached,
    };
  } catch (error) {
    console.warn(`[Summarization] ${providerDef.label} failed:`, error);
    return null;
  }
}

// ── Browser T5 provider (different interface -- no API call) ──

async function tryBrowserT5(headlines: string[], modelId?: string): Promise<SummarizationResult | null> {
  try {
    if (!mlWorker.isAvailable) {
      return null;
    }
    lastAttemptedProvider = 'browser';

    const lang = getCurrentLanguage();
    const combinedText = headlines.slice(0, 5).map(h => h.slice(0, 80)).join('. ');
    const prompt = lang === 'fr'
      ? `Résumez le titre le plus important en 2 phrases concises (moins de 60 mots) : ${combinedText}`
      : `Summarize the most important headline in 2 concise sentences (under 60 words): ${combinedText}`;

    const [summary] = await mlWorker.summarize([prompt], modelId);

    if (!summary || summary.length < 20 || summary.toLowerCase().includes('summarize') || summary.toLowerCase().includes('résumez')) {
      return null;
    }

    return {
      summary,
      provider: 'browser',
      model: modelId || 't5-small',
      cached: false,
    };
  } catch (error) {
    console.warn('[Summarization] Browser T5 failed:', error);
    return null;
  }
}

// ── Fallback chain runner ──

async function runApiChain(
  providers: ApiProviderDef[],
  headlines: string[],
  geoContext: string | undefined,
  lang: string | undefined,
  onProgress: ProgressCallback | undefined,
  stepOffset: number,
  totalSteps: number,
): Promise<SummarizationResult | null> {
  for (const [i, provider] of providers.entries()) {
    onProgress?.(stepOffset + i, totalSteps, `Connecting to ${provider.label}...`);
    const result = await tryApiProvider(provider, headlines, geoContext, lang);
    if (result) return result;
  }
  return null;
}

/**
 * Generate a summary using the fallback chain: Ollama -> Jarvis -> Browser T5 -> Groq -> OpenRouter
 * Server-side Redis caching is handled by the SummarizeArticle RPC handler
 * @param geoContext Optional geographic signal context to include in the prompt
 */
export async function generateSummary(
  headlines: string[],
  onProgress?: ProgressCallback,
  geoContext?: string,
  lang: string = 'en',
  options?: SummarizeOptions,
): Promise<SummarizationResult | null> {
  if (!headlines || headlines.length < 2) {
    return null;
  }

  lastAttemptedProvider = 'none';
  const result = await generateSummaryInternal(headlines, onProgress, geoContext, lang, options);

  // Track at generateSummary return only (not inside tryApiProvider) to avoid
  // double-counting beta comparison traffic. Only the winning provider is recorded.
  if (result) {
    trackLLMUsage(result.provider, result.model, result.cached);
  } else {
    trackLLMFailure(lastAttemptedProvider);
  }

  return result;
}

async function generateSummaryInternal(
  headlines: string[],
  onProgress: ProgressCallback | undefined,
  geoContext: string | undefined,
  lang: string,
  options?: SummarizeOptions,
): Promise<SummarizationResult | null> {
  if (!options?.skipCloudProviders) {
    try {
      const cacheKey = buildSummaryCacheKey(headlines, 'brief', geoContext, SITE_VARIANT, lang);
      const cached = await newsClient.getSummarizeArticleCache({ cacheKey });
      if (cached.summary) {
        return { summary: cached.summary, provider: 'cache', model: cached.model || '', cached: true };
      }
    } catch { /* cache lookup failed — proceed to provider chain */ }
  }

  if (BETA_MODE) {
    const modelReady = mlWorker.isAvailable && mlWorker.isModelLoaded('summarization-beta');

    if (modelReady) {
      const totalSteps = 1 + FREE_API_PROVIDERS.length + PAID_API_PROVIDERS.length;
      // Free provider chain first (Ollama -> Jarvis)
      if (!options?.skipCloudProviders) {
        const freeChain = await runApiChain(FREE_API_PROVIDERS, headlines, geoContext, undefined, onProgress, 1, totalSteps);
        if (freeChain) return freeChain;
      }

      // Browser model is the third free option.
      if (!options?.skipBrowserFallback) {
        onProgress?.(1 + FREE_API_PROVIDERS.length, totalSteps, 'Running local AI model (beta)...');
        const browserResult = await tryBrowserT5(headlines, 'summarization-beta');
        if (browserResult) return browserResult;
      }

      // Paid providers only after free options are exhausted.
      if (!options?.skipCloudProviders) {
        const paidOffset = 2 + FREE_API_PROVIDERS.length;
        const paidChain = await runApiChain(PAID_API_PROVIDERS, headlines, geoContext, undefined, onProgress, paidOffset, totalSteps);
        if (paidChain) return paidChain;
      }
    } else {
      const totalSteps = FREE_API_PROVIDERS.length + PAID_API_PROVIDERS.length + 2;
      if (mlWorker.isAvailable && !options?.skipBrowserFallback) {
        mlWorker.loadModel('summarization-beta').catch(() => {});
      }

      // Free provider chain while model loads.
      if (!options?.skipCloudProviders) {
        const freeChain = await runApiChain(FREE_API_PROVIDERS, headlines, geoContext, undefined, onProgress, 1, totalSteps);
        if (freeChain) return freeChain;
      }

      // Third free option: browser T5 (may have finished loading by now).
      if (mlWorker.isAvailable && !options?.skipBrowserFallback) {
        onProgress?.(FREE_API_PROVIDERS.length + 1, totalSteps, 'Waiting for local AI model...');
        const browserResult = await tryBrowserT5(headlines, 'summarization-beta');
        if (browserResult) return browserResult;
      }

      // Paid providers only after free options are exhausted.
      if (!options?.skipCloudProviders) {
        const paidOffset = FREE_API_PROVIDERS.length + 2;
        const paidChain = await runApiChain(PAID_API_PROVIDERS, headlines, geoContext, undefined, onProgress, paidOffset, totalSteps);
        if (paidChain) return paidChain;
      }

      onProgress?.(totalSteps, totalSteps, 'No providers available');
    }

    console.warn('[BETA] All providers failed');
    return null;
  }

  // Normal mode: free providers -> browser -> paid providers
  const totalSteps = FREE_API_PROVIDERS.length + PAID_API_PROVIDERS.length + 1;
  if (!options?.skipCloudProviders) {
    const freeChain = await runApiChain(FREE_API_PROVIDERS, headlines, geoContext, lang, onProgress, 1, totalSteps);
    if (freeChain) return freeChain;
  }

  if (!options?.skipBrowserFallback) {
    onProgress?.(FREE_API_PROVIDERS.length + 1, totalSteps, 'Loading local AI model...');
    const browserResult = await tryBrowserT5(headlines);
    if (browserResult) return browserResult;
  }

  if (!options?.skipCloudProviders) {
    const paidOffset = FREE_API_PROVIDERS.length + 2;
    const paidChain = await runApiChain(PAID_API_PROVIDERS, headlines, geoContext, lang, onProgress, paidOffset, totalSteps);
    if (paidChain) return paidChain;
  }

  console.warn('[Summarization] All providers failed');
  return null;
}


/**
 * Translate text using the fallback chain (via SummarizeArticle RPC with mode='translate')
 * @param text Text to translate
 * @param targetLang Target language code (e.g., 'fr', 'es')
 */
export async function translateText(
  text: string,
  targetLang: string,
  onProgress?: ProgressCallback
): Promise<string | null> {
  if (!text) return null;

  const totalSteps = API_PROVIDERS.length;
  for (const [i, providerDef] of API_PROVIDERS.entries()) {
    if (!isFeatureAvailable(providerDef.featureId)) continue;

    onProgress?.(i + 1, totalSteps, `Translating with ${providerDef.label}...`);
    try {
      const resp = await summaryBreaker.execute(async () => {
        return newsClient.summarizeArticle({
          provider: providerDef.provider,
          headlines: [text],
          mode: 'translate',
          geoContext: '',
          variant: targetLang,
          lang: '',
        });
      }, emptySummaryFallback);

      if (resp.fallback || resp.status === 'SUMMARIZE_STATUS_SKIPPED') continue;
      const summary = typeof resp.summary === 'string' ? resp.summary.trim() : '';
      if (summary) return summary;
    } catch (e) {
      console.warn(`${providerDef.label} translation failed`, e);
    }
  }

  return null;
}
