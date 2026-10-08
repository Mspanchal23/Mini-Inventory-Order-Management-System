import { useCallback, useEffect, useState } from 'react';

/**
 * Run an API call whenever `deps` change.
 * Returns { data, meta, loading, error, refetch }. Stale responses are ignored.
 */
export default function useFetch(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, meta: null, loading: true, error: null });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    fetcher()
      .then((res) => {
        if (active) setState({ data: res.data, meta: res.meta ?? null, loading: false, error: null });
      })
      .catch((error) => {
        if (active) setState((prev) => ({ ...prev, loading: false, error }));
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey]);

  const refetch = useCallback(() => setReloadKey((key) => key + 1), []);

  return { ...state, refetch };
}
