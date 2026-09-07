'use client';

import React, { useState } from 'react';
import { LogOut, Info, ChevronRight, Bell, Tag, Trash2, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAppContext } from '../layout';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useTags } from '@/hooks/useTags';
import { createTag, deleteTag } from '@/lib/firestore/tags';
import { Button } from '@/components/ui/Button';

const APP_VERSION = '1.0.0';

export default function SettingsPage() {
  const { user, userProfile, logout } = useAuth();
  const { addToast } = useAppContext();
  const router = useRouter();
  const { settings, loading: settingsLoading, saveReminder } = useUserSettings();
  const { tags } = useTags();

  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Reminder state
  const [reminderEnabled, setReminderEnabled] = useState<boolean | null>(null);
  const [reminderTime, setReminderTime] = useState<string | null>(null);
  const [savingReminder, setSavingReminder] = useState(false);

  // Tag state
  const [newTagName, setNewTagName] = useState('');
  const [creatingTag, setCreatingTag] = useState(false);
  const [deleteTagId, setDeleteTagId] = useState<string | null>(null);
  const [deletingTag, setDeletingTag] = useState(false);

  // Derive current values (local overrides or from settings)
  const currentEnabled = reminderEnabled ?? settings?.dailyReminder?.enabled ?? false;
  const currentHour = settings?.dailyReminder?.hour ?? 20;
  const currentMinute = settings?.dailyReminder?.minute ?? 30;
  const currentTime = reminderTime ??
    `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

  const handleSaveReminder = async () => {
    setSavingReminder(true);
    try {
      const [h, m] = currentTime.split(':').map(Number);
      await saveReminder({ enabled: currentEnabled, hour: h, minute: m });
      addToast('Reminder settings saved');
      // Reset local overrides
      setReminderEnabled(null);
      setReminderTime(null);
    } catch {
      addToast('Failed to save settings', 'error');
    } finally {
      setSavingReminder(false);
    }
  };

  const handleCreateTag = async () => {
    if (!user || !newTagName.trim()) return;
    setCreatingTag(true);
    try {
      await createTag(user.uid, newTagName.trim());
      setNewTagName('');
      addToast('Tag created');
    } catch {
      addToast('Failed to create tag', 'error');
    } finally {
      setCreatingTag(false);
    }
  };

  const handleDeleteTag = async () => {
    if (!deleteTagId) return;
    setDeletingTag(true);
    try {
      await deleteTag(deleteTagId);
      addToast('Tag deleted');
      setDeleteTagId(null);
    } catch {
      addToast('Failed to delete tag', 'error');
    } finally {
      setDeletingTag(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      router.replace('/login');
    } catch {
      addToast('Something went wrong', 'error');
      setLoggingOut(false);
    }
  };

  const initials = userProfile?.displayName
    ? userProfile.displayName.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : userProfile?.email?.[0].toUpperCase() ?? '?';

  const hasReminderChanges =
    reminderEnabled !== null || reminderTime !== null;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Settings</h1>

      {/* Profile section */}
      <section>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Profile</h2>
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 flex items-center gap-4">
          {userProfile?.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={userProfile.photoURL}
              alt="Avatar"
              className="w-12 h-12 rounded-full object-cover border border-gray-100"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-indigo-700 font-semibold text-base">{initials}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">
              {userProfile?.displayName ?? 'User'}
            </p>
            <p className="text-sm text-gray-500 truncate">{userProfile?.email ?? ''}</p>
          </div>
        </div>
      </section>

      {/* Daily Reminder section */}
      <section>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Daily Reminder</h2>
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 space-y-4">
          {settingsLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-5 bg-gray-200 rounded w-1/3"></div>
              <div className="h-11 bg-gray-200 rounded w-full"></div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell size={18} className="text-indigo-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Expense Reminder</p>
                    <p className="text-xs text-gray-400">Get reminded to add daily expenses</p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={currentEnabled}
                  onClick={() => setReminderEnabled(!currentEnabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    currentEnabled ? 'bg-indigo-500' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      currentEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {currentEnabled && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Reminder Time</label>
                  <input
                    type="time"
                    value={currentTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              )}

              {hasReminderChanges && (
                <Button
                  onClick={handleSaveReminder}
                  loading={savingReminder}
                  size="sm"
                  className="w-full"
                >
                  Save Reminder Settings
                </Button>
              )}
            </>
          )}
        </div>
      </section>

      {/* Manage Tags section */}
      <section>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Expense Tags</h2>
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 space-y-4">
          {/* Create new tag */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="New tag (e.g. Rahul, Goa Trip)"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateTag();
                }}
                className="w-full h-11 pl-9 pr-4 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            <Button
              onClick={handleCreateTag}
              loading={creatingTag}
              disabled={!newTagName.trim()}
              size="sm"
            >
              <Plus size={14} />
              Add
            </Button>
          </div>

          {/* Tag list */}
          {tags.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              No tags yet. Create one above to label your expenses.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <span
                  key={t.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium"
                >
                  {t.name}
                  <button
                    onClick={() => setDeleteTagId(t.id)}
                    className="hover:text-red-500 transition-colors"
                    aria-label={`Delete tag ${t.name}`}
                  >
                    <Trash2 size={11} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Account section */}
      <section>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Account</h2>
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <button
            onClick={() => setLogoutOpen(true)}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-red-50 transition-colors group"
            id="logout-btn"
          >
            <div className="flex items-center gap-3">
              <LogOut size={18} className="text-red-500" />
              <span className="text-sm font-medium text-red-600">Sign Out</span>
            </div>
            <ChevronRight size={16} className="text-gray-300 group-hover:text-red-300" />
          </button>
        </div>
      </section>

      {/* About section */}
      <section>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">About</h2>
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <Info size={18} className="text-gray-400" />
              <span className="text-sm text-gray-700">App Version</span>
            </div>
            <span className="text-sm text-gray-400">{APP_VERSION}</span>
          </div>
        </div>
      </section>

      <ConfirmDialog
        open={logoutOpen}
        title="Sign out?"
        message="You will be returned to the login screen."
        confirmLabel="Sign Out"
        onConfirm={handleLogout}
        onCancel={() => setLogoutOpen(false)}
        loading={loggingOut}
      />

      <ConfirmDialog
        open={!!deleteTagId}
        title="Delete tag?"
        message="This will remove the tag. Existing expenses with this tag will keep the label."
        onConfirm={handleDeleteTag}
        onCancel={() => setDeleteTagId(null)}
        loading={deletingTag}
      />
    </div>
  );
}
