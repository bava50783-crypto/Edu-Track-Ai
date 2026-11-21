import * as dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel, type Schema } from '@google/genai';

export function getGeminiClient(): GoogleGenAI {
  if (!process.env.GEMINI_API_KEY) {
    dotenv.config({ override: true, quiet: true });
  }
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the server environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      timeout: 12000,
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function isTransientError(err: any): boolean {
  const status = Number(err?.status);
  const msg = String(err?.message || '').toUpperCase();
  return (
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    msg.includes('DEADLINE_EXCEEDED') ||
    msg.includes('UNAVAILABLE') ||
    msg.includes('ABORT') ||
    msg.includes('TIMEOUT')
  );
}

export async function generateGeminiContent(opts: {
  contents: string;
  systemInstruction?: string;
  responseMimeType?: string;
  responseSchema?: Schema;
  preferDeepModel?: boolean;
  thinkingLevel?: ThinkingLevel;
}) {
  const ai = getGeminiClient();

  const modelsToTry = opts.preferDeepModel
    ? ['gemini-4-hydrogen', 'gemini-3.1-flash-lite']
    : ['gemini-3.1-flash-lite', 'gemini-4-hydrogen'];

  let lastErr: any = null;

  for (let idx = 0; idx < modelsToTry.length; idx++) {
    const model = modelsToTry[idx];
    const maxAttempts = idx === 0 && modelsToTry.length > 1 ? 1 : 2;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const config: Record<string, any> = {};
        if (opts.systemInstruction) config.systemInstruction = opts.systemInstruction;
        if (opts.responseMimeType) config.responseMimeType = opts.responseMimeType;
        if (opts.responseSchema) config.responseSchema = opts.responseSchema;
        if (model === 'gemini-4-hydrogen' && opts.thinkingLevel) {
          config.thinkingConfig = { thinkingLevel: opts.thinkingLevel };
        }

        const response = await ai.models.generateContent({
          model,
          contents: opts.contents,
          config: Object.keys(config).length > 0 ? config : undefined,
        });
        return response;
      } catch (err: any) {
        lastErr = err;
        if (!isTransientError(err)) {
          throw err;
        }
        await new Promise((r) => setTimeout(r, 250 * (attempt + 1)));
      }
    }
  }

  throw lastErr || new Error('Gemini API request failed.');
}

export function safeParseJson<T>(rawText: string | undefined, fallback: T): T {
  if (!rawText) return fallback;
  const cleaned = rawText
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  return JSON.parse(cleaned) as T;
}
