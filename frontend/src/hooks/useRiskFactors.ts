import { useState, useEffect } from 'react';
import { getRiskFactors } from '../api';
import type { RiskFactorsResponse } from '../api/types';

export function useRiskFactors(): {
  data: RiskFactorsResponse | null;
  loading: boolean;
  error: string | null;
} {
  const [data, setData] = useState<RiskFactorsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getRiskFactors()
      .then(setData)
      .catch((err) => setError(err.message ?? 'Failed to load risk factors'))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
