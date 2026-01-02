import { useState, useEffect } from 'react';
import { fetchGrokPulse } from '../services/grokPulse/client';
import type { PulseSnapshot } from '../services/grokPulse/types';

interface UseGrokPulseResult {
  data: PulseSnapshot | null;
  isLoading: boolean;
  error: Error | null;
  isStale: boolean;
}

export function useGrokPulse(query: string): UseGrokPulseResult {
  const [data, setData] = useState<PulseSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query) {
      setData(null);
      return;
    }

    let mounted = true;
    setIsLoading(true);
    setError(null);

    fetchGrokPulse(query)
      .then(snapshot => {
        if (mounted) {
          setData(snapshot);
          setIsLoading(false);
        }
      })
      .catch(err => {
        if (mounted) {
          setError(err);
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [query]);

  const isStale = data?.meta?.cache === 'stale' || false;

  return { data, isLoading, error, isStale };
}

