'use client';

import React, { useState } from 'react';
import { Pin, PinOff, Bell, BellOff, Pencil, Trash2, MoreVertical } from 'lucide-react';
import { Note } from '@/types';
import { formatDate, formatDateTime, getReminderStatus } from '@/lib/utils';
import { togglePin } from '@/lib/firestore/notes';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { deleteNote } from '@/lib/firestore/notes';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onToast: (msg: string, type?: 'success' | 'error') => void;
}

const reminderStatusStyles = {
  upcoming: 'bg-blue-50 text-blue-600',
  today: 'bg-green-50 text-green-600',
  overdue: 'bg-red-50 text-red-600',
};

const reminderStatusLabels = {
  upcoming: 'Upcoming',
  today: 'Today',
  overdue: 'Overdue',
};

export function NoteCard({ note, onEdit, onToast }: NoteCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const reminderStatus = getReminderStatus(note.reminderAt);

  const handleTogglePin = async () => {
    try {
      await togglePin(note.id, !note.isPinned);
      onToast(note.isPinned ? 'Note unpinned' : 'Note pinned');
    } catch {
      onToast('Something went wrong', 'error');
    }
    setMenuOpen(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteNote(note.id);
      onToast('Note deleted');
      setDeleteOpen(false);
    } catch {
      onToast('Something went wrong', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200 relative">
        {/* Pin badge */}
        {note.isPinned && (
          <div className="absolute top-3 right-3">
            <Pin size={13} className="text-indigo-400" />
          </div>
        )}

        {/* Title */}
        <h3
          className="font-medium text-gray-900 mb-1 pr-6 line-clamp-1 cursor-pointer"
          onClick={() => onEdit(note)}
        >
          {note.title || 'Untitled'}
        </h3>

        {/* Content preview */}
        {note.content && (
          <p
            className="text-sm text-gray-500 line-clamp-2 mb-3 cursor-pointer"
            onClick={() => onEdit(note)}
          >
            {note.content}
          </p>
        )}

        {/* Reminder badge */}
        {note.reminderAt && reminderStatus && (
          <div className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full mb-2 ${reminderStatusStyles[reminderStatus]}`}>
            <Bell size={10} />
            <span>{reminderStatusLabels[reminderStatus]} · {formatDateTime(note.reminderAt)}</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-400">
            {note.updatedAt ? formatDate(note.updatedAt) : ''}
          </span>

          {/* Actions menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Note actions"
            >
              <MoreVertical size={15} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 bottom-8 z-20 bg-white border border-gray-100 rounded-xl shadow-lg py-1 w-40 text-sm">
                  <button
                    onClick={() => { onEdit(note); setMenuOpen(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-50 text-gray-700"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    onClick={handleTogglePin}
                    className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-50 text-gray-700"
                  >
                    {note.isPinned ? <><PinOff size={14} /> Unpin</> : <><Pin size={14} /> Pin</>}
                  </button>
                  {note.reminderAt ? (
                    <button
                      onClick={async () => {
                        try {
                          await import('@/lib/firestore/notes').then(m => m.updateNote(note.id, { reminderAt: null }));
                          onToast('Reminder removed');
                        } catch { onToast('Something went wrong', 'error'); }
                        setMenuOpen(false);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-50 text-gray-700"
                    >
                      <BellOff size={14} /> Remove reminder
                    </button>
                  ) : null}
                  <hr className="my-1 border-gray-100" />
                  <button
                    onClick={() => { setDeleteOpen(true); setMenuOpen(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 hover:bg-red-50 text-red-500"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete note?"
        message="This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
        loading={deleting}
      />
    </>
  );
}
