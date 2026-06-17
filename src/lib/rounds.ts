import type { Session, SessionPlayer, ValueCardEvent } from '../types';

/**
 * Read an opening event's talia as a per-player count map, transparently
 * upgrading the legacy single-holder `taliaKey` format.
 */
export function getEventTalia(event: ValueCardEvent): Record<string, number> {
  if (event.talia) return event.talia;
  if (event.taliaKey) return { [event.taliaKey]: 1 };
  return {};
}

/** Total talia tagged in a map (sum of all counts). */
export function taliaCount(talia: Record<string, number>): number {
  return Object.values(talia).reduce((sum, n) => sum + n, 0);
}

/** "Aaryan ×2, Bob" — a readable summary of who holds the talia. */
export function taliaSummary(
  talia: Record<string, number>,
  players: SessionPlayer[],
): string {
  const nameOf = (key: string) =>
    players.find((p) => p.key === key)?.displayName ?? key;
  return Object.entries(talia)
    .filter(([, n]) => n > 0)
    .map(([key, n]) => (n > 1 ? `${nameOf(key)} ×${n}` : nameOf(key)))
    .join(', ');
}

/**
 * Round flow.
 *
 * A round is a strict sequence of three parts that must happen in order:
 *   Opening declaration → Winner settlement → Closing declaration.
 *
 * The next allowed part is derived from the last recorded event, so the UI can
 * offer exactly one action and never let the order be disrupted. The "talia"
 * tag is set at the opening and holds until the round is closed.
 */

export type RoundPhase = 'opening' | 'winner' | 'closing';

export const PHASE_ORDER: RoundPhase[] = ['opening', 'winner', 'closing'];

export const PHASE_LABEL: Record<RoundPhase, string> = {
  opening: 'Opening',
  winner: 'Settlement',
  closing: 'Closing',
};

export interface RoundState {
  /** The part that must be entered next. */
  nextPhase: RoundPhase;
  /** The round currently in progress (or about to start), 1-based. */
  roundNumber: number;
  /** The current round's talia counts (player key -> count). Empty before opening. */
  talia: Record<string, number>;
}

export function getRoundState(session: Session): RoundState {
  const { events } = session;
  const last = events[events.length - 1];

  let nextPhase: RoundPhase;
  if (!last || last.type === 'closing') nextPhase = 'opening';
  else if (last.type === 'opening') nextPhase = 'winner';
  else nextPhase = 'closing'; // last was a winner settlement

  const completedRounds = events.filter((e) => e.type === 'closing').length;
  const roundNumber = completedRounds + 1;

  // The talia comes from this round's opening event (the most recent opening
  // that hasn't yet been followed by a closing).
  let talia: Record<string, number> = {};
  if (nextPhase !== 'opening') {
    for (let i = events.length - 1; i >= 0; i--) {
      const e = events[i];
      if (e.type === 'closing') break;
      if (e.type === 'opening') {
        talia = getEventTalia(e as ValueCardEvent);
        break;
      }
    }
  }

  return { nextPhase, roundNumber, talia };
}
