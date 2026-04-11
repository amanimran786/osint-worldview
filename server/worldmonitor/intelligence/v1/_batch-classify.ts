import { setCachedJson } from '../../../_shared/redis';
import { callLlm } from '../../../_shared/llm';
import { shouldForceLocalLlm } from '../../../_shared/local-mode';
import { sha256Hex } from './_shared';

const VALID_LEVELS = ['critical', 'high', 'medium', 'low', 'info'];
const VALID_CATEGORIES = [
  'conflict', 'protest', 'disaster', 'diplomatic', 'economic',
  'terrorism', 'cyber', 'health', 'environmental', 'military',
  'crime', 'infrastructure', 'tech', 'general',
];

const CLASSIFY_CACHE_TTL = 86400;
const SKIP_SENTINEL_TTL = 1800;
const BATCH_SIZE = 50;

function sanitizeTitle(title: string): string {
  return title.replace(/[\n\r]/g, ' ').replace(/\|/g, '/').slice(0, 200).trim();
}

const SYSTEM_PROMPT = `You classify news headlines by threat level and category. Return ONLY a JSON array, no other text.

Levels: critical, high, medium, low, info
Categories: conflict, protest, disaster, diplomatic, economic, terrorism, cyber, health, environmental, military, crime, infrastructure, tech, general

Input: numbered lines "index|Title"
Output: [{"i":0,"l":"high","c":"conflict"}, ...]

Focus: geopolitical events, conflicts, disasters, diplomacy. Classify by real-world severity and impact.`;

export async function batchClassifyTitles(
  titles: string[],
  requestUrl?: string,
): Promise<Map<string, { level: string; category: string }>> {
  const results = new Map<string, { level: string; category: string }>();
  const localOnly = shouldForceLocalLlm(requestUrl);

  for (let batch = 0; batch < titles.length; batch += BATCH_SIZE) {
    const chunk = titles.slice(batch, batch + BATCH_SIZE);
    const sanitized = chunk.map(t => sanitizeTitle(t));
    const prompt = sanitized.map((t, i) => `${i}|${t}`).join('\n');

    try {
      const llm = await callLlm({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        provider: localOnly ? undefined : 'groq',
        temperature: 0,
        maxTokens: chunk.length * 40,
        timeoutMs: 30_000,
        localOnly,
      });
      const raw = llm?.content?.trim();
      if (!raw) continue;

      let parsed: Array<{ i?: number; l?: string; c?: string }>;
      try {
        const jsonMatch = raw.match(/\[[\s\S]*\]/);
        if (!jsonMatch) continue;
        parsed = JSON.parse(jsonMatch[0]);
      } catch {
        continue;
      }

      if (!Array.isArray(parsed)) continue;

      const classified = new Set<number>();
      for (const entry of parsed) {
        const idx = entry.i;
        if (typeof idx !== 'number' || idx < 0 || idx >= chunk.length) continue;
        if (classified.has(idx)) continue;
        const level = VALID_LEVELS.includes(entry.l ?? '') ? entry.l! : null;
        const category = VALID_CATEGORIES.includes(entry.c ?? '') ? entry.c! : null;
        if (!level || !category) continue;
        classified.add(idx);

        const originalTitle = chunk[idx]!;
        const cacheKey = `classify:sebuf:v1:${(await sha256Hex(originalTitle.toLowerCase())).slice(0, 16)}`;
        await setCachedJson(cacheKey, { level, category, timestamp: Date.now() }, CLASSIFY_CACHE_TTL);
        results.set(originalTitle, { level, category });
      }

      for (let i = 0; i < chunk.length; i++) {
        if (!classified.has(i)) {
          const cacheKey = `classify:sebuf:v1:${(await sha256Hex(chunk[i]!.toLowerCase())).slice(0, 16)}`;
          await setCachedJson(cacheKey, { level: '_skip', timestamp: Date.now() }, SKIP_SENTINEL_TTL);
        }
      }
    } catch {
      for (const title of chunk) {
        try {
          const cacheKey = `classify:sebuf:v1:${(await sha256Hex(title.toLowerCase())).slice(0, 16)}`;
          await setCachedJson(cacheKey, { level: '_skip', timestamp: Date.now() }, SKIP_SENTINEL_TTL);
        } catch { /* ignore sentinel write failure */ }
      }
    }
  }

  return results;
}
