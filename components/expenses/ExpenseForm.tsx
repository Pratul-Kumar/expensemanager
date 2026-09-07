'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Expense, ExpenseFormData } from '@/types';
import { createExpense, updateExpense } from '@/lib/firestore/expenses';
import { createTag } from '@/lib/firestore/tags';
import { useTags } from '@/hooks/useTags';
import { createRecurringPayment } from '@/lib/firestore/recurring';
import { useAuth } from '@/hooks/useAuth';
import { toDateInputValue } from '@/lib/utils';

interface ExpenseFormProps {
  expense?: Expense | null;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export function ExpenseForm({ expense, onClose, onSuccess, onError }: ExpenseFormProps) {
  const { user } = useAuth();
  const { tags } = useTags();
  const [amount, setAmount] = useState(expense ? String(expense.amount) : '');
  const [note, setNote] = useState(expense?.note ?? '');
  const [tag, setTag] = useState(expense?.tag ?? '');
  const [newTagName, setNewTagName] = useState('');
  const [dateStr, setDateStr] = useState(() => {
    if (expense?.expenseDate) {
      return toDateInputValue(expense.expenseDate.toDate());
    }
    return toDateInputValue(new Date());
  });
  // Recurring state
  const [recurringEnabled, setRecurringEnabled] = useState(false);
  const [frequency, setFrequency] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [reminders, setReminders] = useState<number[]>([7, 3, 1]);
  const [newReminder, setNewReminder] = useState('');

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ amount?: string; date?: string }>({});

  const validate = () => {
    const e: { amount?: string; date?: string } = {};
    const parsed = parseFloat(amount);
    if (!amount.trim() || isNaN(parsed) || parsed <= 0) {
      e.amount = 'Enter a valid amount';
    }
    if (!dateStr) {
      e.date = 'Date is required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAddReminder = () => {
    const val = parseInt(newReminder, 10);
    if (!isNaN(val) && val > 0 && !reminders.includes(val)) {
      setReminders((prev) => [...prev, val].sort((a, b) => b - a));
      setNewReminder('');
    }
  };

  const handleRemoveReminder = (idx: number) => {
    setReminders((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !user) return;
    setSaving(true);
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const expenseDate = new Date(year, month - 1, day);

      if (expense) {
        // Updating existing expense (recurring settings cannot be changed here)
        const data: ExpenseFormData = { amount, note, tag, expenseDate };
        await updateExpense(expense.id, data);
        onSuccess('Expense updated');
      } else {
        if (recurringEnabled) {
          await createRecurringPayment(user.uid, { amount, note, expenseDate }, { frequency, reminderDaysBefore: reminders });
          onSuccess('Recurring expense added');
        } else {
          const data: ExpenseFormData = { amount, note, tag, expenseDate };
          await createExpense(user.uid, data);
          onSuccess('Expense added');
        }
      }
      onClose();
    } catch (err) {
      console.error(err);
      onError('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        id="expense-amount"
        label="Amount"
        type="number"
        inputMode="decimal"
        placeholder="0"
        prefix="₹"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        error={errors.amount}
        autoFocus
        min="0"
        step="0.01"
      />

      <Input
        id="expense-note"
        label="What was this for?"
        placeholder="e.g. Lunch, Auto, Coffee"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <Input
        id="expense-date"
        label="Date"
        type="date"
        value={dateStr}
        onChange={(e) => setDateStr(e.target.value)}
        error={errors.date}
        required
      />

      {/* Tag selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Tag (optional)</label>
        <div className="flex items-center gap-2">
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="flex-1 h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          >
            <option value="">No tag</option>
            {tags.map((t) => (
              <option key={t.id} value={t.name}>{t.name}</option>
            ))}
          </select>
        </div>
        {/* Inline new tag creation */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="New tag name"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            className="flex-1 h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
          <button
            type="button"
            onClick={async () => {
              if (!user || !newTagName.trim()) return;
              try {
                await createTag(user.uid, newTagName.trim());
                setTag(newTagName.trim());
                setNewTagName('');
              } catch (err) {
                console.error('Failed to create tag:', err);
              }
            }}
            disabled={!newTagName.trim()}
            className="h-9 px-3 text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Recurring toggle — only shown when creating a new expense */}
      {!expense && (
        <div className="flex items-center justify-between">
          <label className="font-medium text-sm text-gray-700" htmlFor="recurring-toggle">Recurring Expense</label>
          <button
            id="recurring-toggle"
            type="button"
            role="switch"
            aria-checked={recurringEnabled}
            onClick={() => setRecurringEnabled((v) => !v)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${recurringEnabled ? 'bg-indigo-500' : 'bg-gray-200'}`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${recurringEnabled ? 'translate-x-5' : 'translate-x-0'}`}
            />
          </button>
        </div>
      )}

      {recurringEnabled && !expense && (
        <div className="flex flex-col gap-3 rounded-xl bg-gray-50 p-3 border border-gray-100">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="frequency-select">Repeat</label>
            <select
              id="frequency-select"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as 'weekly' | 'monthly' | 'yearly')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remind me before</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {reminders.map((d, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium">
                  {d} day{d > 1 ? 's' : ''}
                  <button type="button" onClick={() => handleRemoveReminder(i)} className="hover:text-red-500 transition-colors">✕</button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Days"
                value={newReminder}
                onChange={(e) => setNewReminder(e.target.value)}
                min="1"
                className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddReminder}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                + Add Reminder
              </button>
            </div>
          </div>
        </div>
      )}

      <Button type="submit" disabled={saving} className="mt-2">
        {saving ? 'Saving…' : expense ? 'Update Expense' : 'Add Expense'}
      </Button>
    </form>
  );
}
