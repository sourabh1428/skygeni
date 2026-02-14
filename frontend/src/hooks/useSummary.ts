import { useState, useEffect } from 'react';
import { getSummary } from '../api';
import type { SummaryResponse } from '../api/types';

export function useSummary(): {
  data: SummaryResponse | null;
  loading: boolean;
  error: string | null;
} {
  const [data, setData] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSummary()
      .then(setData)
      .catch((err) => setError(err.message ?? 'Failed to load summary'))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
