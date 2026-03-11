import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVariant } from '../contexts/VariantContext';

interface Command {
  id: string;
  label: string;
  hint: string;
  run: () => void;
}

export function CommandPalette() {
  const navigate = useNavigate();
  const { variants, setVariant } = useVariant();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const commands = useMemo<Command[]>(() => {
    const navCommands: Command[] = [
      { id: 'go-dashboard', label: 'Go to Dashboard', hint: 'Route', run: () => navigate('/') },
      { id: 'go-signals', label: 'Go to Signals', hint: 'Route', run: () => navigate('/signals') },
      { id: 'go-map', label: 'Go to World View', hint: 'Route', run: () => navigate('/map') },
      { id: 'go-scanner', label: 'Go to Scanner', hint: 'Route', run: () => navigate('/scanner') },
      { id: 'go-airspace', label: 'Go to Airspace', hint: 'Route', run: () => navigate('/airspace') },
      { id: 'go-maritime', label: 'Go to Maritime', hint: 'Route', run: () => navigate('/maritime') },
      { id: 'go-surveillance', label: 'Go to Surveillance', hint: 'Route', run: () => navigate('/surveillance') },
      { id: 'go-cases', label: 'Go to Cases', hint: 'Route', run: () => navigate('/cases') },
      { id: 'go-rules', label: 'Go to Rules', hint: 'Route', run: () => navigate('/rules') },
      { id: 'go-sources', label: 'Go to Sources', hint: 'Route', run: () => navigate('/sources') },
      { id: 'go-analytics', label: 'Go to Analytics', hint: 'Route', run: () => navigate('/analytics') },
      { id: 'go-settings', label: 'Go to Settings', hint: 'Route', run: () => navigate('/settings') },
    ];

    const variantCommands: Command[] = variants.map((v) => ({
      id: `switch-${v.id}`,
      label: `Switch Variant: ${v.name}`,
      hint: 'Variant',
      run: () => setVariant(v.id),
    }));

    return [...navCommands, ...variantCommands];
  }, [navigate, setVariant, variants]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((cmd) => cmd.label.toLowerCase().includes(q) || cmd.hint.toLowerCase().includes(q));
  }, [commands, query]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isOpenShortcut = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
      if (isOpenShortcut) {
        e.preventDefault();
        setOpen((prev) => !prev);
        return;
      }
      if (!open) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const command = filtered[activeIndex];
        if (!command) return;
        command.run();
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeIndex, filtered, open]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setActiveIndex(0);
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[3000] flex items-start justify-center bg-black/60 p-4 pt-16">
      <div className="w-full max-w-2xl border border-amber/30 bg-surface-card shadow-hud">
        <div className="border-b border-amber/20 px-3 py-2">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command..."
            className="w-full bg-transparent text-[12px] font-mono text-amber placeholder:text-amber/35 focus:outline-none"
          />
        </div>

        <div className="max-h-[50vh] overflow-y-auto">
          {filtered.map((cmd, i) => (
            <button
              key={cmd.id}
              onClick={() => {
                cmd.run();
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between px-3 py-2 text-left ${
                i === activeIndex ? 'bg-amber/10' : 'bg-transparent hover:bg-amber/5'
              }`}
            >
              <span className="text-[11px] font-mono text-gray-200">{cmd.label}</span>
              <span className="text-[9px] font-mono tracking-wider uppercase text-amber/45">{cmd.hint}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="px-3 py-4 text-[11px] font-mono text-gray-500">No matching commands</div>
          )}
        </div>
      </div>
    </div>
  );
}

