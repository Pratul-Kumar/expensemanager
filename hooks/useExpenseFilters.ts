import { useState, useMemo, useCallback } from 'react';
import { Expense, ExpenseFilters } from '@/types';
import { getDefaultFilters, filterExpenses, getMonthRange } from '@/lib/utils';

export function useExpenseFilters(expenses: Expense[], currentMonth: Date) {
  const [filters, setFilters] = useState<ExpenseFilters>(getDefaultFilters());

  const setFilter = useCallback(<K extends keyof ExpenseFilters>(key: K, value: ExpenseFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(getDefaultFilters());
  }, []);

  // Unfiltered month totals (for budget — never affected by filters)
  const { monthTotal, monthExpenseCount } = useMemo(() => {
    const { start, end } = getMonthRange(currentMonth.getFullYear(), currentMonth.getMonth());
    const monthExpenses = expenses.filter((e) => {
      const d = e.expenseDate.toDate();
      return d >= start && d <= end;
    });
    return {
      monthTotal: monthExpenses.reduce((s, e) => s + e.amount, 0),
      monthExpenseCount: monthExpenses.length,
    };
  }, [expenses, currentMonth]);

  // Filtered results
  const filteredExpenses = useMemo(
    () => filterExpenses(expenses, filters, currentMonth),
    [expenses, filters, currentMonth]
  );

  const filteredTotal = useMemo(
    () => filteredExpenses.reduce((s, e) => s + e.amount, 0),
    [filteredExpenses]
  );

  const filteredCount = filteredExpenses.length;

  const hasActiveFilters = useMemo(() => {
    const defaults = getDefaultFilters();
    return (
      filters.search !== defaults.search ||
      filters.type !== defaults.type ||
      filters.dateRange !== defaults.dateRange ||
      filters.minAmount !== defaults.minAmount ||
      filters.maxAmount !== defaults.maxAmount ||
      filters.sort !== defaults.sort ||
      filters.customFrom !== defaults.customFrom ||
      filters.customTo !== defaults.customTo
    );
  }, [filters]);

  return {
    filters,
    setFilter,
    resetFilters,
    filteredExpenses,
    filteredTotal,
    filteredCount,
    hasActiveFilters,
    monthTotal,
    monthExpenseCount,
  };
}
