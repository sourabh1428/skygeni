import { useState, useEffect } from 'react';
import { getDrivers } from '../api';
import type { DriversResponse } from '../api/types';

export function useDrivers(): {
  data: DriversResponse | null;
  loading: boolean;
  error: string | null;
} {
  const [data, setData] = useState<DriversResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDrivers()
      .then(setData)
      .catch((err) => setError(err.message ?? 'Failed to load drivers'))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
