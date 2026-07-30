'use client';

import React, { useState, useMemo } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { useNotes } from '@/hooks/useNotes';
import { useAppContext } from '../layout';
import { NoteCard } from '@/components/notes/NoteCard';
import { NoteEditor } from '@/components/notes/NoteEditor';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { NoteCardSkeleton } from '@/components/ui/Skeleton';
import { Note } from '@/types';

export default function NotesPage() {
  const { notes, loading } = useNotes();
  const { addToast } = useAppContext();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [search, setSearch] = useState('');

  const filteredNotes = useMemo(() => {
    if (!search.trim()) return notes;
    const q = search.toLowerCase();
    return notes.filter(
      (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
    );
  }, [notes, search]);

  const openCreate = () => {
    setEditingNote(null);
    setEditorOpen(true);
  };

  const openEdit = (note: Note) => {
    setEditingNote(note);
    setEditorOpen(true);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Notes</h1>
        <Button variant="primary" size="sm" onClick={openCreate} id="create-note-btn">
          <Plus size={16} />
          New
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          id="notes-search"
          type="search"
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-9 pr-9 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => <NoteCardSkeleton key={i} />)}
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📝</div>
          <p className="text-gray-500 mb-1">
            {search ? 'No notes match your search' : 'No notes yet'}
          </p>
          {!search && (
            <p className="text-sm text-gray-400">Tap &quot;New&quot; to create your first note</p>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={openEdit}
              onToast={addToast}
            />
          ))}
        </div>
      )}

      {/* Editor Modal */}
      <Modal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editingNote ? 'Edit Note' : 'New Note'}
      >
        <NoteEditor
          key={editingNote?.id ?? 'new'}
          note={editingNote}
          onClose={() => setEditorOpen(false)}
          onSuccess={(msg) => addToast(msg)}
          onError={(msg) => addToast(msg, 'error')}
        />
      </Modal>
    </div>
  );
}
