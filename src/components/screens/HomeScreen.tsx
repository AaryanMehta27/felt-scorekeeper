import { useMemo } from 'react';
import type { Navigate } from '../../App';
import { useStore } from '../../store/store';
import { computeLeaderboard, computeSessionTotals } from '../../lib/scoring';
import { formatSigned, scoreColorClass } from '../../lib/format';
import Button from '../ui/Button';

const RANK_BADGE = ['🥇', '🥈', '🥉'];

export default function HomeScreen({ navigate }: { navigate: Navigate }) {
  const { state } = useStore();
  const leaderboard = useMemo(() => computeLeaderboard(state), [state]);
  const top = leaderboard.slice(0, 3);

  const active = state.activeSession;
  const activeMeta = active
    ? `${active.players.length} players · ${active.events.length} ${
        active.events.length === 1 ? 'event' : 'events'
      }`
    : null;
  const activeLeader = useMemo(() => {
    if (!active) return null;
    const totals = computeSessionTotals(active);
    return [...active.players].sort((a, b) => (totals[b.key] ?? 0) - (totals[a.key] ?? 0))[0];
  }, [active]);

  return (
    <div className="flex flex-1 flex-col">
      {/* Hero */}
      <div className="flex flex-col items-center pt-10 text-center">
        <div className="mb-4 flex items-center gap-3 text-2xl">
          <span className="text-cream/80">♠</span>
          <span className="text-rose-400/90">♥</span>
          <span className="text-rose-400/90">♦</span>
          <span className="text-cream/80">♣</span>
        </div>
        <h1 className="font-display text-6xl font-extrabold tracking-tight text-cream drop-shadow">
          Felt
        </h1>
        <p className="mt-2 text-sm uppercase tracking-[0.28em] text-gold/80">
          Card Table Scorekeeper
        </p>
      </div>

      {/* Primary actions */}
      <div className="mt-10 space-y-3">
        {active ? (
          <>
            <Button variant="primary" size="lg" fullWidth onClick={() => navigate('session')}>
              <span className="flex flex-col items-center leading-tight">
                <span>Continue Session</span>
                <span className="text-xs font-medium text-felt-deep/70">{activeMeta}</span>
              </span>
            </Button>
            <Button variant="secondary" size="lg" fullWidth onClick={() => navigate('new')}>
              New Session
            </Button>
          </>
        ) : (
          <Button variant="primary" size="lg" fullWidth onClick={() => navigate('new')}>
            New Session
          </Button>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Button variant="ghost" size="lg" onClick={() => navigate('leaderboard')}>
            Leaderboard
          </Button>
          <Button variant="ghost" size="lg" onClick={() => navigate('history')}>
            History
          </Button>
        </div>
      </div>

      {/* Top players */}
      <div className="mt-10 flex-1">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-cream/90">Top Players</h2>
          {leaderboard.length > 3 && (
            <button
              onClick={() => navigate('leaderboard')}
              className="text-sm font-semibold text-gold/80 hover:text-gold"
            >
              See all
            </button>
          )}
        </div>

        {top.length === 0 ? (
          <div className="panel flex flex-col items-center gap-2 px-6 py-10 text-center">
            <span className="text-3xl opacity-60">🃏</span>
            <p className="text-sm text-cream/60">
              No games played yet. Start a session to build the lifetime leaderboard.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {top.map((entry, i) => (
              <li
                key={entry.key}
                className="panel flex items-center gap-3 px-4 py-3"
              >
                <span className="w-7 text-center text-xl">{RANK_BADGE[i]}</span>
                <span className="min-w-0 flex-1 truncate font-semibold text-cream">
                  {entry.displayName}
                </span>
                <span
                  className={`tnum text-xl font-extrabold ${scoreColorClass(entry.lifetimeScore)}`}
                >
                  {formatSigned(entry.lifetimeScore)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {active && activeLeader && (
        <p className="mt-6 text-center text-xs text-cream/40">
          Session in progress · leading: {activeLeader.displayName}
        </p>
      )}
    </div>
  );
}
