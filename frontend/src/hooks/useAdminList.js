import { useCallback, useEffect, useState } from 'react';

const DEFAULT_META = { page: 1, limit: 20, total: 0, totalPages: 1 };

/**
 * `fetchFn` is one of the paginated adminApi.* list functions (e.g.
 * adminApi.tours), called as `fetchFn({ page })`. Call `reload()` after
 * any create/update/delete so the visible list reflects the mutation
 * rather than going stale — no page ever shows data as if a mutation
 * silently failed or silently succeeded.
 */
export function useAdminList(fetchFn) {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('loading');
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(DEFAULT_META);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const { data, meta: responseMeta } = await fetchFn({ page });
      setRows(data);
      setMeta(responseMeta ?? { ...DEFAULT_META, page, total: data.length });
      setStatus('success');
    } catch (err) {
      setError(err);
      setStatus('error');
    }
    // fetchFn is a stable module-level function reference (adminApi.*),
    // so only `page` genuinely needs to be a dependency here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    status,
    rows,
    meta,
    page,
    setPage,
    error,
    isLoading: status === 'loading',
    isError: status === 'error',
    isEmpty: status === 'success' && rows.length === 0,
    reload: load,
  };
}
