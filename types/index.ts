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
  expenseDate: Timestamp; // user selected date
  createdAt: Timestamp; // system timestamp
  updatedAt: Timestamp; // system timestamp
  recurringPaymentId?: string; // optional link to recurring schedule
}

export interface ExpenseFormData {
  amount: string;
  note: string;
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
