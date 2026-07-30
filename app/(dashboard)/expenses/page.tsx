'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useExpenses } from '@/hooks/useExpenses';
import { useAppContext } from '../layout';
import { MonthlyView } from '@/components/expenses/MonthlyView';
import { Modal } from '@/components/ui/Modal';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';
import { Button } from '@/components/ui/Button';

export default function ExpensesPage() {
  const { expenses, loading } = useExpenses();
  const { addToast } = useAppContext();
  const [addOpen, setAddOpen] = useState(false);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

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

      {/* Monthly view */}
      <MonthlyView
        expenses={expenses}
        loading={loading}
        currentMonth={currentMonth}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToast={addToast}
      />

      {/* Add expense modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Expense">
        <ExpenseForm
          onClose={() => setAddOpen(false)}
          onSuccess={(msg) => { addToast(msg); setAddOpen(false); }}
          onError={(msg) => addToast(msg, 'error')}
        />
      </Modal>
    </div>
  );
}
