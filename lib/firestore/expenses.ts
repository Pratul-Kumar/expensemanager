import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ExpenseFormData } from '@/types';

const EXPENSES_COLLECTION = 'expenses';

export async function createExpense(userId: string, data: ExpenseFormData): Promise<string> {
  const docRef = await addDoc(collection(db, EXPENSES_COLLECTION), {
    userId,
    amount: parseFloat(data.amount),
    note: data.note.trim(),
    tag: data.tag?.trim() || '',
    expenseDate: Timestamp.fromDate(data.expenseDate), // user selected date
    // system timestamps
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateExpense(expenseId: string, data: ExpenseFormData): Promise<void> {
  await updateDoc(doc(db, EXPENSES_COLLECTION, expenseId), {
    amount: parseFloat(data.amount),
    note: data.note.trim(),
    tag: data.tag?.trim() || '',
    expenseDate: Timestamp.fromDate(data.expenseDate),
    updatedAt: serverTimestamp(),
    // do not modify recurringPaymentId on update
  });
}

export async function deleteExpense(expenseId: string): Promise<void> {
  await deleteDoc(doc(db, EXPENSES_COLLECTION, expenseId));
}

export function getExpensesQuery(userId: string) {
  return query(
    collection(db, EXPENSES_COLLECTION),
    where('userId', '==', userId)
  );
}
