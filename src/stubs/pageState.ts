import { useState, useCallback, useMemo } from 'react';

export type PageState = 'loading' | 'error' | 'empty' | 'ready';

export interface UsePageStateReturn {
  state: PageState;
  setState: (state: PageState) => void;
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  isReady: boolean;
  retry: () => void;
}

export function usePageState(initial: PageState = 'ready'): UsePageStateReturn {
  const [state, setState] = useState<PageState>(initial);

  const isLoading = state === 'loading';
  const isError = state === 'error';
  const isEmpty = state === 'empty';
  const isReady = state === 'ready';

  const retry = useCallback(() => {
    setState('loading');
    // BACKEND_TODO: Replace with actual fetch logic
    // Simulate network delay for UI testing
    setTimeout(() => {
      setState('ready');
    }, 1000);
  }, []);

  return useMemo(
    () => ({
      state,
      setState,
      isLoading,
      isError,
      isEmpty,
      isReady,
      retry,
    }),
    [state, isLoading, isError, isEmpty, isReady, retry]
  );
}
