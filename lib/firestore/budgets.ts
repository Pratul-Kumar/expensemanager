import { doc, getDoc, setDoc, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Budget } from '@/types';

const BUDGETS_COLLECTION = 'budgets';

function getBudgetDocId(userId: string, year: number, month: number): string {
  return `${userId}_${year}_${month}`;
}

export async function getBudget(userId: string, year: number, month: number): Promise<Budget | null> {
  // Direct doc read using deterministic ID
  const docRef = doc(db, BUDGETS_COLLECTION, getBudgetDocId(userId, year, month));
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Budget;
}

export async function setBudget(userId: string, year: number, month: number, amount: number): Promise<void> {
  const docId = getBudgetDocId(userId, year, month);
  await setDoc(doc(db, BUDGETS_COLLECTION, docId), {
    userId,
    year,
    month,
    amount,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteBudget(userId: string, year: number, month: number): Promise<void> {
  await deleteDoc(doc(db, BUDGETS_COLLECTION, getBudgetDocId(userId, year, month)));
}
