import { useState, useEffect, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import type { ApiResponse } from '@/types';

interface UseApiOptions {
  immediate?: boolean;
}

export function useApi<T>(
  url: string,
  options: UseApiOptions = { immediate: true }
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get<ApiResponse<T>>(url);
      setData(response.data.data);
    } catch (err) {
      const error = err as AxiosError<ApiResponse<null>>;
      setError(error.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (options.immediate) {
      execute();
    }
  }, [options.immediate, execute]);

  return { data, loading, error, refetch: execute };
}
