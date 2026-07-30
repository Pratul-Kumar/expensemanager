'use client';

import { useEffect, useState } from 'react';
import { onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { getExpensesQuery } from '@/lib/firestore/expenses';
import { Expense } from '@/types';
import { useAuth } from './useAuth';

export function useExpenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const q = getExpensesQuery(user.uid);

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const fetched = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Expense[];

        // Sort: newest first based on expenseDate (fallback to createdAt)
        fetched.sort((a, b) => {
          const aTime = a.expenseDate?.toMillis() ?? a.createdAt?.toMillis() ?? 0;
          const bTime = b.expenseDate?.toMillis() ?? b.createdAt?.toMillis() ?? 0;
          return bTime - aTime;
        });

        setExpenses(fetched);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Expenses snapshot error:', err);
        setError('Failed to load expenses');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  // Reset state when user logs out
  useEffect(() => {
    if (!user) {
      setExpenses([]);
      setLoading(false);
    }
  }, [user]);

  return { expenses, loading, error };
}
