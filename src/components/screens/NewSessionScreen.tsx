import { useMemo, useState } from 'react';
import type { Navigate } from '../../App';
import type { SessionPlayer } from '../../types';
import { useStore } from '../../store/store';
import { computeLeaderboard } from '../../lib/scoring';
import { cleanName, normalizeKey } from '../../lib/normalize';
import ScreenHeader from '../ui/ScreenHeader';
import Button from '../ui/Button';

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 8;
const COUNT_OPTIONS = [3, 4, 5, 6, 7, 8];

export default function NewSessionScreen({ navigate }: { navigate: Navigate }) {
  const { state, dispatch } = useStore();
  const [count, setCount] = useState(4);
  const [names, setNames] = useState<string[]>(() => Array(MAX_PLAYERS).fill(''));
  const [error, setError] = useState<string | null>(null);

  const hasActive = !!state.activeSession;

  // Known players (from the lifetime leaderboard) offered as one-tap fills.
  const knownNames = useMemo(
    () => computeLeaderboard(state).map((e) => e.displayName),
    [state],
  );

  const usedKeys = useMemo(
    () => new Set(names.slice(0, count).map((n) => normalizeKey(n)).filter(Boolean)),
    [names, count],
  );
  const suggestions = knownNames.filter((n) => !usedKeys.has(normalizeKey(n)));

  const setName = (index: number, value: string) => {
    setNames((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    setError(null);
  };

  const fillNextEmpty = (name: string) => {
    const idx = names.slice(0, count).findIndex((n) => n.trim() === '');
    if (idx === -1) return;
    setName(idx, name);
  };

  const start = () => {
    const cleaned = names.slice(0, count).map(cleanName);

    if (cleaned.some((n) => n === '')) {
      setError('Please name every player.');
      return;
    }

    const players: SessionPlayer[] = [];
    const seen = new Set<string>();
    for (const name of cleaned) {
      const key = normalizeKey(name);
      if (seen.has(key)) {
        setError(`"${name}" is entered twice — names must be unique.`);
        return;
      }
      seen.add(key);
      players.push({ key, displayName: name });
    }

    dispatch({ type: 'START_SESSION', players });
    navigate('session');
  };

  return (
    <div className="flex flex-1 flex-col">
      <ScreenHeader title="New Session" onBack={() => navigate('home')} />

      <div className="mt-4 flex-1 space-y-6 overflow-y-auto pb-4">
        {hasActive && (
          <div className="rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-cream/80">
            Starting a new session will save your current one to history.
          </div>
        )}

        {/* Player count */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-cream/70">
            Number of players
          </label>
          <div className="grid grid-cols-6 gap-2">
            {COUNT_OPTIONS.map((n) => {
              const selected = n === count;
              return (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={`tnum flex h-12 items-center justify-center rounded-2xl border text-lg font-bold transition-colors touch-manipulation ${
                    selected
                      ? 'border-gold-light/60 bg-gradient-to-b from-gold-light to-gold text-felt-deep shadow-gold'
                      : 'border-white/12 bg-white/5 text-cream/80 hover:bg-white/10'
                  }`}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </div>

        {/* Names */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-cream/70">
            Player names
          </label>
          <div className="space-y-2">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="tnum flex h-12 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-sm font-bold text-cream/50">
                  {i + 1}
                </span>
                <input
                  type="text"
                  value={names[i]}
                  onChange={(e) => setName(i, e.target.value)}
                  placeholder={`Player ${i + 1}`}
                  autoCapitalize="words"
                  autoComplete="off"
                  spellCheck={false}
                  className="h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-base font-medium text-cream placeholder:text-cream/30 focus:border-gold/60 focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Quick add from known players */}
        {suggestions.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-cream/40">
              Returning players
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((name) => (
                <button
                  key={name}
                  onClick={() => fillNextEmpty(name)}
                  className="min-h-[2.5rem] rounded-full border border-white/12 bg-white/5 px-4 text-sm font-semibold text-cream/80 transition-colors hover:bg-white/10 touch-manipulation"
                >
                  + {name}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <p className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </p>
        )}
      </div>

      <div className="border-t border-white/10 pt-4">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={start}
          disabled={count < MIN_PLAYERS}
        >
          Start Session
        </Button>
      </div>
    </div>
  );
}
