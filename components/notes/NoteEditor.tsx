'use client';

import React, { useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Note, NoteFormData } from '@/types';
import { createNote, updateNote } from '@/lib/firestore/notes';
import { toDateInputValue, toTimeInputValue, combineDateAndTime } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface NoteEditorProps {
  note?: Note | null;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

function getInitialReminderDate(note?: Note | null): string {
  if (!note?.reminderAt) return '';
  return toDateInputValue(note.reminderAt.toDate());
}

function getInitialReminderTime(note?: Note | null): string {
  if (!note?.reminderAt) return '';
  return toTimeInputValue(note.reminderAt.toDate());
}

export function NoteEditor({ note, onClose, onSuccess, onError }: NoteEditorProps) {
  const { user } = useAuth();
  // Initialize state directly from props — no useEffect needed
  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [isPinned, setIsPinned] = useState(note?.isPinned ?? false);
  const [reminderDate, setReminderDate] = useState(getInitialReminderDate(note));
  const [reminderTime, setReminderTime] = useState(getInitialReminderTime(note));
  const [showReminder, setShowReminder] = useState(!!note?.reminderAt);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ title?: string }>({});

  const validate = () => {
    const e: { title?: string } = {};
    if (!title.trim()) e.title = 'Title is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !user) return;
    setSaving(true);
    try {
      const reminderAt = showReminder && reminderDate
        ? combineDateAndTime(reminderDate, reminderTime)
        : null;

      const data: NoteFormData = {
        title: title.trim(),
        content: content.trim(),
        isPinned,
        reminderAt,
      };

      if (note) {
        await updateNote(note.id, data);
        onSuccess('Note saved');
      } else {
        await createNote(user.uid, data);
        onSuccess('Note created');
      }
      onClose();
    } catch (err) {
      console.error(err);
      onError('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Input
        id="note-title"
        label="Title"
        placeholder="Note title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
        autoFocus
      />

      <Textarea
        id="note-content"
        label="Note"
        placeholder="Write something..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={6}
      />

      {/* Pin toggle */}
      <label className="flex items-center gap-2 cursor-pointer select-none w-fit">
        <div
          className={`w-8 h-4 rounded-full transition-colors duration-200 ${isPinned ? 'bg-indigo-500' : 'bg-gray-200'}`}
          onClick={() => setIsPinned((v) => !v)}
        >
          <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${isPinned ? 'translate-x-4' : 'translate-x-0'}`} />
        </div>
        <span className="text-sm text-gray-600">Pin note</span>
      </label>

      {/* Reminder section */}
      <div>
        <button
          type="button"
          onClick={() => setShowReminder((v) => !v)}
          className="flex items-center gap-2 text-sm text-indigo-500 hover:text-indigo-700 font-medium transition-colors"
        >
          {showReminder ? <BellOff size={15} /> : <Bell size={15} />}
          {showReminder ? 'Remove reminder' : 'Add reminder'}
        </button>

        {showReminder && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Input
              id="reminder-date"
              label="Date"
              type="date"
              value={reminderDate}
              onChange={(e) => setReminderDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
            <Input
              id="reminder-time"
              label="Time (optional)"
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2 border-t border-gray-100">
        <Button variant="secondary" className="flex-1" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="primary" className="flex-1" onClick={handleSave} loading={saving}>
          {note ? 'Save' : 'Create'}
        </Button>
      </div>
    </div>
  );
}
