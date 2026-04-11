import type {
  ServerContext,
  GetCountryIntelBriefRequest,
  GetCountryIntelBriefResponse,
} from '../../../../src/generated/server/worldmonitor/intelligence/v1/service_server';

import { cachedFetchJson } from '../../../_shared/redis';
import { callLlm } from '../../../_shared/llm';
import { shouldForceLocalLlm } from '../../../_shared/local-mode';
import { UPSTREAM_TIMEOUT_MS, TIER1_COUNTRIES, sha256Hex } from './_shared';

// ========================================================================
// Constants
// ========================================================================

const INTEL_CACHE_TTL = 7200;
const DEFAULT_MODEL = 'jarvis-open-source';

// ========================================================================
// RPC handler
// ========================================================================

export async function getCountryIntelBrief(
  ctx: ServerContext,
  req: GetCountryIntelBriefRequest,
): Promise<GetCountryIntelBriefResponse> {
  const localOnly = shouldForceLocalLlm(ctx?.request?.url);
  const empty: GetCountryIntelBriefResponse = {
    countryCode: req.countryCode,
    countryName: '',
    brief: '',
    model: DEFAULT_MODEL,
    generatedAt: Date.now(),
  };

  if (!req.countryCode) return empty;

  let contextSnapshot = '';
  let lang = 'en';
  try {
    const url = new URL(ctx.request.url);
    contextSnapshot = (url.searchParams.get('context') || '').trim().slice(0, 4000);
    lang = url.searchParams.get('lang') || 'en';
  } catch {
    contextSnapshot = '';
  }

  const contextHash = contextSnapshot ? (await sha256Hex(contextSnapshot)).slice(0, 16) : 'base';
  const cacheKey = `ci-sebuf:v2:${req.countryCode}:${lang}:${contextHash}`;
  const countryName = TIER1_COUNTRIES[req.countryCode] || req.countryCode;
  const dateStr = new Date().toISOString().split('T')[0];

  const systemPrompt = `You are a senior intelligence analyst providing comprehensive country situation briefs. Current date: ${dateStr}. Provide geopolitical context appropriate for the current date.

Write a concise intelligence brief for the requested country covering:
1. Current Situation - what is happening right now
2. Military & Security Posture
3. Key Risk Factors
4. Regional Context
5. Outlook & Watch Items

Rules:
- Be specific and analytical
- 4-5 paragraphs, 250-350 words
- No speculation beyond what data supports
- Use plain language, not jargon
- If a context snapshot is provided, explicitly reflect each non-zero signal category in the brief${lang === 'fr' ? '\n- IMPORTANT: You MUST respond ENTIRELY in French language.' : ''}`;

  let result: GetCountryIntelBriefResponse | null = null;
  try {
    result = await cachedFetchJson<GetCountryIntelBriefResponse>(cacheKey, INTEL_CACHE_TTL, async () => {
      try {
        const userPromptParts = [
          `Country: ${countryName} (${req.countryCode})`,
        ];
        if (contextSnapshot) {
          userPromptParts.push(`Context snapshot:\n${contextSnapshot}`);
        }

        const llm = await callLlm({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPromptParts.join('\n\n') },
          ],
          provider: localOnly ? undefined : 'groq',
          temperature: 0.4,
          maxTokens: 900,
          timeoutMs: UPSTREAM_TIMEOUT_MS,
          localOnly,
        });
        const brief = llm?.content?.trim() || '';
        if (!brief) return null;

        return {
          countryCode: req.countryCode,
          countryName,
          brief,
          model: llm?.model || DEFAULT_MODEL,
          generatedAt: Date.now(),
        };
      } catch {
        return null;
      }
    });
  } catch {
    return empty;
  }

  return result || empty;
}
