'use client';

import { useEffect, useState } from 'react';
import { onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { getTagsQuery } from '@/lib/firestore/tags';
import { Tag } from '@/types';
import { useAuth } from './useAuth';

export function useTags() {
  const { user } = useAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setTags([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = getTagsQuery(user.uid);

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const fetched = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Tag[];

        // Sort alphabetically
        fetched.sort((a, b) => a.name.localeCompare(b.name));

        setTags(fetched);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Tags snapshot error:', err);
        setError('Failed to load tags');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  return { tags, loading, error };
}
