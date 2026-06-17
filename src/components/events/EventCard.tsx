import type { GameEvent, SessionPlayer } from '../../types';
import { eventTypeLabel } from '../../lib/scoring';
import { formatSigned, formatTime, scoreColorClass } from '../../lib/format';

interface EventCardProps {
  event: GameEvent;
  players: SessionPlayer[];
  onEdit?: () => void;
  /** Index within the session, 1-based, for a subtle "hand #" label. */
  index?: number;
}

const typeAccent: Record<GameEvent['type'], string> = {
  opening: 'text-emerald-300/90',
  closing: 'text-sky-300/90',
  winner: 'text-gold-light',
};

export default function EventCard({ event, players, onEdit, index }: EventCardProps) {
  const nameOf = (key: string) =>
    players.find((p) => p.key === key)?.displayName ?? key;

  // Show players in the session's seating order for a stable, scannable layout.
  const ordered = players.filter((p) => p.key in event.changes);

  return (
    <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {index != null && (
              <span className="tnum rounded-md bg-white/10 px-1.5 py-0.5 text-xs font-semibold text-cream/60">
                #{index}
              </span>
            )}
            <h4 className={`truncate text-sm font-bold ${typeAccent[event.type]}`}>
              {eventTypeLabel(event)}
            </h4>
          </div>
          {event.type === 'winner' && (
            <p className="mt-0.5 text-xs text-cream/60">
              Winner · <span className="font-semibold text-cream">{nameOf(event.winnerKey)}</span>
            </p>
          )}
          {event.type === 'opening' && event.taliaKey && (
            <p className="mt-0.5 text-xs text-cream/60">
              🃏 Talia ·{' '}
              <span className="font-semibold text-gold-light">{nameOf(event.taliaKey)}</span>
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs text-cream/40">{formatTime(event.timestamp)}</span>
          {onEdit && (
            <button
              onClick={onEdit}
              className="rounded-lg border border-white/10 px-2.5 py-1 text-xs font-semibold text-cream/80 transition-colors hover:bg-white/10 touch-manipulation"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
        {ordered.map((p) => {
          const change = event.changes[p.key] ?? 0;
          const input = event.inputs[p.key];
          const isWinner = event.type === 'winner' && p.key === event.winnerKey;
          return (
            <div key={p.key} className="flex items-baseline justify-between gap-2">
              <span className="truncate text-sm text-cream/75">
                {isWinner && <span className="mr-1">👑</span>}
                {p.displayName}
                {input != null && !isWinner && (
                  <span className="ml-1 text-xs text-cream/35">({input})</span>
                )}
              </span>
              <span className={`tnum text-sm font-bold ${scoreColorClass(change)}`}>
                {formatSigned(change)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
