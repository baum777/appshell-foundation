import type { PulseSnapshot, PulseEnvelope } from './types';

export async function fetchGrokPulse(query: string): Promise<PulseSnapshot | null> {
  const res = await fetch(`/api/grok-pulse?query=${encodeURIComponent(query)}`);
  
  if (!res.ok) {
    throw new Error(`Grok Pulse API error: ${res.status}`);
  }
  
  const envelope: PulseEnvelope = await res.json();
  
  if (envelope.status === 'error') {
    throw new Error(envelope.error?.message || 'Unknown error');
  }
  
  return envelope.data;
}

export async function refreshGrokPulse(query: string, secret: string): Promise<PulseSnapshot | null> {
  const res = await fetch(`/api/grok-pulse/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-refresh-secret': secret
    },
    body: JSON.stringify({ query })
  });

  if (!res.ok) {
    throw new Error(`Refresh failed: ${res.status}`);
  }

  const envelope: PulseEnvelope = await res.json();
  return envelope.data;
}

