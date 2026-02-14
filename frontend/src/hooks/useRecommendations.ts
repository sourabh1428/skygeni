import { useState, useEffect } from 'react';
import { getRecommendations } from '../api';

export function useRecommendations(): {
  data: string[] | null;
  loading: boolean;
  error: string | null;
} {
  const [data, setData] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getRecommendations()
      .then(setData)
      .catch((err) => setError(err.message ?? 'Failed to load recommendations'))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
