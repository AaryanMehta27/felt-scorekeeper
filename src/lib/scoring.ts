import type {
  AppState,
  GameEvent,
  LeaderboardEntry,
  Session,
  ValueCardEvent,
  ValueCardEventType,
  WinnerEvent,
} from '../types';
import { newId } from './id';

/**
 * The reusable scoring engine.
 *
 * Pure, deterministic functions: given inputs they produce score changes. All
 * session totals and lifetime totals are derived from these, so undo and edit
 * operations require no manual bookkeeping — they simply mutate the event list
 * and let everything recompute.
 */

/**
 * Opening / Closing Value Card declaration.
 *
 *   score = (playerValueCards * numberOfPlayers) - totalValueCards
 *
 * Example — 4 players holding 5, 3, 2, 1 (total 11):
 *   +9, +1, -3, -7   (always sums to zero)
 */
export function calcValueCardChanges(
  inputs: Record<string, number>,
  playerKeys: string[],
): Record<string, number> {
  const numberOfPlayers = playerKeys.length;
  const totalValueCards = playerKeys.reduce((sum, key) => sum + (inputs[key] || 0), 0);

  const changes: Record<string, number> = {};
  for (const key of playerKeys) {
    const playerValueCards = inputs[key] || 0;
    changes[key] = playerValueCards * numberOfPlayers - totalValueCards;
  }
  return changes;
}

/**
 * Winner Settlement.
 *
 * The winner gains the sum of every loss; each losing player is debited the
 * points they entered.
 *
 * Example — winner A, with B=25, C=15, D=40:
 *   A +80, B -25, C -15, D -40   (always sums to zero)
 */
export function calcWinnerChanges(
  winnerKey: string,
  losses: Record<string, number>,
  playerKeys: string[],
): Record<string, number> {
  const changes: Record<string, number> = {};
  let totalLost = 0;

  for (const key of playerKeys) {
    if (key === winnerKey) continue;
    const loss = losses[key] || 0;
    changes[key] = -loss;
    totalLost += loss;
  }
  changes[winnerKey] = totalLost;

  return changes;
}

/** Build a fully-calculated value-card event (used for new events and edits). */
export function buildValueCardEvent(
  type: ValueCardEventType,
  inputs: Record<string, number>,
  playerKeys: string[],
  base?: Pick<ValueCardEvent, 'id' | 'timestamp'>,
): ValueCardEvent {
  return {
    id: base?.id ?? newId(),
    type,
    timestamp: base?.timestamp ?? new Date().toISOString(),
    inputs: { ...inputs },
    changes: calcValueCardChanges(inputs, playerKeys),
  };
}

/** Build a fully-calculated winner event (used for new events and edits). */
export function buildWinnerEvent(
  winnerKey: string,
  losses: Record<string, number>,
  playerKeys: string[],
  base?: Pick<WinnerEvent, 'id' | 'timestamp'>,
): WinnerEvent {
  return {
    id: base?.id ?? newId(),
    type: 'winner',
    timestamp: base?.timestamp ?? new Date().toISOString(),
    winnerKey,
    inputs: { ...losses },
    changes: calcWinnerChanges(winnerKey, losses, playerKeys),
  };
}

/** Sum every event's changes to get the running total per player this session. */
export function computeSessionTotals(session: Session): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const player of session.players) totals[player.key] = 0;

  for (const event of session.events) {
    for (const [key, change] of Object.entries(event.changes)) {
      totals[key] = (totals[key] || 0) + change;
    }
  }
  return totals;
}

/** All sessions that contribute to lifetime totals (history + the live one). */
export function allSessions(state: AppState): Session[] {
  return state.activeSession ? [...state.history, state.activeSession] : state.history;
}

/**
 * Derive the lifetime leaderboard from every session. Because identity is keyed
 * by normalized name, a player's scores merge across sessions automatically.
 * Sorted by lifetime score descending, then alphabetically.
 */
export function computeLeaderboard(state: AppState): LeaderboardEntry[] {
  const byKey = new Map<string, LeaderboardEntry>();

  for (const session of allSessions(state)) {
    const totals = computeSessionTotals(session);
    for (const player of session.players) {
      const displayName = state.registry[player.key] ?? player.displayName;
      const delta = totals[player.key] ?? 0;
      const existing = byKey.get(player.key);

      if (existing) {
        existing.lifetimeScore += delta;
        existing.sessionsPlayed += 1;
        existing.displayName = displayName;
        if (session.date > existing.lastPlayedDate) {
          existing.lastPlayedDate = session.date;
        }
      } else {
        byKey.set(player.key, {
          key: player.key,
          displayName,
          lifetimeScore: delta,
          sessionsPlayed: 1,
          lastPlayedDate: session.date,
        });
      }
    }
  }

  return [...byKey.values()].sort(
    (a, b) =>
      b.lifetimeScore - a.lifetimeScore || a.displayName.localeCompare(b.displayName),
  );
}

/** Human label for an event type. */
export function eventTypeLabel(event: GameEvent): string {
  switch (event.type) {
    case 'opening':
      return 'Opening Value Cards';
    case 'closing':
      return 'Closing Value Cards';
    case 'winner':
      return 'Winner Settlement';
  }
}
