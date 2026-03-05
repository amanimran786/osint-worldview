/**
 * OpenAI Service — Client-side AI analysis for OSINT signals
 *
 * Uses the user's OpenAI API key stored in localStorage.
 * All calls go directly from browser → OpenAI (no backend proxy).
 *
 * For production with server-side keys, replace these with
 * Vercel Edge Function calls to /api/ai/analyze etc.
 */

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL  = 'gpt-4o-mini';
const STORAGE_KEY    = 'wv_openai_key';

/**
 * Get the stored OpenAI API key — reads from localStorage only.
 * SECURITY: Never use VITE_ env vars for secret keys — Vite inlines them
 * into the production JS bundle where anyone can extract them.
 * Users enter their own key via Settings → stored in localStorage.
 */
export function getOpenAIKey(): string {
  return localStorage.getItem(STORAGE_KEY) ?? '';
}

/** Check if an OpenAI key is configured */
export function hasOpenAIKey(): boolean {
  return getOpenAIKey().length > 0;
}

/** Generic OpenAI chat completion */
async function chatCompletion(
  systemPrompt: string,
  userPrompt: string,
  options?: { model?: string; temperature?: number; maxTokens?: number },
): Promise<string> {
  const key = getOpenAIKey();
  if (!key) throw new Error('OpenAI API key not configured. Go to Settings to add your key.');

  const res = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: options?.model ?? DEFAULT_MODEL,
      temperature: options?.temperature ?? 0.3,
      max_tokens: options?.maxTokens ?? 2000,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error?.message || `OpenAI API error: ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

/* ═══════════════════════════════════════════════════════════════
   OSINT-Specific AI Functions
   ═══════════════════════════════════════════════════════════════ */

/** Analyze a batch of signals for threat assessment */
export async function analyzeSignals(signals: Array<{
  title: string;
  snippet?: string | null;
  source: string;
  severity: number;
  category?: string | null;
}>): Promise<{
  analysis: string;
  threat_level: string;
  key_entities: string[];
  recommended_actions: string[];
}> {
  const signalList = signals
    .map((s, i) => `[${i + 1}] ${s.title} (source: ${s.source}, severity: ${s.severity}/10${s.category ? `, category: ${s.category}` : ''})${s.snippet ? `\n    ${s.snippet}` : ''}`)
    .join('\n');

  const result = await chatCompletion(
    `You are an elite OSINT analyst working for an intelligence agency. Analyze the provided signals and produce a structured threat assessment. Be precise, cite signal numbers, and think like a geopolitical analyst. Output valid JSON only.`,
    `Analyze these ${signals.length} intelligence signals:\n\n${signalList}\n\nReturn JSON with keys: "analysis" (2-3 paragraph assessment), "threat_level" ("low"|"medium"|"high"|"critical"), "key_entities" (array of key actors/locations/organizations), "recommended_actions" (array of recommended next steps).`,
    { temperature: 0.2 },
  );

  try {
    // Extract JSON from potential markdown code blocks
    const jsonStr = result.replace(/```json?\s*/g, '').replace(/```\s*/g, '').trim();
    return JSON.parse(jsonStr);
  } catch {
    return {
      analysis: result,
      threat_level: 'medium',
      key_entities: [],
      recommended_actions: ['Review AI output manually'],
    };
  }
}

/** Summarize a single signal with context */
export async function summarizeSignal(signal: {
  title: string;
  snippet?: string | null;
  url: string;
  source: string;
}): Promise<string> {
  return chatCompletion(
    `You are an OSINT analyst. Provide a concise, actionable intelligence summary of the given signal. Include: what happened, who is involved, potential implications, and recommended follow-up actions. Keep it under 200 words.`,
    `Signal: "${signal.title}"\nSource: ${signal.source}\nURL: ${signal.url}${signal.snippet ? `\nContent: ${signal.snippet}` : ''}`,
  );
}

/** Extract entities from text (people, organizations, locations, etc.) */
export async function extractEntities(text: string): Promise<Array<{
  name: string;
  type: string;
  relevance: string;
}>> {
  const result = await chatCompletion(
    `You are a named entity recognition system for intelligence analysis. Extract all entities from the text. Output valid JSON array only.`,
    `Extract entities from:\n\n"${text}"\n\nReturn JSON array of objects with keys: "name", "type" (person|organization|location|event|weapon|vehicle|technology|financial), "relevance" (brief note on why it matters).`,
  );

  try {
    const jsonStr = result.replace(/```json?\s*/g, '').replace(/```\s*/g, '').trim();
    return JSON.parse(jsonStr);
  } catch {
    return [];
  }
}

/** Generate OSINT investigation suggestions */
export async function suggestInvestigation(topic: string): Promise<string> {
  return chatCompletion(
    `You are an OSINT methodology expert. Given a topic or question, suggest a detailed investigation plan using publicly available tools and techniques. Include specific tool recommendations from the OSINT Bible.`,
    `Topic: "${topic}"\n\nProvide a step-by-step OSINT investigation plan including:\n1. Initial collection strategy\n2. Specific tools to use\n3. Search operators and queries\n4. Verification methods\n5. Potential pivot points\n6. Documentation approach`,
    { maxTokens: 3000, temperature: 0.4 },
  );
}
