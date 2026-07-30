import { collection, doc, runTransaction, serverTimestamp, Timestamp, writeBatch, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ExpenseFormData, RecurringPayment } from '@/types';
import { computeNextDueDate } from '@/lib/utils';

const RECURRING_COLLECTION = 'recurringPayments';

/**
 * Create a recurring payment schedule and the first expense occurrence.
 * Returns the IDs of the created expense and recurring schedule.
 */
export async function createRecurringPayment(
  userId: string,
  expenseData: ExpenseFormData,
  recurringData: {
    frequency: 'weekly' | 'monthly' | 'yearly';
    reminderDaysBefore: number[];
  }
): Promise<{ expenseId: string; recurringId: string }> {
  const batch = writeBatch(db);

  // First expense (current date selected by user)
  const expenseRef = doc(collection(db, 'expenses'));
  batch.set(expenseRef, {
    userId,
    amount: parseFloat(expenseData.amount),
    note: expenseData.note.trim(),
    expenseDate: Timestamp.fromDate(expenseData.expenseDate),
    // system timestamps
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    // link will be set after recurring doc is created
  });

  // Compute next due date preserving original day for month/yearly
  const originalDueDay = expenseData.expenseDate.getDate();
  const nextDue = computeNextDueDate(expenseData.expenseDate, recurringData.frequency, originalDueDay);

  const recurringRef = doc(collection(db, RECURRING_COLLECTION));
  batch.set(recurringRef, {
    userId,
    name: expenseData.note.trim(),
    amount: parseFloat(expenseData.amount),
    frequency: recurringData.frequency,
    originalDueDay,
    nextDueDate: Timestamp.fromDate(nextDue),
    reminderDaysBefore: recurringData.reminderDaysBefore,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Link the expense to the recurring schedule
  batch.update(expenseRef, { recurringPaymentId: recurringRef.id });

  await batch.commit();
  return { expenseId: expenseRef.id, recurringId: recurringRef.id };
}

/**
 * Mark a recurring payment as paid.
 * Creates an expense with the provided paymentDate (or defaults to now) and advances the nextDueDate.
 * Uses a transaction to guarantee idempotency.
 */
export async function markRecurringPaymentAsPaid(
  recurringId: string,
  paymentDate: Date = new Date()
): Promise<string> {
  const recurringRef = doc(db, RECURRING_COLLECTION, recurringId);

  const newExpenseId = await runTransaction(db, async (transaction) => {
    const recurringSnap = await transaction.get(recurringRef);
    if (!recurringSnap.exists()) throw new Error('Recurring payment not found');

    const recurring = recurringSnap.data() as RecurringPayment;
    if (!recurring.isActive) throw new Error('Recurring payment is paused');

    // Guard against duplicate payment: check if an expense with the same recurringPaymentId and expenseDate already exists
    const expenseQuery = query(
      collection(db, 'expenses'),
      where('userId', '==', recurring.userId),
      where('recurringPaymentId', '==', recurringId),
      where('expenseDate', '==', Timestamp.fromDate(paymentDate))
    );
    const existing = await getDocs(expenseQuery);
    if (!existing.empty) {
      // Return existing expense ID to keep idempotent behavior
      return existing.docs[0].id;
    }

    // Create new expense
    const expenseRef = doc(collection(db, 'expenses'));
    transaction.set(expenseRef, {
      userId: recurring.userId,
      amount: recurring.amount,
      note: recurring.name,
      expenseDate: Timestamp.fromDate(paymentDate),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      recurringPaymentId: recurringId,
    });

    // Compute next due date preserving original day
    const nextDue = computeNextDueDate(
      recurring.nextDueDate.toDate(),
      recurring.frequency,
      recurring.originalDueDay
    );
    transaction.update(recurringRef, {
      nextDueDate: Timestamp.fromDate(nextDue),
      updatedAt: serverTimestamp(),
    });

    return expenseRef.id;
  });

  return newExpenseId;
}

/** Skip the current occurrence without creating an expense and advance the schedule. */
export async function skipRecurringPayment(recurringId: string): Promise<void> {
  const recurringRef = doc(db, RECURRING_COLLECTION, recurringId);
  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(recurringRef);
    if (!snap.exists()) throw new Error('Recurring payment not found');
    const recurring = snap.data() as RecurringPayment;
    const nextDue = computeNextDueDate(
      recurring.nextDueDate.toDate(),
      recurring.frequency,
      recurring.originalDueDay
    );
    transaction.update(recurringRef, {
      nextDueDate: Timestamp.fromDate(nextDue),
      updatedAt: serverTimestamp(),
    });
  });
}

/** Pause a recurring schedule (does not delete historical expenses). */
export async function pauseRecurringPayment(recurringId: string): Promise<void> {
  const recurringRef = doc(db, RECURRING_COLLECTION, recurringId);
  await updateDoc(recurringRef, { isActive: false, updatedAt: serverTimestamp() });
}

/** Resume a paused recurring schedule and recalculate the next due date if it has passed. */
export async function resumeRecurringPayment(recurringId: string): Promise<void> {
  const recurringRef = doc(db, RECURRING_COLLECTION, recurringId);
  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(recurringRef);
    if (!snap.exists()) throw new Error('Recurring payment not found');
    const recurring = snap.data() as RecurringPayment;
    let nextDue = recurring.nextDueDate.toDate();
    const now = new Date();
    while (nextDue < now) {
      nextDue = computeNextDueDate(nextDue, recurring.frequency, recurring.originalDueDay);
    }
    transaction.update(recurringRef, {
      isActive: true,
      nextDueDate: Timestamp.fromDate(nextDue),
      updatedAt: serverTimestamp(),
    });
  });
}

/** Retrieve upcoming (including overdue) recurring payments for a user. */
export async function getUpcomingRecurringPayments(userId: string) {
  const q = query(
    collection(db, RECURRING_COLLECTION),
    where('userId', '==', userId),
    where('isActive', '==', true)
    // client‑side filtering for nextDueDate <= now will be done by the consumer
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as RecurringPayment));
}
