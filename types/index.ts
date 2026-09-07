import { Timestamp } from 'firebase/firestore';

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  isPinned: boolean;
  reminderAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface NoteFormData {
  title: string;
  content: string;
  isPinned: boolean;
  reminderAt: Date | null;
}

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  note: string;
  tag?: string; // optional label (e.g. "Rahul", "Goa Trip")
  expenseDate: Timestamp; // when money was actually paid
  createdAt: Timestamp; // system timestamp
  updatedAt: Timestamp; // system timestamp
  recurringPaymentId?: string; // link to recurring schedule
  recurringOccurrenceDate?: Timestamp; // which scheduled occurrence was satisfied
}

export interface ExpenseFormData {
  amount: string;
  note: string;
  tag?: string; // optional label
  expenseDate: Date; // user selected date
  recurring?: {
    enabled: boolean;
    frequency: 'weekly' | 'monthly' | 'yearly';
    reminders: number[]; // days before due date, can be empty
  };
}

export interface RecurringPayment {
  id: string;
  userId: string;
  name: string; // same as note
  amount: number;
  frequency: 'weekly' | 'monthly' | 'yearly';
  originalDueDay: number; // day of month for monthly/yearly to preserve 31st logic
  nextDueDate: Timestamp;
  reminderDaysBefore: number[]; // e.g., [7,3,1]
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export type ReminderStatus = 'upcoming' | 'today' | 'overdue';

// ── Expense Filters ──

export interface ExpenseFilters {
  search: string;
  type: 'all' | 'normal' | 'recurring';
  tag: string; // '' = all tags
  dateRange: 'this-month' | 'last-month' | 'this-year' | 'custom';
  customFrom: string; // yyyy-mm-dd or ''
  customTo: string;   // yyyy-mm-dd or ''
  minAmount: string;  // '' or numeric string
  maxAmount: string;  // '' or numeric string
  sort: 'newest' | 'oldest' | 'highest' | 'lowest';
}

// ── Monthly Budget ──

export interface Budget {
  id: string;
  userId: string;
  year: number;
  month: number; // 0-indexed
  amount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface BudgetFormData {
  amount: string;
}

export type BudgetStatus = 'on-track' | 'approaching' | 'exceeded';

export interface BudgetCalculation {
  spent: number;              // actual expense total for the month
  recurringCommitted: number; // unpaid recurring due this month
  allocated: number;          // spent + recurringCommitted
  leftBudget: number;         // budget - allocated (can be negative)
  percentageAllocated: number;// (allocated / budget) * 100
  status: BudgetStatus;
  overBudgetAmount: number;   // max(0, allocated - budget)
}

// ── Tags ──

export interface Tag {
  id: string;
  userId: string;
  name: string;
  createdAt: Timestamp;
}

// ── User Settings (Daily Reminder) ──

export interface ReminderSettings {
  enabled: boolean;
  hour: number;   // 0-23
  minute: number; // 0-59
}

export interface EmailPreferences {
  welcomeEmail: boolean;
  importantNotifications: boolean;
}

export interface UserSettings {
  userId: string;
  dailyReminder: ReminderSettings;
  emailPreferences?: EmailPreferences;
  welcomeEmailSent?: boolean;
  updatedAt: Timestamp;
}
