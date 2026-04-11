import type {
  ServerContext,
  SummarizeArticleRequest,
  SummarizeArticleResponse,
} from '../../../../src/generated/server/worldmonitor/news/v1/service_server';

import { cachedFetchJsonWithMeta } from '../../../_shared/redis';
import { shouldForceLocalLlm } from '../../../_shared/local-mode';
import {
  CACHE_TTL_SECONDS,
  deduplicateHeadlines,
  buildArticlePrompts,
  getProviderCredentials,
  getCacheKey,
} from './_shared';
import { CHROME_UA } from '../../../_shared/constants';

// ======================================================================
// Reasoning preamble detection
// ======================================================================

export const TASK_NARRATION = /^(we need to|i need to|let me|i'll |i should|i will |the task is|the instructions|according to the rules|so we need to|okay[,.]\s*(i'll|let me|so|we need|the task|i should|i will)|sure[,.]\s*(i'll|let me|so|we need|the task|i should|i will|here)|first[, ]+(i|we|let)|to summarize (the headlines|the task|this)|my task (is|was|:)|step \d)/i;
export const PROMPT_ECHO = /^(summarize the top story|summarize the key|rules:|here are the rules|the top story is likely)/i;

export function hasReasoningPreamble(text: string): boolean {
  const trimmed = text.trim();
  return TASK_NARRATION.test(trimmed) || PROMPT_ECHO.test(trimmed);
}

function readTimeoutMs(name: string, fallback: number, min = 5_000, max = 300_000): number {
  const raw = Number.parseInt(String(process.env[name] || ''), 10);
  if (!Number.isFinite(raw)) return fallback;
  return Math.min(Math.max(raw, min), max);
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
    } else if (!parsed.port) {
      const alt8865 = new URL(parsed.toString());
      alt8865.port = '8865';
      const alt8765 = new URL(parsed.toString());
      alt8765.port = '8765';
      add(alt8865.toString());
      add(alt8765.toString());
    }
  } catch {
    // Keep primary only when URL parsing fails.
  }
  return out;
}

// ======================================================================
// SummarizeArticle: Multi-provider LLM summarization with Redis caching
// Ported from api/_summarize-handler.js
// ======================================================================

