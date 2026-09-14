import { useEffect, useState } from 'react';

/**
 * Runs `fetchFn()` on mount (and whenever `deps` changes) and tracks its
 * result as one of: loading, success (with data — possibly an empty
 * array, which is a valid success, not an error), or error.
 *
 * Deliberately not a caching/refetching library (no React Query, per this
 * sub-phase's scope) — just the minimal state machine every component
 * here needs, in one place instead of seven.
 */
export function useAsyncData(fetchFn, deps = []) {
  const [status, setStatus] = useState('loading');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setError(null);

    fetchFn()
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setStatus('success');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err);
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { status, data, error, isLoading: status === 'loading', isError: status === 'error' };
}
