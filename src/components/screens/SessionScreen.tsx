import { useMemo, useState } from 'react';
import type { Navigate } from '../../App';
import type { GameEvent } from '../../types';
import { useStore } from '../../store/store';
import { computeLeaderboard, computeSessionTotals } from '../../lib/scoring';
import { formatRelativeDay, formatSigned, scoreColorClass } from '../../lib/format';
import ScreenHeader from '../ui/ScreenHeader';
import Button from '../ui/Button';
import ConfirmDialog from '../ui/ConfirmDialog';
import EventCard from '../events/EventCard';
import EventModalHost from '../events/EventModalHost';
import type { EventModalRequest } from '../events/EventModalHost';

export default function SessionScreen({ navigate }: { navigate: Navigate }) {
  const { state, dispatch } = useStore();
  const session = state.activeSession;

  const [modal, setModal] = useState<EventModalRequest | null>(null);
  const [confirm, setConfirm] = useState<null | 'undo' | 'end'>(null);

  const totals = useMemo(
    () => (session ? computeSessionTotals(session) : {}),
    [session],
  );
  const lifetimeByKey = useMemo(() => {
    const map = new Map(computeLeaderboard(state).map((e) => [e.key, e.lifetimeScore]));
    return map;
  }, [state]);

  if (!session) {
    return (
      <div className="flex flex-1 flex-col">
        <ScreenHeader title="No Active Session" onBack={() => navigate('home')} />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <span className="text-4xl opacity-50">🃏</span>
          <p className="text-cream/60">There's no session in progress.</p>
          <Button variant="primary" onClick={() => navigate('new')}>
            Start a New Session
          </Button>
        </div>
      </div>
    );
  }

  const ranked = [...session.players].sort(
    (a, b) => (totals[b.key] ?? 0) - (totals[a.key] ?? 0),
  );
  const eventsNewestFirst = session.events
    .map((event, index) => ({ event, index }))
    .reverse();
  const lastEvent = session.events[session.events.length - 1];

  const onSaveEvent = (event: GameEvent) => {
    if (modal?.mode === 'edit') {
      dispatch({ type: 'EDIT_EVENT', sessionId: session.id, event });
    } else {
      dispatch({ type: 'ADD_EVENT', event });
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <ScreenHeader
        title="Table"
        subtitle={`${formatRelativeDay(session.date)} · ${session.players.length} players`}
        onBack={() => navigate('home')}
        action={
          <Button variant="ghost" onClick={() => setConfirm('end')} className="px-4">
            End
          </Button>
        }
      />

      <div className="flex-1 space-y-6 overflow-y-auto pb-4 pt-2">
        {/* Current session scores */}
        <section>
          <h2 className="mb-3 font-display text-lg font-bold text-cream/90">
            Session Scores
          </h2>
          <ul className="space-y-2">
            {ranked.map((p, i) => {
              const total = totals[p.key] ?? 0;
              return (
                <li
                  key={p.key}
                  className="panel flex items-center gap-3 px-4 py-3.5"
                >
                  <span className="tnum w-6 text-center text-sm font-bold text-cream/40">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-lg font-semibold text-cream">
                    {p.displayName}
                  </span>
                  <span className={`tnum text-3xl font-extrabold ${scoreColorClass(total)}`}>
                    {formatSigned(total)}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Add event */}
        <section>
          <h2 className="mb-3 font-display text-lg font-bold text-cream/90">Add Event</h2>
          <div className="space-y-2">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => setModal({ mode: 'add', kind: 'winner' })}
            >
              👑 Winner Settlement
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setModal({ mode: 'add', kind: 'opening' })}
              >
                Opening Cards
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setModal({ mode: 'add', kind: 'closing' })}
              >
                Closing Cards
              </Button>
            </div>
          </div>
        </section>

        {/* Lifetime scores (compact) */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-cream/90">Lifetime</h2>
            <button
              onClick={() => navigate('leaderboard')}
              className="text-sm font-semibold text-gold/80 hover:text-gold"
            >
              Leaderboard
            </button>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/20 p-3">
            <ul className="divide-y divide-white/5">
              {session.players.map((p) => {
                const lifetime = lifetimeByKey.get(p.key) ?? 0;
                return (
                  <li key={p.key} className="flex items-center justify-between px-1 py-2">
                    <span className="truncate text-sm text-cream/75">{p.displayName}</span>
                    <span
                      className={`tnum text-base font-bold ${scoreColorClass(lifetime)}`}
                    >
                      {formatSigned(lifetime)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* Event history */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-cream/90">
              History
              <span className="ml-2 text-sm font-normal text-cream/40">
                {session.events.length}
              </span>
            </h2>
            {session.events.length > 0 && (
              <button
                onClick={() => setConfirm('undo')}
                className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 text-sm font-semibold text-rose-200 transition-colors hover:bg-rose-500/20 touch-manipulation"
              >
                ↩ Undo Last
              </button>
            )}
          </div>

          {session.events.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/15 px-6 py-10 text-center text-sm text-cream/50">
              No events yet. Add the first hand above.
            </div>
          ) : (
            <div className="space-y-2">
              {eventsNewestFirst.map(({ event, index }) => (
                <EventCard
                  key={event.id}
                  event={event}
                  players={session.players}
                  index={index + 1}
                  onEdit={() => setModal({ mode: 'edit', event })}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {modal && (
        <EventModalHost
          request={modal}
          players={session.players}
          onClose={() => setModal(null)}
          onSave={onSaveEvent}
        />
      )}

      {confirm === 'undo' && lastEvent && (
        <ConfirmDialog
          title="Undo Last Event?"
          message="This removes the most recent event and reverses its score changes for both the session and lifetime totals. This cannot be redone."
          confirmLabel="Undo Event"
          danger
          onConfirm={() => {
            dispatch({ type: 'UNDO_LAST' });
            setConfirm(null);
          }}
          onCancel={() => setConfirm(null)}
        />
      )}

      {confirm === 'end' && (
        <ConfirmDialog
          title="End Session?"
          message="The session will be saved to history. Lifetime scores stay updated. You can review or edit it any time from History."
          confirmLabel="End Session"
          onConfirm={() => {
            dispatch({ type: 'END_SESSION' });
            navigate('home');
          }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
