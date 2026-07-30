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
import { NoteFormData } from '@/types';

const NOTES_COLLECTION = 'notes';

export async function createNote(userId: string, data: NoteFormData): Promise<string> {
  const docRef = await addDoc(collection(db, NOTES_COLLECTION), {
    userId,
    title: data.title,
    content: data.content,
    isPinned: data.isPinned,
    reminderAt: data.reminderAt ? Timestamp.fromDate(data.reminderAt) : null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateNote(noteId: string, data: Partial<NoteFormData>): Promise<void> {
  const docRef = doc(db, NOTES_COLLECTION, noteId);
  const updateData: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };
  if (data.title !== undefined) updateData.title = data.title;
  if (data.content !== undefined) updateData.content = data.content;
  if (data.isPinned !== undefined) updateData.isPinned = data.isPinned;
  if ('reminderAt' in data) {
    updateData.reminderAt = data.reminderAt ? Timestamp.fromDate(data.reminderAt) : null;
  }
  await updateDoc(docRef, updateData);
}

export async function deleteNote(noteId: string): Promise<void> {
  await deleteDoc(doc(db, NOTES_COLLECTION, noteId));
}

export async function togglePin(noteId: string, isPinned: boolean): Promise<void> {
  await updateDoc(doc(db, NOTES_COLLECTION, noteId), {
    isPinned,
    updatedAt: serverTimestamp(),
  });
}

export function getNotesQuery(userId: string) {
  return query(
    collection(db, NOTES_COLLECTION),
    where('userId', '==', userId)
  );
}
