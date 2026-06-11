import { useMemo, useState } from 'react';
import type { Navigate } from '../../App';
import { useStore } from '../../store/store';
import { computeLeaderboard } from '../../lib/scoring';
import { formatRelativeDay, formatSigned, scoreColorClass } from '../../lib/format';
import ScreenHeader from '../ui/ScreenHeader';
import ConfirmDialog from '../ui/ConfirmDialog';

const RANK_BADGE = ['🥇', '🥈', '🥉'];

export default function LeaderboardScreen({ navigate }: { navigate: Navigate }) {
  const { state, dispatch } = useStore();
  const leaderboard = useMemo(() => computeLeaderboard(state), [state]);
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="flex flex-1 flex-col">
      <ScreenHeader title="Leaderboard" subtitle="Lifetime totals" onBack={() => navigate('home')} />

      <div className="flex-1 space-y-2 overflow-y-auto pb-4 pt-2">
        {leaderboard.length === 0 ? (
          <div className="panel mt-6 flex flex-col items-center gap-2 px-6 py-12 text-center">
            <span className="text-4xl opacity-60">🏆</span>
            <p className="text-cream/60">
              The leaderboard is empty. Finish a hand or two and the standings will appear here.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {leaderboard.map((entry, i) => {
              const isPodium = i < 3;
              return (
                <li
                  key={entry.key}
                  className={`flex items-center gap-3 rounded-3xl border px-4 py-4 ${
                    isPodium
                      ? 'border-gold/30 bg-gradient-to-r from-gold/[0.12] to-transparent'
                      : 'border-white/10 bg-black/20'
                  }`}
                >
                  <span className="flex w-8 shrink-0 justify-center">
                    {isPodium ? (
                      <span className="text-2xl">{RANK_BADGE[i]}</span>
                    ) : (
                      <span className="tnum text-lg font-bold text-cream/40">{i + 1}</span>
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-lg font-bold text-cream">
                      {entry.displayName}
                    </div>
                    <div className="text-xs text-cream/45">
                      {entry.sessionsPlayed}{' '}
                      {entry.sessionsPlayed === 1 ? 'session' : 'sessions'} · last{' '}
                      {formatRelativeDay(entry.lastPlayedDate)}
                    </div>
                  </div>
                  <span
                    className={`tnum text-3xl font-extrabold ${scoreColorClass(entry.lifetimeScore)}`}
                  >
                    {formatSigned(entry.lifetimeScore)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {leaderboard.length > 0 && (
        <div className="border-t border-white/10 pt-4">
          <button
            onClick={() => setConfirmReset(true)}
            className="w-full rounded-2xl py-3 text-sm font-semibold text-rose-300/70 transition-colors hover:text-rose-300"
          >
            Reset all data
          </button>
        </div>
      )}

      {confirmReset && (
        <ConfirmDialog
          title="Reset Everything?"
          message="This permanently deletes the active session, all history, and the lifetime leaderboard from this device. This cannot be undone."
          confirmLabel="Delete All Data"
          danger
          onConfirm={() => {
            dispatch({ type: 'RESET_ALL' });
            setConfirmReset(false);
            navigate('home');
          }}
          onCancel={() => setConfirmReset(false)}
        />
      )}
    </div>
  );
}
