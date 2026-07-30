'use client';

import { useEffect, useState } from 'react';
import { onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { getNotesQuery } from '@/lib/firestore/notes';
import { Note } from '@/types';
import { useAuth } from './useAuth';

export function useNotes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const q = getNotesQuery(user.uid);

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const fetchedNotes = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Note[];

        // Sort: pinned first, then by createdAt desc
        fetchedNotes.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          const aTime = a.createdAt?.toMillis() ?? 0;
          const bTime = b.createdAt?.toMillis() ?? 0;
          return bTime - aTime;
        });

        setNotes(fetchedNotes);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Notes snapshot error:', err);
        setError('Failed to load notes');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  // Reset state when user logs out
  useEffect(() => {
    if (!user) {
      setNotes([]);
      setLoading(false);
    }
  }, [user]);

  return { notes, loading, error };
}
