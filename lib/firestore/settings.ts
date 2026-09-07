import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ReminderSettings, UserSettings } from '@/types';

const COLLECTION = 'userSettings';

export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  const snap = await getDoc(doc(db, COLLECTION, userId));
  if (!snap.exists()) return null;
  return snap.data() as UserSettings;
}

export async function saveReminderSettings(
  userId: string,
  reminder: ReminderSettings
): Promise<void> {
  await setDoc(
    doc(db, COLLECTION, userId),
    {
      userId,
      dailyReminder: reminder,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function saveEmailPreferences(
  userId: string,
  prefs: { welcomeEmail: boolean; importantNotifications: boolean }
): Promise<void> {
  await setDoc(
    doc(db, COLLECTION, userId),
    {
      userId,
      emailPreferences: prefs,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function markWelcomeEmailSent(userId: string): Promise<void> {
  await setDoc(
    doc(db, COLLECTION, userId),
    {
      userId,
      welcomeEmailSent: true,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
