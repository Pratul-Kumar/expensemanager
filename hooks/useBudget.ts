import { useEffect, useState, useCallback } from 'react';
import { getBudget as fetchBudget } from '@/lib/firestore/budgets';
import { Budget } from '@/types';
import { useAuth } from './useAuth';

export function useBudget(year: number, month: number) {
  const { user } = useAuth();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);

  const refresh = useCallback(() => setRefreshCount((c) => c + 1), []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchBudget(user.uid, year, month)
      .then((b) => setBudget(b))
      .catch((e) => console.error('Budget fetch error', e))
      .finally(() => setLoading(false));
  }, [user, year, month, refreshCount]);

  return { budget, loading, refresh };
}
