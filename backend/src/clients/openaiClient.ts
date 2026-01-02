import { getEnv } from '../config/env.js';
import type { LLMRequest, LLMResponse } from '../routes/reasoning/types.js';

function parseFirstJsonObject(text: string): unknown {
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

export async function callOpenAI(request: LLMRequest): Promise<LLMResponse> {
  const env = getEnv();
  if (!env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const baseUrl = env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
  const url = `${baseUrl.replace(/\/$/, '')}/chat/completions`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), request.timeoutMs);

  try {
    const messages = [
      { role: 'system', content: request.system || 'You are a helpful assistant.' },
      { role: 'user', content: request.prompt },
    ];

    const body: any = {
      model: request.model,
      temperature: 0,
      messages,
    };

    if (request.jsonOnly) {
      body.response_format = { type: 'json_object' };
      if (!request.system?.includes('JSON')) {
        messages[0].content += ' You must return valid JSON.';
      }
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
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

    let parsed: unknown;
    if (request.jsonOnly) {
      parsed = parseFirstJsonObject(rawText);
    }

    return {
      model: request.model,
      rawText,
      parsed,
    };
  } finally {
    clearTimeout(timeout);
  }
}

