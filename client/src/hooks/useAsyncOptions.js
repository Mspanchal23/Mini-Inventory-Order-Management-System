import { useEffect, useState } from 'react';

/**
 * Load Autocomplete options from the API for a (debounced) query.
 * `fetchOptions(query)` must be stable (defined outside the component).
 */
export default function useAsyncOptions(fetchOptions, query, enabled = true) {
  const [result, setResult] = useState({ query: null, options: [] });

  useEffect(() => {
    if (!enabled) return undefined;
    let active = true;
    fetchOptions(query)
      .then((res) => active && setResult({ query, options: res.data }))
      .catch(() => active && setResult({ query, options: [] }));
    return () => {
      active = false;
    };
  }, [fetchOptions, query, enabled]);

  return { options: result.options, loading: enabled && result.query !== query };
}
