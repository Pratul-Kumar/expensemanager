import { addDays, addWeeks, addMonths, addYears, isValid } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import { Expense, ExpenseFilters, RecurringPayment, BudgetCalculation, BudgetStatus } from '@/types';

// ── Timestamp helpers ──

export const toTimestamp = (date: Date | Timestamp): Timestamp => {
  return date instanceof Timestamp ? date : Timestamp.fromDate(date);
};

// ── Date calculation helpers ──

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

export const daysUntil = (target: Date): number => {
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
};

// ── Formatting helpers ──

export const formatDate = (date: Date | Timestamp): string => {
  const d = date instanceof Timestamp ? date.toDate() : date;
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};

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

export const formatCurrency = (amount: number, currency: string = 'INR', locale: string = 'en-IN'): string => {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
};

export const formatMonthYear = (date: Date | Timestamp): string => {
  const d = date instanceof Timestamp ? date.toDate() : date;
  return new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(d);
};

// ── Reminder helpers ──

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

// ── Date input helpers ──

export const toDateInputValue = (date: Date | null): string => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const toTimeInputValue = (date: Date | null): string => {
  if (!date) return '';
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const combineDateAndTime = (dateStr: string, timeStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);
  return new Date(year, month - 1, day, hour ?? 0, minute ?? 0);
};

// ── Month range ──

export const getMonthRange = (year: number, month: number): { start: Date; end: Date } => {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

// ── Budget calculation (shared utility) ──

export function getBudgetStatus(allocated: number, budget: number): BudgetStatus {
  const pct = (allocated / budget) * 100;
  if (pct >= 100) return 'exceeded';
  if (pct >= 80) return 'approaching';
  return 'on-track';
}

export function calculateBudget(
  budgetAmount: number,
  spent: number,
  recurringCommitted: number
): BudgetCalculation {
  const allocated = spent + recurringCommitted;
  const leftBudget = budgetAmount - allocated;
  const percentageAllocated = budgetAmount > 0 ? (allocated / budgetAmount) * 100 : 0;
  const status = getBudgetStatus(allocated, budgetAmount);
  const overBudgetAmount = Math.max(0, allocated - budgetAmount);

  return {
    spent,
    recurringCommitted,
    allocated,
    leftBudget,
    percentageAllocated,
    status,
    overBudgetAmount,
  };
}

/**
 * Determine how much recurring commitment is unpaid for a given month.
 *
 * For each active recurring payment whose nextDueDate falls in the month:
 * - Check if an expense exists with matching recurringPaymentId AND
 *   recurringOccurrenceDate in the same month (handles early/late payments).
 * - Fallback for legacy data: check recurringPaymentId + expenseDate in month.
 * - If no matching expense found, count the amount as committed.
 */
export function getRecurringCommitted(
  recurringPayments: RecurringPayment[],
  expenses: Expense[],
  year: number,
  month: number
): number {
  const { start, end } = getMonthRange(year, month);
  let committed = 0;

  for (const rp of recurringPayments) {
    if (!rp.isActive) continue;

    const dueDate = rp.nextDueDate.toDate();
    if (dueDate < start || dueDate > end) continue;

    // Check if this occurrence has been paid
    const isPaid = expenses.some((e) => {
      if (e.recurringPaymentId !== rp.id) return false;

      // Primary check: recurringOccurrenceDate in the same month
      if (e.recurringOccurrenceDate) {
        const occDate = e.recurringOccurrenceDate.toDate();
        return occDate >= start && occDate <= end;
      }

      // Fallback for legacy data without recurringOccurrenceDate:
      // check if expenseDate is in the same month
      const expDate = e.expenseDate.toDate();
      return expDate >= start && expDate <= end;
    });

    if (!isPaid) {
      committed += rp.amount;
    }
  }

  return committed;
}

// ── Expense filtering ──

export function getDefaultFilters(): ExpenseFilters {
  return {
    search: '',
    type: 'all',
    dateRange: 'this-month',
    customFrom: '',
    customTo: '',
    minAmount: '',
    maxAmount: '',
    sort: 'newest',
  };
}

export function filterExpenses(
  expenses: Expense[],
  filters: ExpenseFilters,
  currentMonth: Date
): Expense[] {
  let result = [...expenses];

  // Search by note
  if (filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    result = result.filter((e) => e.note.toLowerCase().includes(q));
  }

  // Type filter
  if (filters.type === 'normal') {
    result = result.filter((e) => !e.recurringPaymentId);
  } else if (filters.type === 'recurring') {
    result = result.filter((e) => !!e.recurringPaymentId);
  }

  // Date filter
  const now = new Date();
  let dateStart: Date | null = null;
  let dateEnd: Date | null = null;

  switch (filters.dateRange) {
    case 'this-month': {
      const range = getMonthRange(currentMonth.getFullYear(), currentMonth.getMonth());
      dateStart = range.start;
      dateEnd = range.end;
      break;
    }
    case 'last-month': {
      const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
      const range = getMonthRange(lastMonth.getFullYear(), lastMonth.getMonth());
      dateStart = range.start;
      dateEnd = range.end;
      break;
    }
    case 'this-year': {
      dateStart = new Date(currentMonth.getFullYear(), 0, 1);
      dateEnd = new Date(currentMonth.getFullYear(), 11, 31, 23, 59, 59, 999);
      break;
    }
    case 'custom': {
      if (filters.customFrom) {
        const [y, m, d] = filters.customFrom.split('-').map(Number);
        dateStart = new Date(y, m - 1, d);
      }
      if (filters.customTo) {
        const [y, m, d] = filters.customTo.split('-').map(Number);
        dateEnd = new Date(y, m - 1, d, 23, 59, 59, 999);
      }
      break;
    }
  }

  if (dateStart) {
    result = result.filter((e) => e.expenseDate.toDate() >= dateStart!);
  }
  if (dateEnd) {
    result = result.filter((e) => e.expenseDate.toDate() <= dateEnd!);
  }

  // Amount filter
  if (filters.minAmount) {
    const min = parseFloat(filters.minAmount);
    if (!isNaN(min)) result = result.filter((e) => e.amount >= min);
  }
  if (filters.maxAmount) {
    const max = parseFloat(filters.maxAmount);
    if (!isNaN(max)) result = result.filter((e) => e.amount <= max);
  }

  // Sort
  switch (filters.sort) {
    case 'newest':
      result.sort((a, b) => b.expenseDate.toMillis() - a.expenseDate.toMillis());
      break;
    case 'oldest':
      result.sort((a, b) => a.expenseDate.toMillis() - b.expenseDate.toMillis());
      break;
    case 'highest':
      result.sort((a, b) => b.amount - a.amount);
      break;
    case 'lowest':
      result.sort((a, b) => a.amount - b.amount);
      break;
  }

  return result;
}
