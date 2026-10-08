import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * List state (page, limit, search, filters, sort) kept in the URL query string,
 * so refresh / back button / shared links keep the same view.
 * `defaults` must be a constant defined outside the component.
 */
export default function useTableState(defaults) {
  const [searchParams, setSearchParams] = useSearchParams();

  const params = useMemo(() => {
    const result = { ...defaults };
    Object.keys(defaults).forEach((key) => {
      const raw = searchParams.get(key);
      if (raw === null) return;
      result[key] = typeof defaults[key] === 'number' ? Number(raw) || defaults[key] : raw;
    });
    return result;
  }, [searchParams, defaults]);

  /** Update one or more params. Any change other than `page` sends you back to page 1. */
  const setParams = useCallback(
    (updates) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          const merged = 'page' in updates ? updates : { ...updates, page: defaults.page };
          Object.entries(merged).forEach(([key, value]) => {
            if (value === '' || value == null || value === defaults[key]) next.delete(key);
            else next.set(key, String(value));
          });
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams, defaults],
  );

  /** Toggle sort direction for a column, or sort by a new column descending. */
  const toggleSort = useCallback(
    (column) => {
      const order = params.sortBy === column && params.order === 'desc' ? 'asc' : 'desc';
      setParams({ sortBy: column, order });
    },
    [params.sortBy, params.order, setParams],
  );

  return { params, setParams, toggleSort };
}
