import { useMemo, useState } from 'react';
import type { Navigate } from '../../App';
import type { GameEvent, PlayerStatus, SessionPlayer } from '../../types';
import { useStore } from '../../store/store';
import { computeLeaderboard, computeSessionTotals, sessionGrandTotal } from '../../lib/scoring';
import { getActivePlayers, getEventParticipants, isActivePlayer, statusLabel } from '../../lib/players';
import { getRoundState, PHASE_LABEL, PHASE_ORDER } from '../../lib/rounds';
import { formatRelativeDay, formatSigned, scoreColorClass } from '../../lib/format';
import ScreenHeader from '../ui/ScreenHeader';
import Button from '../ui/Button';
import ConfirmDialog from '../ui/ConfirmDialog';
import EventCard from '../events/EventCard';
import EventModalHost from '../events/EventModalHost';
import type { EventModalRequest } from '../events/EventModalHost';
import ManagePlayersModal from '../events/ManagePlayersModal';

export default function SessionScreen({ navigate }: { navigate: Navigate }) {
  const { state, dispatch } = useStore();
  const session = state.activeSession;

  const [modal, setModal] = useState<EventModalRequest | null>(null);
  const [managing, setManaging] = useState(false);
  const [confirm, setConfirm] = useState<null | 'undo' | 'end'>(null);

  const totals = useMemo(
    () => (session ? computeSessionTotals(session) : {}),
    [session],
  );
  const lifetimeByKey = useMemo(
    () => new Map(computeLeaderboard(state).map((e) => [e.key, e.lifetimeScore])),
    [state],
  );

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

  const activePlayers = getActivePlayers(session);
  const inactivePlayers = session.players.filter((p) => !isActivePlayer(p));
  const rankedActive = [...activePlayers].sort(
    (a, b) => (totals[b.key] ?? 0) - (totals[a.key] ?? 0),
  );

  const round = getRoundState(session);
  const nextIdx = PHASE_ORDER.indexOf(round.nextPhase);
  const taliaName = round.taliaKey
    ? session.players.find((p) => p.key === round.taliaKey)?.displayName ?? null
    : null;

  const grandTotal = sessionGrandTotal(session);
  const tallies = grandTotal === 0;

  const canAddEvent = activePlayers.length >= 2;

  const ctaLabel =
    round.nextPhase === 'opening'
      ? `Open Round ${round.roundNumber}`
      : round.nextPhase === 'winner'
        ? 'Winner Settlement'
        : `Close Round ${round.roundNumber}`;
  const ctaIcon = round.nextPhase === 'winner' ? '👑 ' : '';

  const eventsNewestFirst = session.events
    .map((event, index) => ({ event, index }))
    .reverse();
  const lastEvent = session.events[session.events.length - 1];

  // New events score the currently active players; edits recalculate against
  // the participants the event originally had.
  const modalPlayers: SessionPlayer[] = !modal
    ? []
    : modal.mode === 'edit'
      ? getEventParticipants(modal.event, session)
      : activePlayers;

  const onSaveEvent = (event: GameEvent) => {
    if (modal?.mode === 'edit') {
      dispatch({ type: 'EDIT_EVENT', sessionId: session.id, event });
    } else {
      dispatch({ type: 'ADD_EVENT', event });
    }
  };

  const playingLabel =
    inactivePlayers.length > 0
      ? `${activePlayers.length} of ${session.players.length} playing`
      : `${session.players.length} players`;

  return (
    <div className="flex flex-1 flex-col">
      <ScreenHeader
        title="Table"
        subtitle={`${formatRelativeDay(session.date)} · ${playingLabel}`}
        onBack={() => navigate('home')}
        action={
          <Button variant="ghost" onClick={() => setConfirm('end')} className="px-4">
            End
          </Button>
        }
      />

      <div className="flex-1 space-y-6 overflow-y-auto pb-4 pt-2">
        {/* Round flow */}
        <section className="panel p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-cream">
              Round {round.roundNumber}
            </h2>
            {taliaName ? (
              <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-bold text-gold-light">
                🃏 Talia · {taliaName}
              </span>
            ) : (
              <span className="text-xs text-cream/40">Tag the talia at opening</span>
            )}
          </div>

          {/* Phase progress */}
          <div className="mb-4 flex items-center gap-1.5">
            {PHASE_ORDER.map((phase, i) => {
              const done = i < nextIdx;
              const current = i === nextIdx;
              return (
                <div key={phase} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className={`h-1.5 w-full rounded-full ${
                      done
                        ? 'bg-emerald-400/70'
                        : current
                          ? 'bg-gold'
                          : 'bg-white/10'
                    }`}
                  />
                  <span
                    className={`text-[11px] font-semibold ${
                      current
                        ? 'text-gold-light'
                        : done
                          ? 'text-emerald-300/80'
                          : 'text-cream/35'
                    }`}
                  >
                    {done && '✓ '}
                    {PHASE_LABEL[phase]}
                  </span>
                </div>
              );
            })}
          </div>

          {!canAddEvent ? (
            <p className="rounded-2xl border border-amber-300/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
              Add at least 2 active players to continue. Tap{' '}
              <span className="font-semibold">Players</span> below.
            </p>
          ) : (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => setModal({ mode: 'add', kind: round.nextPhase })}
            >
              {ctaIcon}
              {ctaLabel}
            </Button>
          )}
        </section>

        {/* Current session scores */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-cream/90">Session Scores</h2>
            <button
              onClick={() => setManaging(true)}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-semibold text-cream/80 transition-colors hover:bg-white/10 touch-manipulation"
            >
              <span aria-hidden>👥</span> Players
            </button>
          </div>

          <ul className="space-y-2">
            {rankedActive.map((p, i) => {
              const total = totals[p.key] ?? 0;
              const isTalia = p.key === round.taliaKey;
              return (
                <li key={p.key} className="panel flex items-center gap-3 px-4 py-3.5">
                  <span className="tnum w-6 text-center text-sm font-bold text-cream/40">
                    {i + 1}
                  </span>
                  <span className="flex min-w-0 flex-1 items-center gap-2">
                    <span className="truncate text-lg font-semibold text-cream">
                      {p.displayName}
                    </span>
                    {isTalia && (
                      <span className="shrink-0 rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 text-[10px] font-bold text-gold-light">
                        🃏
                      </span>
                    )}
                  </span>
                  <span className={`tnum text-3xl font-extrabold ${scoreColorClass(total)}`}>
                    {formatSigned(total)}
                  </span>
                </li>
              );
            })}
          </ul>

          {/* Held / removed players keep their score but sit out scoring. */}
          {inactivePlayers.length > 0 && (
            <ul className="mt-2 space-y-2">
              {inactivePlayers.map((p) => {
                const total = totals[p.key] ?? 0;
                return (
                  <li
                    key={p.key}
                    className="flex items-center gap-3 rounded-2xl border border-white/5 bg-black/10 px-4 py-3 opacity-70"
                  >
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                        p.status === 'held'
                          ? 'bg-amber-400/20 text-amber-200'
                          : 'bg-white/10 text-cream/50'
                      }`}
                    >
                      {statusLabel(p.status)}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-semibold text-cream/80">
                      {p.displayName}
                    </span>
                    <span className={`tnum text-xl font-bold ${scoreColorClass(total)}`}>
                      {formatSigned(total)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Tally check — the grand total should always be 0. */}
          <div
            className={`mt-2 flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold ${
              tallies
                ? 'text-emerald-300/80'
                : 'border border-rose-400/30 bg-rose-500/10 text-rose-200'
            }`}
          >
            {tallies ? (
              <>
                <span aria-hidden>✓</span> Tallies — all scores add to 0
              </>
            ) : (
              <>
                <span aria-hidden>⚠</span> Off by{' '}
                <span className="tnum">{formatSigned(grandTotal)}</span>
              </>
            )}
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
                    <span className={`tnum text-base font-bold ${scoreColorClass(lifetime)}`}>
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
              No events yet. Open the round above to begin.
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
          players={modalPlayers}
          onClose={() => setModal(null)}
          onSave={onSaveEvent}
        />
      )}

      {managing && (
        <ManagePlayersModal
          players={session.players}
          onClose={() => setManaging(false)}
          onAddPlayer={(key, displayName) =>
            dispatch({ type: 'ADD_PLAYER', key, displayName })
          }
          onSetStatus={(key, status: PlayerStatus) =>
            dispatch({ type: 'SET_PLAYER_STATUS', key, status })
          }
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
