import { getEnv } from '../env';

export interface OpenAiJsonResult {
  model: string;
  rawText: string;
  parsed: unknown;
}

function parseFirstJsonObject(text: string): unknown {
  // We ask for strict JSON, but be defensive.
  const trimmed = text.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return JSON.parse(trimmed);
  }

  const first = trimmed.indexOf('{');
  const last = trimmed.lastIndexOf('}');
  if (first >= 0 && last > first) {
    const slice = trimmed.slice(first, last + 1);
    return JSON.parse(slice);
  }

  throw new Error('No JSON object found in model output');
}

export async function callOpenAiJson(prompt: string, options: {
  model: string;
  timeoutMs: number;
}): Promise<OpenAiJsonResult> {
  const env = getEnv();
  if (!env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs);

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options.model,
        temperature: 0,
        messages: [
          { role: 'system', content: 'You are a deterministic JSON generator.' },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });

    const text = await res.text();

    if (!res.ok) {
      const error = new Error(`OpenAI upstream error (${res.status})`);
      (error as any).status = res.status;
      (error as any).body = text;
      throw error;
    }

    const json = JSON.parse(text) as any;
    const rawText = json?.choices?.[0]?.message?.content;
    if (typeof rawText !== 'string') {
      throw new Error('OpenAI response missing message.content');
    }

    const parsed = parseFirstJsonObject(rawText);

    return {
      model: options.model,
      rawText,
      parsed,
    };
  } finally {
    clearTimeout(timeout);
  }
}


