import { addDays, addWeeks, addMonths, addYears, isValid } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

/**
 * Convert a JavaScript Date (or Timestamp) to a Firebase Timestamp.
 */
export const toTimestamp = (date: Date | Timestamp): Timestamp => {
  return date instanceof Timestamp ? date : Timestamp.fromDate(date);
};

/**
 * Compute the next due date based on the current due date and frequency.
 * Preserves the original due day for monthly/yearly recurrences to avoid drift.
 */
export const computeNextDueDate = (
  currentDue: Date,
  frequency: 'weekly' | 'monthly' | 'yearly',
  originalDueDay?: number
): Date => {
  switch (frequency) {
    case 'weekly':
      return addWeeks(currentDue, 1);
    case 'monthly': {
      const day = originalDueDay ?? currentDue.getDate();
      const next = addMonths(currentDue, 1);
      // Preserve original day, handling month length variations
      const month = next.getMonth();
      const year = next.getFullYear();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const targetDay = Math.min(day, daysInMonth);
      return new Date(year, month, targetDay);
    }
    case 'yearly': {
      const day = originalDueDay ?? currentDue.getDate();
      const month = currentDue.getMonth();
      const nextYear = currentDue.getFullYear() + 1;
      const daysInMonth = new Date(nextYear, month + 1, 0).getDate();
      const targetDay = Math.min(day, daysInMonth);
      return new Date(nextYear, month, targetDay);
    }
    default:
      return currentDue;
  }
};

/**
 * Helper to calculate days difference between now and a target date.
 */
export const daysUntil = (target: Date): number => {
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
};

/**
 * Format a JavaScript Date or Timestamp to a readable date string (e.g., "30 Jul 2026").
 */
export const formatDate = (date: Date | Timestamp): string => {
  const d = date instanceof Timestamp ? date.toDate() : date;
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};

/**
 * Format a Date or Timestamp with time (e.g., "30 Jul 2026, 14:05").
 */
export const formatDateTime = (date: Date | Timestamp): string => {
  const d = date instanceof Timestamp ? date.toDate() : date;
  return d.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

/**
 * Determine reminder status relative to now.
 * Returns "upcoming", "today", or "overdue".
 */
export const getReminderStatus = (reminderAt: Timestamp | null): 'upcoming' | 'today' | 'overdue' | null => {
  if (!reminderAt) return null;
  const now = new Date();
  const target = reminderAt.toDate();
  const diff = target.getTime() - now.getTime();
  const oneDay = 24 * 60 * 60 * 1000;
  if (diff > oneDay) return 'upcoming';
  if (diff >= 0 && diff <= oneDay) return 'today';
  return 'overdue';
};

/**
 * Convert a Date to a value suitable for <input type="date"> (yyyy-mm-dd).
 */
export const toDateInputValue = (date: Date | null): string => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Convert a Date to a value suitable for <input type="time"> (HH:MM).
 */
export const toTimeInputValue = (date: Date | null): string => {
  if (!date) return '';
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Combine separate date and time strings into a single Date object.
 */
export const combineDateAndTime = (dateStr: string, timeStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);
  return new Date(year, month - 1, day, hour ?? 0, minute ?? 0);
};

/**
 * Format a number as currency string. Defaults to Indian Rupee.
 */
export const formatCurrency = (amount: number, currency: string = 'INR', locale: string = 'en-IN'): string => {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
};

/**
 * Format a date as "Month Year" (e.g., "July 2026").
 */
export const formatMonthYear = (date: Date | Timestamp): string => {
  const d = date instanceof Timestamp ? date.toDate() : date;
  return new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(d);
};

/**
 * Get the start and end Date objects for a given month.
 */
export const getMonthRange = (year: number, month: number): { start: Date; end: Date } => {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
  return { start, end };
};
