import { useState, useEffect } from 'react';
import { getRevenueTrend } from '@/api';
import type { RevenueTrendResponse } from '@/api/types';

export function useRevenueTrend(): {
  data: RevenueTrendResponse | null;
  loading: boolean;
  error: string | null;
} {
  const [data, setData] = useState<RevenueTrendResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getRevenueTrend()
      .then(setData)
      .catch((err) => setError(err.message ?? 'Failed to load revenue trend'))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