export async function summarizeArticle(
  ctx: ServerContext,
  req: SummarizeArticleRequest,
): Promise<SummarizeArticleResponse> {
  const { provider, mode = 'brief', geoContext = '', variant = 'full', lang = 'en' } = req;
  const localOnly = shouldForceLocalLlm(ctx?.request?.url);

  // Input sanitization (M-14 fix): limit headline count and length
  const MAX_HEADLINES = 10;
  const MAX_HEADLINE_LEN = 500;
  const MAX_GEO_CONTEXT_LEN = 2000;
  const headlines = (req.headlines || [])
    .slice(0, MAX_HEADLINES)
    .map(h => typeof h === 'string' ? h.slice(0, MAX_HEADLINE_LEN) : '');
  const sanitizedGeoContext = typeof geoContext === 'string' ? geoContext.slice(0, MAX_GEO_CONTEXT_LEN) : '';

  // Provider credential check
  const skipReasons: Record<string, string> = {
    ollama: 'OLLAMA_API_URL not configured',
    jarvis: 'JARVIS_API_URL not configured',
    groq: 'GROQ_API_KEY not configured',
    openrouter: 'OPENROUTER_API_KEY not configured',
  };

  const credentials = getProviderCredentials(provider);
  if (!credentials) {
    return {
      summary: '',
      model: '',
      provider: provider,
      tokens: 0,
      fallback: true,
      error: '',
      errorType: '',
      status: 'SUMMARIZE_STATUS_SKIPPED',
      statusDetail: skipReasons[provider] || `Unknown provider: ${provider}`,
    };
  }

  if (localOnly && (provider === 'groq' || provider === 'openrouter')) {
    return {
      summary: '',
      model: '',
      provider,
      tokens: 0,
      fallback: true,
      error: '',
      errorType: '',
      status: 'SUMMARIZE_STATUS_SKIPPED',
      statusDetail: 'Hard local mode enabled on localhost: paid cloud providers are disabled',
    };
  }

  const { apiUrl, model, headers: providerHeaders, extraBody } = credentials;

  // Request validation
  if (!headlines || !Array.isArray(headlines) || headlines.length === 0) {
    return {
      summary: '',
      model: '',
      provider: provider,
      tokens: 0,
      fallback: false,
      error: 'Headlines array required',
      errorType: 'ValidationError',
      status: 'SUMMARIZE_STATUS_ERROR',
      statusDetail: 'Headlines array required',
    };
  }

  try {
    const cacheKey = getCacheKey(headlines, mode, sanitizedGeoContext, variant, lang);

    // Single atomic call — source tracking happens inside cachedFetchJsonWithMeta,
    // eliminating the TOCTOU race between a separate getCachedJson and cachedFetchJson.
    const { data: result, source } = await cachedFetchJsonWithMeta<{ summary: string; model: string; tokens: number }>(
      cacheKey,
      CACHE_TTL_SECONDS,
      async () => {
        const uniqueHeadlines = deduplicateHeadlines(headlines.slice(0, 5));
        const { systemPrompt, userPrompt } = buildArticlePrompts(headlines, uniqueHeadlines, {
          mode,
          geoContext: sanitizedGeoContext,
          variant,
          lang,
        });

        const isJarvis = provider === 'jarvis';
        const isOllama = provider === 'ollama';
        const isLocalProvider = isJarvis || isOllama;
        const jarvisApiCandidates = isJarvis ? buildJarvisApiCandidates(apiUrl) : [apiUrl];
        const jarvisTimeoutMs = readTimeoutMs('JARVIS_TIMEOUT_MS', 60_000);
        const ollamaTimeoutMs = readTimeoutMs('OLLAMA_TIMEOUT_MS', 300_000);
        const providerTimeoutMs = isJarvis ? jarvisTimeoutMs : (isOllama ? ollamaTimeoutMs : 25_000);
        if (isJarvis && String(process.env.JARVIS_ENFORCE_OPEN_SOURCE ?? '1').trim() !== '0') {
          for (const candidate of jarvisApiCandidates) {
            const modeUrl = jarvisModeUrlFromChatUrl(candidate);
            if (modeUrl) {
              try {
                await fetch(modeUrl, {
                  method: 'POST',
                  headers: { ...providerHeaders, 'User-Agent': CHROME_UA },
                  body: JSON.stringify({ mode: 'open-source' }),
                  signal: AbortSignal.timeout(4000),
                });
              } catch {
                // Best-effort only; continue with chat request.
              }
            }
          }
        }
        const compactHeadlines = uniqueHeadlines.map((h: string, i: number) => `${i + 1}. ${h}`).join('\n');
        const localCompactPrompt = [
          'Choose the single most important headline.',
          'Summarize only that one story in exactly 2 concise sentences under 60 words total.',
          'Do not merge stories. Output plain text only.',
          '',
          'Headlines:',
          compactHeadlines,
          sanitizedGeoContext ? `\nContext:\n${sanitizedGeoContext}` : '',
        ].filter(Boolean).join('\n');

        const jarvisMessage = isLocalProvider
          ? localCompactPrompt
          : `${systemPrompt}\n\n${userPrompt}\n\nReturn only the final summary. No extra commentary.`;
        let response: Response | null = null;
        let lastError: unknown = null;
        const providerCandidates = isJarvis ? jarvisApiCandidates : [apiUrl];
        for (const candidateUrl of providerCandidates) {
          try {
            const candidateResp = await fetch(candidateUrl, {
              method: 'POST',
              headers: { ...providerHeaders, 'User-Agent': CHROME_UA },
              body: isJarvis
                ? JSON.stringify({
                  message: jarvisMessage,
                  stream: false,
                })
                : JSON.stringify({
                  model,
                  messages: [
                    { role: 'system', content: isLocalProvider
                      ? 'You are a concise news summarizer. Return plain text only.'
                      : systemPrompt },
                    { role: 'user', content: isLocalProvider ? localCompactPrompt : userPrompt },
                  ],
                  temperature: 0.3,
                  max_tokens: 100,
                  top_p: 0.9,
                  ...extraBody,
                }),
              signal: AbortSignal.timeout(providerTimeoutMs),
            });
            response = candidateResp;
            if (candidateResp.ok || !isJarvis) break;
          } catch (err) {
            lastError = err;
          }
        }

        if (!response) {
          throw (lastError instanceof Error ? lastError : new Error('No provider response'));
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[SummarizeArticle:${provider}] API error:`, response.status, errorText);
          throw new Error(response.status === 429 ? 'Rate limited' : `${provider} API error`);
        }

        const data = await response.json() as any;
        const tokens = provider === 'jarvis' ? 0 : ((data.usage?.total_tokens as number) || 0);
        const message = data.choices?.[0]?.message;
        let rawContent = provider === 'jarvis'
          ? (typeof data.response === 'string' ? data.response.trim() : '')
          : (typeof message?.content === 'string' ? message.content.trim() : '');
        const resolvedModel = provider === 'jarvis'
          ? (typeof data.model === 'string' && data.model.trim() ? data.model.trim() : model)
          : model;

        rawContent = rawContent
          .replace(/<think>[\s\S]*?<\/think>/gi, '')
          .replace(/<\|thinking\|>[\s\S]*?<\|\/thinking\|>/gi, '')
          .replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, '')
          .replace(/<reflection>[\s\S]*?<\/reflection>/gi, '')
          .replace(/<\|begin_of_thought\|>[\s\S]*?<\|end_of_thought\|>/gi, '')
          .trim();

        // Strip unterminated thinking blocks (no closing tag)
        rawContent = rawContent
          .replace(/<think>[\s\S]*/gi, '')
          .replace(/<\|thinking\|>[\s\S]*/gi, '')
          .replace(/<reasoning>[\s\S]*/gi, '')
          .replace(/<reflection>[\s\S]*/gi, '')
          .replace(/<\|begin_of_thought\|>[\s\S]*/gi, '')
          .trim();

        if (['brief', 'analysis'].includes(mode) && rawContent.length < 20) {
          console.warn(`[SummarizeArticle:${provider}] Output too short after stripping (${rawContent.length} chars), rejecting`);
          return null;
        }

        if (['brief', 'analysis'].includes(mode) && hasReasoningPreamble(rawContent)) {
          console.warn(`[SummarizeArticle:${provider}] Reasoning preamble detected, rejecting`);
          return null;
        }

        return rawContent ? { summary: rawContent, model: resolvedModel, tokens } : null;
      },
    );

    if (result?.summary) {
      const isCached = source === 'cache';
      return {
        summary: result.summary,
        model: result.model || model,
        provider: isCached ? 'cache' : provider,
        tokens: isCached ? 0 : (result.tokens || 0),
        fallback: false,
        error: '',
        errorType: '',
        status: isCached ? 'SUMMARIZE_STATUS_CACHED' : 'SUMMARIZE_STATUS_SUCCESS',
        statusDetail: '',
      };
    }

    return {
      summary: '',
      model: '',
      provider: provider,
      tokens: 0,
      fallback: true,
      error: 'Empty response',
      errorType: '',
      status: 'SUMMARIZE_STATUS_ERROR',
      statusDetail: 'Empty response',
    };

  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(`[SummarizeArticle:${provider}] Error:`, error.name, error.message);
    return {
      summary: '',
      model: '',
      provider: provider,
      tokens: 0,
      fallback: true,
      error: error.message,
      errorType: error.name,
      status: 'SUMMARIZE_STATUS_ERROR',
      statusDetail: `${error.name}: ${error.message}`,
    };
  }
}
