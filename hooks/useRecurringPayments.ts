import { useEffect, useState } from 'react';
import { onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { getUpcomingRecurringPayments } from '@/lib/firestore/recurring';
import { RecurringPayment } from '@/types';
import { useAuth } from './useAuth';

export function useRecurringPayments(refreshCounter?: number) {
  const { user } = useAuth();
  const [recurring, setRecurring] = useState<RecurringPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const fetch = async () => {
      try {
        const data = await getUpcomingRecurringPayments(user.uid);
        setRecurring(data);
        setError(null);
      } catch (e) {
        console.error('Recurring fetch error', e);
        setError('Failed to load recurring payments');
      } finally {
        setLoading(false);
      }
    };
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, refreshCounter]);

  return { recurring, loading, error };
}
