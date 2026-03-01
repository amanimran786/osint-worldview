import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { TopBar } from '../components/TopBar';
import { StatusBadge } from '../components/StatusBadge';
import * as api from '../api';
import type { Note } from '../types';

export function CasesPage() {
  const cases = useStore((s) => s.cases);
  const loadCases = useStore((s) => s.loadCases);
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    loadCases();
  }, []);

  useEffect(() => {
    if (selectedCaseId) {
      api.fetchNotes(selectedCaseId).then(setNotes);
    }
  }, [selectedCaseId]);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    await api.createCase(newTitle.trim());
    setNewTitle('');
    loadCases();
  };

  const handleAddNote = async () => {
    if (!noteText.trim() || !selectedCaseId) return;
    await api.addNote(selectedCaseId, noteText.trim());
    setNoteText('');
    api.fetchNotes(selectedCaseId).then(setNotes);
  };

  const selectedCase = cases.find((c) => c.id === selectedCaseId);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Cases" />
      <div className="flex flex-1 overflow-hidden">
        {/* List */}
        <div className="w-80 border-r border-gray-700/50 overflow-y-auto p-4 space-y-3">
          {/* Create form */}
          <div className="flex gap-2">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="New case title…"
              className="flex-1 rounded-lg border border-gray-600 bg-surface px-3 py-1.5 text-sm text-gray-200 placeholder-gray-500 focus:border-brand-500 focus:outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <button
              onClick={handleCreate}
              className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700"
            >
              Add
            </button>
          </div>

          {cases.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedCaseId(c.id)}
              className={`cursor-pointer rounded-lg border border-gray-700/50 px-4 py-3 ${
                selectedCaseId === c.id ? 'bg-brand-600/10 border-brand-500/30' : 'bg-surface-card hover:bg-surface-hover'
              }`}
            >
              <div className="text-sm font-medium text-gray-200">{c.title}</div>
              <div className="mt-1 flex items-center gap-2">
                <StatusBadge status={c.status} />
                <span className="text-xs text-gray-500">
                  {new Date(c.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
          {cases.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-8">No cases yet.</p>
          )}
        </div>

        {/* Detail */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedCase ? (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">{selectedCase.title}</h2>
              <StatusBadge status={selectedCase.status} />

              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Notes</h3>
                <div className="space-y-2">
                  {notes.map((n) => (
                    <div key={n.id} className="rounded-lg border border-gray-700/50 bg-surface-card p-3">
                      <p className="text-sm text-gray-300">{n.content}</p>
                      <span className="text-xs text-gray-500">
                        {new Date(n.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <input
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Add a note…"
                    className="flex-1 rounded-lg border border-gray-600 bg-surface px-3 py-1.5 text-sm text-gray-200 placeholder-gray-500 focus:border-brand-500 focus:outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                  />
                  <button
                    onClick={handleAddNote}
                    className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-500">
              Select a case to view details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
