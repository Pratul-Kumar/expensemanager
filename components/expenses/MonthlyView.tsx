'use client';

import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Expense } from '@/types';
import { formatCurrency, formatMonthYear, getMonthRange } from '@/lib/utils';
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
}

export function MonthlyView({
  expenses,
  loading,
  currentMonth,
  onPrevMonth,
  onNextMonth,
  onToast,
}: MonthlyViewProps) {
  const { filteredExpenses, total } = useMemo(() => {
    const { start, end } = getMonthRange(
      currentMonth.getFullYear(),
      currentMonth.getMonth()
    );
    const filtered = expenses.filter((e) => {
      if (!e.createdAt) return false;
      const d = e.createdAt.toDate();
      return d >= start && d <= end;
    });
    const total = filtered.reduce((sum, e) => sum + e.amount, 0);
    return { filteredExpenses: filtered, total };
  }, [expenses, currentMonth]);

  // Group by date string "d MMMM"
  const groupedByDate = useMemo(() => {
    const groups: Map<string, Expense[]> = new Map();
    for (const exp of filteredExpenses) {
      if (!exp.createdAt) continue;
      const key = format(exp.createdAt.toDate(), 'd MMMM');
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(exp);
    }
    return groups;
  }, [filteredExpenses]);

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

      {/* Monthly summary */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 mb-6 text-center">
        <p className="text-xs text-indigo-500 font-medium uppercase tracking-wide mb-1">Total Expense</p>
        <p className="text-3xl font-bold text-indigo-700">{formatCurrency(total)}</p>
        <p className="text-sm text-indigo-400 mt-1">{filteredExpenses.length} Expenses</p>
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
      {!loading && filteredExpenses.length === 0 && (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">💸</div>
          <p className="text-gray-500 text-sm">No expenses this month</p>
        </div>
      )}

      {/* Grouped expenses */}
      {!loading && filteredExpenses.length > 0 && (
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
