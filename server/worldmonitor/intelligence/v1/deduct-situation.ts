import type {
  ServerContext,
  DeductSituationRequest,
  DeductSituationResponse,
} from '../../../../src/generated/server/worldmonitor/intelligence/v1/service_server';

import { cachedFetchJson } from '../../../_shared/redis';
import { callLlm } from '../../../_shared/llm';
import { shouldForceLocalLlm } from '../../../_shared/local-mode';
import { sha256Hex } from './_shared';

const DEDUCT_TIMEOUT_MS = 120_000;
const DEDUCT_CACHE_TTL = 3600;
const DEFAULT_MODEL = 'jarvis-open-source';

export async function deductSituation(
  ctx: ServerContext,
  req: DeductSituationRequest,
): Promise<DeductSituationResponse> {
  const localOnly = shouldForceLocalLlm(ctx?.request?.url);

  const MAX_QUERY_LEN = 500;
  const MAX_GEO_LEN = 2000;

  const query = typeof req.query === 'string' ? req.query.slice(0, MAX_QUERY_LEN).trim() : '';
  const geoContext = typeof req.geoContext === 'string' ? req.geoContext.slice(0, MAX_GEO_LEN).trim() : '';

  if (!query) return { analysis: '', model: '', provider: 'skipped' };

  const cacheKey = `deduct:situation:v1:${(await sha256Hex(query.toLowerCase() + '|' + geoContext.toLowerCase())).slice(0, 16)}`;

  const cached = await cachedFetchJson<{ analysis: string; model: string; provider: string }>(
    cacheKey,
    DEDUCT_CACHE_TTL,
    async () => {
      const systemPrompt = `You are a senior geopolitical intelligence analyst and forecaster.
Your task is to DEDUCT the situation in a near timeline (e.g. 24 hours to a few months) based on the user's query.
- Use any provided geographic or intelligence context.
- Be highly analytical, pragmatic, and objective.
- Identify the most likely outcomes, timelines, and second-order impacts.
- Do NOT use typical AI preambles (e.g., "Here is the deduction", "Let me see").
- Format your response in clean markdown with concise bullet points where appropriate.`;

      let userPrompt = query;
      if (geoContext) {
        userPrompt += `\n\n### Current Intelligence Context\n${geoContext}`;
      }

      const llm = await callLlm({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        provider: localOnly ? undefined : 'groq',
        temperature: 0.3,
        maxTokens: 1500,
        timeoutMs: DEDUCT_TIMEOUT_MS,
        localOnly,
      });

      if (!llm?.content) return null;

      return {
        analysis: llm.content,
        model: llm.model || DEFAULT_MODEL,
        provider: llm.provider || 'unknown',
      };
    },
  );

  if (!cached?.analysis) {
    return { analysis: '', model: '', provider: 'error' };
  }

  return {
    analysis: cached.analysis,
    model: cached.model,
    provider: cached.provider,
  };
}
