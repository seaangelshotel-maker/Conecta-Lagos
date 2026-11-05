import { useEffect, useState, useCallback } from 'react';
export default function useSWR(key, fetcher) {
  const [data, setData] = useState(undefined);
  const [error, setError] = useState(undefined);
  const run = useCallback(() => { if (!key) return; Promise.resolve(fetcher(key)).then(setData, setError); }, [key]);
  useEffect(() => { run(); }, [run]);
  return { data, error, isLoading: data === undefined && !error, mutate: run };
}
export const mutate = () => {};
