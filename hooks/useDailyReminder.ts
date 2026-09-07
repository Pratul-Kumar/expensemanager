'use client';

import { useEffect } from 'react';
import { UserSettings } from '@/types';

const STORAGE_KEY = 'lastExpenseReminderDate';

function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function shouldRemind(settings: UserSettings | null): boolean {
  if (!settings?.dailyReminder?.enabled) return false;

  const now = new Date();
  const { hour, minute } = settings.dailyReminder;

  // Check if current time is past the reminder time
  if (now.getHours() < hour) return false;
  if (now.getHours() === hour && now.getMinutes() < minute) return false;

  // Check if already reminded today
  const today = getTodayStr();
  const last = localStorage.getItem(STORAGE_KEY);
  if (last === today) return false;

  return true;
}

async function sendNotification() {
  if (!('Notification' in window)) return;

  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }

  if (Notification.permission === 'granted') {
    new Notification('Expense Reminder 💸', {
      body: "Don't forget to add today's expenses.",
      icon: '/icons/icon-192.png',
      tag: 'daily-expense-reminder',
    });
    localStorage.setItem(STORAGE_KEY, getTodayStr());
  }
}

export function useDailyReminder(settings: UserSettings | null) {
  useEffect(() => {
    // Check immediately on mount
    if (shouldRemind(settings)) {
      sendNotification();
    }

    // Then check every 60 seconds
    const interval = setInterval(() => {
      if (shouldRemind(settings)) {
        sendNotification();
      }
    }, 60_000);

    return () => clearInterval(interval);
  }, [settings]);
}
