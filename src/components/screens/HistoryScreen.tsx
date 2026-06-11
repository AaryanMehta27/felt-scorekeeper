import { useMemo, useState } from 'react';
import type { Navigate } from '../../App';
import type { GameEvent, Session } from '../../types';
import { useStore } from '../../store/store';
import { computeSessionTotals } from '../../lib/scoring';
import { formatDateTime, formatSigned, scoreColorClass } from '../../lib/format';
import ScreenHeader from '../ui/ScreenHeader';
import EventCard from '../events/EventCard';
import EventModalHost from '../events/EventModalHost';

interface EditRequest {
  session: Session;
  event: GameEvent;
}

export default function HistoryScreen({ navigate }: { navigate: Navigate }) {
  const { state, dispatch } = useStore();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<EditRequest | null>(null);

  // Most recent sessions first; include the active one (flagged) if present.
  const sessions = useMemo(() => {
    const past = [...state.history].sort((a, b) => b.date.localeCompare(a.date));
    return state.activeSession ? [state.activeSession, ...past] : past;
  }, [state]);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <div className="flex flex-1 flex-col">
      <ScreenHeader title="History" subtitle="Every session" onBack={() => navigate('home')} />

      <div className="flex-1 space-y-3 overflow-y-auto pb-4 pt-2">
        {sessions.length === 0 ? (
          <div className="panel mt-6 flex flex-col items-center gap-2 px-6 py-12 text-center">
            <span className="text-4xl opacity-60">📜</span>
            <p className="text-cream/60">No sessions recorded yet.</p>
          </div>
        ) : (
          sessions.map((session) => {
            const totals = computeSessionTotals(session);
            const ranked = [...session.players].sort(
              (a, b) => (totals[b.key] ?? 0) - (totals[a.key] ?? 0),
            );
            const isActive = state.activeSession?.id === session.id;
            const isOpen = expanded.has(session.id);

            return (
              <div key={session.id} className="panel overflow-hidden">
                <button
                  onClick={() => toggle(session.id)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left touch-manipulation"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-cream">
                        {formatDateTime(session.date)}
                      </span>
                      {isActive && (
                        <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-300">
                          Live
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 truncate text-xs text-cream/50">
                      {session.players.map((p) => p.displayName).join(' · ')}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 text-cream/40 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  >
                    ▾
                  </span>
                </button>

                {/* Final standings */}
                <div className="px-4 pb-3">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {ranked.map((p) => {
                      const total = totals[p.key] ?? 0;
                      return (
                        <div
                          key={p.key}
                          className="flex items-baseline justify-between gap-2"
                        >
                          <span className="truncate text-sm text-cream/75">
                            {p.displayName}
                          </span>
                          <span
                            className={`tnum text-sm font-bold ${scoreColorClass(total)}`}
                          >
                            {formatSigned(total)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Expandable event log */}
                {isOpen && (
                  <div className="border-t border-white/10 bg-black/20 px-4 py-3">
                    {session.events.length === 0 ? (
                      <p className="py-2 text-center text-sm text-cream/40">
                        No events recorded in this session.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {session.events.map((event, i) => (
                          <EventCard
                            key={event.id}
                            event={event}
                            players={session.players}
                            index={i + 1}
                            onEdit={() => setEditing({ session, event })}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {editing && (
        <EventModalHost
          request={{ mode: 'edit', event: editing.event }}
          players={editing.session.players}
          onClose={() => setEditing(null)}
          onSave={(event) =>
            dispatch({ type: 'EDIT_EVENT', sessionId: editing.session.id, event })
          }
        />
      )}
    </div>
  );
}
