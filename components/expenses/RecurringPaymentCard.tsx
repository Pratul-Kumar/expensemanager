import React from 'react';
import { formatCurrency, formatDate, daysUntil } from '@/lib/utils';
import { RecurringPayment } from '@/types';
import { Button } from '@/components/ui/Button';
import { markRecurringPaymentAsPaid, skipRecurringPayment, pauseRecurringPayment, resumeRecurringPayment } from '@/lib/firestore/recurring';
import { useAuth } from '@/hooks/useAuth';

interface RecurringPaymentCardProps {
  payment: RecurringPayment;
  onAction: () => void; // callback to refresh list after any action
}

export function RecurringPaymentCard({ payment, onAction }: RecurringPaymentCardProps) {
  const { user } = useAuth();

  const status = (() => {
    const now = new Date();
    const diff = daysUntil(payment.nextDueDate.toDate());
    if (diff > 0) return `Due in ${diff} day${diff > 1 ? 's' : ''}`;
    if (diff === 0) return 'Due today';
    return `Overdue by ${-diff} day${-diff > 1 ? 's' : ''}`;
  })();

  const handleMarkPaid = async () => {
    if (!user) return;
    await markRecurringPaymentAsPaid(payment.id, new Date());
    onAction();
  };

  const handleSkip = async () => {
    if (!user) return;
    await skipRecurringPayment(payment.id);
    onAction();
  };

  const handlePauseResume = async () => {
    if (!user) return;
    if (payment.isActive) {
      await pauseRecurringPayment(payment.id);
    } else {
      await resumeRecurringPayment(payment.id);
    }
    onAction();
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-medium text-gray-900">{payment.name}</p>
          <p className="text-sm text-gray-500">{formatCurrency(payment.amount)}</p>
        </div>
        <span className="text-xs font-medium text-gray-600">{status}</span>
      </div>
      <div className="flex gap-2">
        <Button variant="primary" size="sm" onClick={handleMarkPaid}>
          Mark as Paid
        </Button>
        <Button variant="secondary" size="sm" onClick={handleSkip}>
          Skip
        </Button>
        <Button variant="ghost" size="sm" onClick={handlePauseResume}>
          {payment.isActive ? 'Pause' : 'Resume'}
        </Button>
      </div>
    </div>
  );
}
