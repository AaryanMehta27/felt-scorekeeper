import type { Session, ValueCardEvent } from '../types';

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
  /** The current round's talia holder, or null before this round's opening. */
  taliaKey: string | null;
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
  let taliaKey: string | null = null;
  if (nextPhase !== 'opening') {
    for (let i = events.length - 1; i >= 0; i--) {
      const e = events[i];
      if (e.type === 'closing') break;
      if (e.type === 'opening') {
        taliaKey = (e as ValueCardEvent).taliaKey ?? null;
        break;
      }
    }
  }

  return { nextPhase, roundNumber, taliaKey };
}
