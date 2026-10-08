import { useCallback, useRef } from 'react';

/**
 * Prevents duplicate submissions. A disabled button alone isn't enough: a
 * fast double click (or Enter + click) can fire twice before React
 * re-renders the disabled state. The ref flips synchronously.
 *
 *   const runOnce = useSubmitLock();
 *   async function handleSubmit(e) {
 *     e.preventDefault();
 *     await runOnce(async () => { ...request... });
 *   }
 *
 * While a call is in flight, further calls return undefined immediately.
 */
export function useSubmitLock() {
  const busy = useRef(false);

  return useCallback(async (fn) => {
    if (busy.current) return undefined;
    busy.current = true;
    try {
      return await fn();
    } finally {
      busy.current = false;
    }
  }, []);
}
