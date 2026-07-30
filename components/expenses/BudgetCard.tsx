'use client';

import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Budget } from '@/types';
import { calculateBudget, formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface BudgetCardProps {
  budget: Budget | null;
  spent: number;
  recurringCommitted: number;
  loading: boolean;
  monthLabel: string;
  onSetBudget: () => void;
  onEditBudget: () => void;
  onDeleteBudget: () => void;
}

export function BudgetCard({
  budget,
  spent,
  recurringCommitted,
  loading,
  monthLabel,
  onSetBudget,
  onEditBudget,
  onDeleteBudget,
}: BudgetCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center justify-center text-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{monthLabel} Budget</h3>
          <p className="text-gray-500 text-sm mt-1">No budget set for this month.</p>
        </div>
        <Button onClick={onSetBudget}>Set Budget</Button>
      </div>
    );
  }

  const calc = calculateBudget(budget.amount, spent, recurringCommitted);
  
  const spentPct = Math.min((calc.spent / budget.amount) * 100, 100);
  const recurringPct = Math.min((calc.recurringCommitted / budget.amount) * 100, 100 - spentPct);

  let statusIcon = '✅';
  let statusText = 'On track';
  if (calc.status === 'approaching') {
    statusIcon = '⚠️';
    statusText = 'Approaching budget';
  } else if (calc.status === 'exceeded') {
    statusIcon = '🚫';
    statusText = 'Budget exceeded';
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
            {monthLabel} Budget
          </p>
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {formatCurrency(budget.amount)}
          </h3>
        </div>
        <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
          <span className="text-sm">{statusIcon}</span>
          <span className="text-xs font-medium text-gray-700">{statusText}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-6">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">Spent</span>
          <span className="font-medium text-gray-900">{formatCurrency(calc.spent)}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">Recurring (Committed)</span>
          <span className="font-medium text-amber-600">{formatCurrency(calc.recurringCommitted)}</span>
        </div>
        <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-100">
          <span className="text-gray-700 font-medium">Left Budget</span>
          <span
            className={`font-bold ${
              calc.leftBudget < 0 ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {calc.leftBudget < 0
              ? `Over by ${formatCurrency(Math.abs(calc.leftBudget))}`
              : formatCurrency(calc.leftBudget)}
          </span>
        </div>
      </div>

      <div className="mb-2">
        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-green-500 transition-all duration-500"
            style={{ width: `${spentPct}%` }}
          />
          <div
            className="h-full bg-amber-400 transition-all duration-500"
            style={{ width: `${recurringPct}%` }}
          />
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <span className="text-xs font-medium text-gray-500">
          {calc.percentageAllocated.toFixed(1)}% allocated
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onEditBudget}
          className="flex-1 h-9 inline-flex items-center justify-center gap-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
        >
          <Pencil size={14} />
          Edit
        </button>
        <button
          onClick={onDeleteBudget}
          className="flex-1 h-9 inline-flex items-center justify-center gap-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors border border-red-100"
        >
          <Trash2 size={14} />
          Remove
        </button>
      </div>
    </div>
  );
}
