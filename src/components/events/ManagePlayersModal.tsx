import { useState } from 'react';
import type { PlayerStatus, SessionPlayer } from '../../types';
import { isActivePlayer } from '../../lib/players';
import { cleanName, normalizeKey } from '../../lib/normalize';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface ManagePlayersModalProps {
  players: SessionPlayer[];
  onClose: () => void;
  onAddPlayer: (key: string, displayName: string) => void;
  onSetStatus: (key: string, status: PlayerStatus) => void;
}

const STATUS_BADGE: Record<Exclude<PlayerStatus, 'active'>, string> = {
  held: 'On hold',
  removed: 'Left',
};

/**
 * Mid-game roster management: add a player, put one on hold (sits out scoring),
 * resume them, or remove them. Held/removed players keep their accumulated
 * score; they are simply excluded from new events.
 */
export default function ManagePlayersModal({
  players,
  onClose,
  onAddPlayer,
  onSetStatus,
}: ManagePlayersModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const add = () => {
    const display = cleanName(name);
    if (!display) {
      setError('Enter a name to add a player.');
      return;
    }
    const key = normalizeKey(display);
    const existing = players.find((p) => p.key === key);
    if (existing && isActivePlayer(existing)) {
      setError(`${existing.displayName} is already in the game.`);
      return;
    }
    onAddPlayer(key, display);
    setName('');
    setError(null);
  };

  const status = (p: SessionPlayer): PlayerStatus => p.status ?? 'active';

  return (
    <Modal
      title="Players"
      subtitle="Add, hold, or remove players mid-game"
      onClose={onClose}
      footer={
        <Button variant="primary" size="lg" fullWidth onClick={onClose}>
          Done
        </Button>
      }
    >
      <div className="space-y-5">
        {/* Add player */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-cream/70">
            Add a player
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') add();
              }}
              placeholder="Player name"
              autoCapitalize="words"
              autoComplete="off"
              spellCheck={false}
              className="h-12 w-full min-w-0 rounded-2xl border border-white/10 bg-black/30 px-4 text-base font-medium text-cream placeholder:text-cream/30 focus:border-gold/60 focus:outline-none"
            />
            <Button variant="primary" onClick={add} className="shrink-0 px-5">
              Add
            </Button>
          </div>
          {error && <p className="mt-2 text-sm text-rose-300">{error}</p>}
        </div>

        <div className="gold-rule" />

        {/* Roster */}
        <div className="space-y-2">
          {players.map((p) => {
            const s = status(p);
            const badge = s === 'active' ? null : STATUS_BADGE[s];
            return (
              <div
                key={p.key}
                className={`flex items-center gap-3 rounded-2xl border p-3 ${
                  s === 'active'
                    ? 'border-white/10 bg-black/20'
                    : 'border-white/5 bg-black/10 opacity-70'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-cream">{p.displayName}</div>
                  {badge && (
                    <span
                      className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                        s === 'held'
                          ? 'bg-amber-400/20 text-amber-200'
                          : 'bg-white/10 text-cream/50'
                      }`}
                    >
                      {badge}
                    </span>
                  )}
                </div>

                <div className="flex shrink-0 gap-2">
                  {s === 'active' && (
                    <>
                      <button
                        onClick={() => onSetStatus(p.key, 'held')}
                        className="min-h-[2.5rem] rounded-xl border border-amber-300/30 bg-amber-400/10 px-3 text-sm font-semibold text-amber-200 transition-colors hover:bg-amber-400/20 touch-manipulation"
                      >
                        Hold
                      </button>
                      <button
                        onClick={() => onSetStatus(p.key, 'removed')}
                        className="min-h-[2.5rem] rounded-xl border border-white/10 px-3 text-sm font-semibold text-cream/70 transition-colors hover:bg-white/10 touch-manipulation"
                      >
                        Remove
                      </button>
                    </>
                  )}
                  {s === 'held' && (
                    <>
                      <button
                        onClick={() => onSetStatus(p.key, 'active')}
                        className="min-h-[2.5rem] rounded-xl border border-emerald-300/30 bg-emerald-400/10 px-3 text-sm font-semibold text-emerald-200 transition-colors hover:bg-emerald-400/20 touch-manipulation"
                      >
                        Resume
                      </button>
                      <button
                        onClick={() => onSetStatus(p.key, 'removed')}
                        className="min-h-[2.5rem] rounded-xl border border-white/10 px-3 text-sm font-semibold text-cream/70 transition-colors hover:bg-white/10 touch-manipulation"
                      >
                        Remove
                      </button>
                    </>
                  )}
                  {s === 'removed' && (
                    <button
                      onClick={() => onSetStatus(p.key, 'active')}
                      className="min-h-[2.5rem] rounded-xl border border-emerald-300/30 bg-emerald-400/10 px-4 text-sm font-semibold text-emerald-200 transition-colors hover:bg-emerald-400/20 touch-manipulation"
                    >
                      Rejoin
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs leading-relaxed text-cream/45">
          Held and removed players keep their current score but are left out of
          new events. Resume or rejoin them anytime.
        </p>
      </div>
    </Modal>
  );
}
