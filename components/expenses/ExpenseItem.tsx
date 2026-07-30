'use client';

import React, { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Expense } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { deleteExpense } from '@/lib/firestore/expenses';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal } from '@/components/ui/Modal';
import { ExpenseForm } from './ExpenseForm';

interface ExpenseItemProps {
  expense: Expense;
  onToast: (msg: string, type?: 'success' | 'error') => void;
  showDate?: boolean;
}

export function ExpenseItem({ expense, onToast, showDate = false }: ExpenseItemProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteExpense(expense.id);
      onToast('Expense deleted');
      setDeleteOpen(false);
    } catch {
      onToast('Something went wrong', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between py-3 group">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">
            {expense.note || 'No description'}
          </p>
          {showDate && expense.createdAt && (
            <p className="text-xs text-gray-400 mt-0.5">{formatDate(expense.createdAt)}</p>
          )}
        </div>

        <div className="flex items-center gap-3 ml-3 shrink-0">
          <span className="text-sm font-semibold text-gray-900">
            {formatCurrency(expense.amount)}
          </span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setEditOpen(true)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Edit expense"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={() => setDeleteOpen(true)}
              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
              aria-label="Delete expense"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Expense">
        <ExpenseForm
          expense={expense}
          onClose={() => setEditOpen(false)}
          onSuccess={(msg) => { onToast(msg); setEditOpen(false); }}
          onError={(msg) => onToast(msg, 'error')}
        />
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete expense?"
        message="This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
        loading={deleting}
      />
    </>
  );
}
