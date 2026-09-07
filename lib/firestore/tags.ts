import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const TAGS_COLLECTION = 'tags';

export async function createTag(userId: string, name: string): Promise<string> {
  const docRef = await addDoc(collection(db, TAGS_COLLECTION), {
    userId,
    name: name.trim(),
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function deleteTag(tagId: string): Promise<void> {
  await deleteDoc(doc(db, TAGS_COLLECTION, tagId));
}

export function getTagsQuery(userId: string) {
  return query(
    collection(db, TAGS_COLLECTION),
    where('userId', '==', userId)
  );
}
