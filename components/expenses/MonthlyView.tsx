'use client';

import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Expense } from '@/types';
import { formatCurrency, formatMonthYear } from '@/lib/utils';
import { ExpenseItem } from './ExpenseItem';
import { ExpenseItemSkeleton } from '@/components/ui/Skeleton';
import { format } from 'date-fns';

interface MonthlyViewProps {
  expenses: Expense[];
  loading: boolean;
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToast: (msg: string, type?: 'success' | 'error') => void;
  filteredTotal?: number;
  filteredCount?: number;
  hasActiveFilters?: boolean;
  monthTotal?: number;
}

export function MonthlyView({
  expenses,
  loading,
  currentMonth,
  onPrevMonth,
  onNextMonth,
  onToast,
  filteredTotal,
  filteredCount,
  hasActiveFilters = false,
  monthTotal,
}: MonthlyViewProps) {
  // Expenses received are already pre-filtered by parent component/hook
  const total = useMemo(() => {
    if (typeof filteredTotal === 'number') return filteredTotal;
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses, filteredTotal]);

  const count = typeof filteredCount === 'number' ? filteredCount : expenses.length;

  // Group by date string "d MMMM" using expenseDate (fallback to createdAt)
  const groupedByDate = useMemo(() => {
    const groups: Map<string, Expense[]> = new Map();
    for (const exp of expenses) {
      const targetTimestamp = exp.expenseDate || exp.createdAt;
      if (!targetTimestamp) continue;
      const key = format(targetTimestamp.toDate(), 'd MMMM');
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(exp);
    }
    return groups;
  }, [expenses]);

  const isCurrentMonth =
    currentMonth.getFullYear() === new Date().getFullYear() &&
    currentMonth.getMonth() === new Date().getMonth();

  return (
    <div>
      {/* Month navigator */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onPrevMonth}
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="font-semibold text-gray-900 text-base">{formatMonthYear(currentMonth)}</h2>
        <button
          onClick={onNextMonth}
          disabled={isCurrentMonth}
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Next month"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Summary card */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 mb-6 text-center">
        {hasActiveFilters && typeof monthTotal === 'number' ? (
          <div className="flex flex-col gap-2">
            <div>
              <p className="text-xs text-indigo-400 font-medium uppercase tracking-wide">
                {formatMonthYear(currentMonth)} Total
              </p>
              <p className="text-xl font-semibold text-indigo-900">{formatCurrency(monthTotal)}</p>
            </div>
            <div className="pt-2 border-t border-indigo-100/60">
              <p className="text-xs text-indigo-600 font-bold uppercase tracking-wide">Filtered Result</p>
              <p className="text-3xl font-bold text-indigo-700">{formatCurrency(total)}</p>
              <p className="text-sm text-indigo-500 font-medium mt-0.5">{count} expenses</p>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-xs text-indigo-500 font-medium uppercase tracking-wide mb-1">Total Expense</p>
            <p className="text-3xl font-bold text-indigo-700">{formatCurrency(total)}</p>
            <p className="text-sm text-indigo-400 mt-1">{count} Expenses</p>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-px divide-y divide-gray-50">
          {[...Array(5)].map((_, i) => (
            <ExpenseItemSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && expenses.length === 0 && (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">💸</div>
          <p className="text-gray-500 text-sm">
            {hasActiveFilters ? 'No expenses match the selected filters' : 'No expenses this month'}
          </p>
        </div>
      )}

      {/* Grouped expenses */}
      {!loading && expenses.length > 0 && (
        <div className="space-y-6">
          {[...groupedByDate.entries()].map(([dateLabel, exps]) => (
            <div key={dateLabel}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{dateLabel}</p>
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm divide-y divide-gray-50">
                {exps.map((exp) => (
                  <div key={exp.id} className="px-4">
                    <ExpenseItem expense={exp} onToast={onToast} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
