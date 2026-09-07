'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { getUserSettings, saveReminderSettings } from '@/lib/firestore/settings';
import { ReminderSettings, UserSettings } from '@/types';

export function useUserSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSettings(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getUserSettings(user.uid)
      .then((s) => {
        if (!cancelled) setSettings(s);
      })
      .catch((err) => console.error('Failed to load settings:', err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const saveReminder = useCallback(
    async (reminder: ReminderSettings) => {
      if (!user) return;
      await saveReminderSettings(user.uid, reminder);
      setSettings((prev) => ({
        ...prev,
        userId: user.uid,
        dailyReminder: reminder,
      } as UserSettings));
    },
    [user]
  );

  return { settings, loading, saveReminder };
}
