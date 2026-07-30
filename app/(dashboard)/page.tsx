'use client';

import React, { useMemo, useState } from 'react';
import { Plus, Bell, Wallet, StickyNote, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useNotes } from '@/hooks/useNotes';
import { useExpenses } from '@/hooks/useExpenses';
import { useAppContext } from './layout';
import { Modal } from '@/components/ui/Modal';
import { NoteEditor } from '@/components/notes/NoteEditor';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';
import { ExpenseItem } from '@/components/expenses/ExpenseItem';
import { RecurringPaymentCard } from '@/components/expenses/RecurringPaymentCard';
import { useRecurringPayments } from '@/hooks/useRecurringPayments';
import { formatCurrency, formatDateTime, getReminderStatus, getMonthRange } from '@/lib/utils';
import { DashboardStatSkeleton, ExpenseItemSkeleton } from '@/components/ui/Skeleton';
import { Note } from '@/types';
import { NoteCard } from '@/components/notes/NoteCard';

const reminderStatusStyles = {
  upcoming: 'text-blue-600 bg-blue-50',
  today: 'text-green-600 bg-green-50',
  overdue: 'text-red-600 bg-red-50',
};

export default function HomePage() {
  const { userProfile } = useAuth();
  const { notes, loading: notesLoading } = useNotes();
  const { expenses, loading: expensesLoading } = useExpenses();
  const { addToast } = useAppContext();
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);

  // State to control filter for recurring-origin expenses
  const [showRecurringOrigin, setShowRecurringOrigin] = useState(true);
  // Refresh counter for recurring payments list
  const [refreshCounter, setRefreshCounter] = useState(0);
  const { recurring, loading: recurringLoading, error: recurringError } = useRecurringPayments(refreshCounter);

  const now = new Date();
  const nowYear = now.getFullYear();
  const nowMonth = now.getMonth();
  const firstName = userProfile?.displayName?.split(' ')[0] ?? 'there';

  const { monthTotal, monthExpenseCount } = useMemo(() => {
    const { start, end } = getMonthRange(now.getFullYear(), now.getMonth());
    const monthExpenses = expenses.filter((e) => {
      if (!e.expenseDate) return false;
      const d = e.expenseDate.toDate();
      return d >= start && d <= end;
    });
    return {
      monthTotal: monthExpenses.reduce((s, e) => s + e.amount, 0),
      monthExpenseCount: monthExpenses.length,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenses, nowYear, nowMonth]);

  // Pinned Notes
  const pinnedNotes = useMemo(() => notes.filter((n) => n.isPinned), [notes]);

  // Upcoming reminders
  const upcomingReminders = useMemo(() =>
    notes
      .filter((n) => n.reminderAt != null)
      .sort((a, b) => a.reminderAt!.toMillis() - b.reminderAt!.toMillis())
      .slice(0, 5),
    [notes]
  );

  // Recent expenses (filtered if needed)
  const recentExpenses = useMemo(() => {
    const list = showRecurringOrigin
      ? expenses
      : expenses.filter((e) => !e.recurringPaymentId);
    return list.slice(0, 5);
  }, [expenses, showRecurringOrigin]);

  const handleCreateNoteClick = () => {
    setEditingNote(null);
    setNoteModalOpen(true);
  };

  const handleEditNoteClick = (note: Note) => {
    setEditingNote(note);
    setNoteModalOpen(true);
  };

  const refreshRecurring = () => setRefreshCounter((c) => c + 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm text-gray-400">Hi, {firstName} 👋</p>
        <h1 className="text-xl font-bold text-gray-900 mt-0.5">MySpace</h1>
      </div>

      {/* This Month */}
      <section>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">This Month</h2>
        {expensesLoading || notesLoading ? (
          <div className="grid grid-cols-2 gap-3">
            <DashboardStatSkeleton />
            <DashboardStatSkeleton />
            <DashboardStatSkeleton />
            <DashboardStatSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm col-span-2">
              <p className="text-xs text-gray-400 mb-1">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(monthTotal)}</p>
              <p className="text-xs text-gray-400 mt-0.5">{monthExpenseCount} expenses</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center mb-2">
                <StickyNote size={15} className="text-indigo-500" />
              </div>
              <p className="text-xl font-bold text-gray-900">{notes.length}</p>
              <p className="text-xs text-gray-400">Notes</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center mb-2">
                <Bell size={15} className="text-amber-500" />
              </div>
              <p className="text-xl font-bold text-gray-900">{upcomingReminders.length}</p>
              <p className="text-xs text-gray-400">Reminders</p>
            </div>
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleCreateNoteClick}
            className="flex items-center justify-center gap-2 bg-indigo-500 text-white rounded-2xl py-4 font-medium text-sm shadow-sm hover:bg-indigo-600 active:bg-indigo-700 transition-colors"
          >
            <Plus size={18} />
            Add Note
          </button>
          <button
            onClick={() => setExpenseModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-white border border-gray-100 text-gray-700 rounded-2xl py-4 font-medium text-sm shadow-sm hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            <Wallet size={18} className="text-indigo-500" />
            Add Expense
          </button>
        </div>
      </section>

      {/* Pinned Notes */}
      {pinnedNotes.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Pinned Notes</h2>
            <Link href="/notes" className="text-xs text-indigo-500 font-medium flex items-center gap-1 hover:underline">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {pinnedNotes.map((note) => (
              <NoteCard key={note.id} note={note} onEdit={handleEditNoteClick} onToast={addToast} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Reminders */}
      {upcomingReminders.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Upcoming Reminders</h2>
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm divide-y divide-gray-50">
            {upcomingReminders.map((note: Note) => {
              const status = getReminderStatus(note.reminderAt);
              return (
                <div key={note.id} className="flex items-center justify-between px-4 py-3 gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{note.title || 'Untitled'}</p>
                    <p className="text-xs text-gray-400">{note.reminderAt ? formatDateTime(note.reminderAt) : ''}</p>
                  </div>
                  {status && (
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 capitalize ${reminderStatusStyles[status]}`}>
                      {status}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Upcoming Recurring Payments */}
      {recurringLoading ? (
        <p className="text-sm text-gray-500">Loading recurring payments…</p>
      ) : recurringError ? (
        <p className="text-sm text-red-500">{recurringError}</p>
      ) : recurring.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Upcoming Recurring Payments</h2>
          <div className="grid gap-3">
            {recurring.map((pay) => (
              <RecurringPaymentCard key={pay.id} payment={pay} onAction={refreshRecurring} />
            ))}
          </div>
        </section>
      )}

      {/* Filter toggle */}
      <div className="flex items-center space-x-2 mt-4">
        <input
          type="checkbox"
          id="show-recurring-origin"
          checked={showRecurringOrigin}
          onChange={(e) => setShowRecurringOrigin(e.target.checked)}
        />
        <label htmlFor="show-recurring-origin" className="text-sm text-gray-700">
          Show expenses created from recurring schedules
        </label>
      </div>

      {/* Recent Expenses */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Recent Expenses</h2>
          <Link href="/expenses" className="text-xs text-indigo-500 font-medium flex items-center gap-1 hover:underline">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        {expensesLoading ? (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm divide-y divide-gray-50 px-4">
            {[...Array(4)].map((_, i) => <ExpenseItemSkeleton key={i} />)}
          </div>
        ) : recentExpenses.length === 0 ? (
          <div className="text-center py-10 bg-white border border-gray-100 rounded-2xl shadow-sm">
            <p className="text-gray-400 text-sm">No expenses yet</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm divide-y divide-gray-50">
            {recentExpenses.map((exp) => (
              <div key={exp.id} className="px-4">
                <ExpenseItem expense={exp} onToast={addToast} showDate />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modals */}
      <Modal open={noteModalOpen} onClose={() => setNoteModalOpen(false)} title={editingNote ? 'Edit Note' : 'New Note'}>
        <NoteEditor
          key={editingNote?.id ?? (noteModalOpen ? 'open' : 'closed')}
          note={editingNote}
          onClose={() => setNoteModalOpen(false)}
          onSuccess={(msg) => addToast(msg)}
          onError={(msg) => addToast(msg, 'error')}
        />
      </Modal>

      <Modal open={expenseModalOpen} onClose={() => setExpenseModalOpen(false)} title="Add Expense">
        <ExpenseForm
          onClose={() => setExpenseModalOpen(false)}
          onSuccess={(msg) => { addToast(msg); setExpenseModalOpen(false); refreshRecurring(); }}
          onError={(msg) => addToast(msg, 'error')}
        />
      </Modal>
    </div>
  );
}
