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
      <TopBar title="CASES" />
      <div className="flex flex-1 overflow-hidden">
        {/* List */}
        <div className="w-80 border-r border-amber/10 overflow-y-auto p-3 space-y-2">
          {/* Create form */}
          <div className="flex gap-2">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="New case title…"
              className="flex-1 border border-amber/15 bg-surface px-3 py-1.5 text-[11px] font-mono text-amber/80 placeholder-gray-600 focus:border-amber/40 focus:outline-none tracking-wider"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <button
              onClick={handleCreate}
              className="border border-amber/25 bg-amber/10 px-3 py-1.5 text-[10px] font-mono text-amber hover:bg-amber/20 uppercase tracking-wider"
            >
              Add
            </button>
          </div>

          {cases.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedCaseId(c.id)}
              className={`cursor-pointer border px-3 py-2.5 transition-all ${
                selectedCaseId === c.id ? 'bg-amber/10 border-amber/30' : 'border-gray-900 bg-surface-card hover:border-amber/15 hover:bg-amber/5'
              }`}
            >
              <div className="text-[11px] font-mono text-gray-300">{c.title}</div>
              <div className="mt-1 flex items-center gap-2">
                <StatusBadge status={c.status} />
                <span className="text-[9px] font-mono text-gray-600">
                  {new Date(c.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
          {cases.length === 0 && (
            <p className="text-[11px] font-mono text-gray-600 text-center py-8 tracking-wider">NO CASES YET</p>
          )}
        </div>

        {/* Detail */}
        <div className="flex-1 overflow-y-auto p-4">
          {selectedCase ? (
            <div className="space-y-4">
              <h2 className="text-[12px] font-display tracking-[0.1em] text-amber uppercase">{selectedCase.title}</h2>
              <StatusBadge status={selectedCase.status} />

              <div className="mt-4">
                <h3 className="text-[9px] font-mono text-gray-600 mb-3 uppercase tracking-[0.15em]">Notes</h3>
                <div className="space-y-2">
                  {notes.map((n) => (
                    <div key={n.id} className="hud-border bg-surface-card p-3">
                      <p className="text-[11px] font-mono text-gray-300">{n.content}</p>
                      <span className="text-[9px] font-mono text-gray-600">
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
                    className="flex-1 border border-amber/15 bg-surface px-3 py-1.5 text-[11px] font-mono text-amber/80 placeholder-gray-600 focus:border-amber/40 focus:outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                  />
                  <button
                    onClick={handleAddNote}
                    className="border border-amber/25 bg-amber/10 px-3 py-1.5 text-[10px] font-mono text-amber hover:bg-amber/20 uppercase tracking-wider"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-[11px] font-mono text-gray-600 tracking-wider">
              SELECT A CASE TO VIEW DETAILS
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
