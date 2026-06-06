import { useEffect, useRef, useState } from 'react';

export function useLiveData<T>(
  fetcher: () => Promise<{ data: T }>,
  intervalMs = 30000
): { data: T | null; loading: boolean; lastUpdated: Date | null } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const run = async () => {
      try {
        const res = await fetcherRef.current();
        if (mountedRef.current) {
          setData(res.data);
          setLastUpdated(new Date());
        }
      } catch {
        // keep stale data on error
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };

    run();
    const id = setInterval(run, intervalMs);
    return () => {
      mountedRef.current = false;
      clearInterval(id);
    };
  }, [intervalMs]);

  return { data, loading, lastUpdated };
}
