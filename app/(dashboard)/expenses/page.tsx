'use client';

import React, { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { useExpenses } from '@/hooks/useExpenses';
import { useRecurringPayments } from '@/hooks/useRecurringPayments';
import { useBudget } from '@/hooks/useBudget';
import { useExpenseFilters } from '@/hooks/useExpenseFilters';
import { useTags } from '@/hooks/useTags';
import { useAppContext } from '../layout';
import { MonthlyView } from '@/components/expenses/MonthlyView';
import { ExpenseFilters } from '@/components/expenses/ExpenseFilters';
import { BudgetCard } from '@/components/expenses/BudgetCard';
import { BudgetForm } from '@/components/expenses/BudgetForm';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';
import { Button } from '@/components/ui/Button';
import { formatMonthYear, getRecurringCommitted } from '@/lib/utils';
import { setBudget, deleteBudget } from '@/lib/firestore/budgets';
import { useAuth } from '@/hooks/useAuth';

export default function ExpensesPage() {
  const { user } = useAuth();
  const { expenses, loading: expensesLoading } = useExpenses();
  const { recurring, loading: recurringLoading } = useRecurringPayments();
  const { addToast } = useAppContext();
  const { tags } = useTags();

  const [addOpen, setAddOpen] = useState(false);
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [deleteBudgetOpen, setDeleteBudgetOpen] = useState(false);
  const [savingBudget, setSavingBudget] = useState(false);
  const [deletingBudget, setDeletingBudget] = useState(false);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const { budget, loading: budgetLoading, refresh: refreshBudget } = useBudget(year, month);

  const {
    filters,
    setFilter,
    resetFilters,
    filteredExpenses,
    filteredTotal,
    filteredCount,
    hasActiveFilters,
    monthTotal,
  } = useExpenseFilters(expenses, currentMonth);

  const recurringCommitted = useMemo(() => {
    return getRecurringCommitted(recurring, expenses, year, month);
  }, [recurring, expenses, year, month]);

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    const now = new Date();
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    if (next <= new Date(now.getFullYear(), now.getMonth(), 1)) {
      setCurrentMonth(next);
    }
  };

  const handleSaveBudget = async (amount: number) => {
    if (!user) return;
    setSavingBudget(true);
    try {
      await setBudget(user.uid, year, month, amount);
      addToast('Budget updated');
      refreshBudget();
      setBudgetModalOpen(false);
    } catch (err) {
      console.error(err);
      addToast('Failed to save budget', 'error');
    } finally {
      setSavingBudget(false);
    }
  };

  const handleDeleteBudget = async () => {
    if (!user) return;
    setDeletingBudget(true);
    try {
      await deleteBudget(user.uid, year, month);
      addToast('Budget deleted');
      refreshBudget();
      setDeleteBudgetOpen(false);
    } catch (err) {
      console.error(err);
      addToast('Failed to delete budget', 'error');
    } finally {
      setDeletingBudget(false);
    }
  };

  const monthLabel = formatMonthYear(currentMonth);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Expenses</h1>
        <Button variant="primary" size="sm" onClick={() => setAddOpen(true)} id="add-expense-btn">
          <Plus size={16} />
          Add
        </Button>
      </div>

      {/* Budget Card */}
      <BudgetCard
        budget={budget}
        spent={monthTotal}
        recurringCommitted={recurringCommitted}
        loading={budgetLoading || expensesLoading || recurringLoading}
        monthLabel={monthLabel}
        onSetBudget={() => setBudgetModalOpen(true)}
        onEditBudget={() => setBudgetModalOpen(true)}
        onDeleteBudget={() => setDeleteBudgetOpen(true)}
      />

      {/* Filters */}
      <ExpenseFilters
        filters={filters}
        onFilterChange={setFilter}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
        tags={tags}
      />

      {/* Monthly view */}
      <MonthlyView
        expenses={filteredExpenses}
        loading={expensesLoading}
        currentMonth={currentMonth}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToast={addToast}
        filteredTotal={filteredTotal}
        filteredCount={filteredCount}
        hasActiveFilters={hasActiveFilters}
        monthTotal={monthTotal}
      />

      {/* Add expense modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Expense">
        <ExpenseForm
          onClose={() => setAddOpen(false)}
          onSuccess={(msg) => { addToast(msg); setAddOpen(false); }}
          onError={(msg) => addToast(msg, 'error')}
        />
      </Modal>

      {/* Set/Edit Budget Modal */}
      <Modal
        open={budgetModalOpen}
        onClose={() => setBudgetModalOpen(false)}
        title={`${budget ? 'Edit' : 'Set'} Budget for ${monthLabel}`}
      >
        <BudgetForm
          initialAmount={budget?.amount}
          onSave={handleSaveBudget}
          onClose={() => setBudgetModalOpen(false)}
          saving={savingBudget}
        />
      </Modal>

      {/* Delete Budget Dialog */}
      <ConfirmDialog
        open={deleteBudgetOpen}
        title="Delete Budget?"
        message={`Are you sure you want to delete the budget for ${monthLabel}?`}
        onConfirm={handleDeleteBudget}
        onCancel={() => setDeleteBudgetOpen(false)}
        loading={deletingBudget}
      />
    </div>
  );
}
