/**
 * Core data model for the scorekeeper.
 *
 * Player identity is keyed by a normalized name (see lib/normalize.ts) so that
 * "Aaryan", "aaryan", and " AARYAN " all map to one lifetime profile, while the
 * preferred capitalization is preserved separately for display.
 */

export type ValueCardEventType = 'opening' | 'closing';
export type GameEventType = ValueCardEventType | 'winner';

/**
 * A player's standing within an in-progress session.
 *  - `active`  — included in scoring.
 *  - `held`    — temporarily sitting out (e.g. took a call); excluded from new
 *                events until resumed. Their accumulated score is preserved.
 *  - `removed` — left the game; excluded from new events but their past score
 *                stays on record.
 *
 * Absent/undefined is treated as `active` for backward compatibility with
 * sessions saved before this field existed.
 */
export type PlayerStatus = 'active' | 'held' | 'removed';

/** A player as they participate in a single session. */
export interface SessionPlayer {
  /** Normalized identity key, e.g. "aaryan". */
  key: string;
  /** Preferred capitalization shown in the UI, e.g. "Aaryan". */
  displayName: string;
  /** Standing in the session. Defaults to `active` when omitted. */
  status?: PlayerStatus;
}

/**
 * Opening / Closing Value Card declaration.
 *
 * Every player declares how many value cards they hold. The score for each
 * player is `playerCards * numberOfPlayers - totalCards`, which always sums to
 * zero across the table.
 */
export interface ValueCardEvent {
  id: string;
  type: ValueCardEventType;
  timestamp: string; // ISO 8601
  /** Raw input: player key -> number of value cards held. */
  inputs: Record<string, number>;
  /** Calculated score change: player key -> delta. */
  changes: Record<string, number>;
}

/**
 * Winner Settlement.
 *
 * One winner is chosen; every other player declares the points they lost. The
 * winner gains the sum of all losses; each loser is debited their own amount.
 */
export interface WinnerEvent {
  id: string;
  type: 'winner';
  timestamp: string; // ISO 8601
  winnerKey: string;
  /** Raw input: losing player key -> points lost. */
  inputs: Record<string, number>;
  /** Calculated score change: player key -> delta. */
  changes: Record<string, number>;
}

export type GameEvent = ValueCardEvent | WinnerEvent;

/** A single sitting at the table — an ordered series of scoring events. */
export interface Session {
  id: string;
  /** ISO timestamp the session started. */
  date: string;
  /** ISO timestamp the session was finished, if it has been. */
  endedAt?: string;
  players: SessionPlayer[];
  events: GameEvent[];
}

/**
 * The entire persisted application state. Lifetime totals and the leaderboard
 * are intentionally *derived* from sessions (see lib/scoring.ts) so that undo
 * and edit operations reconcile automatically with no manual adjustments.
 */
export interface AppState {
  version: number;
  activeSession: Session | null;
  history: Session[];
  /** Normalized key -> most recently used preferred display name. */
  registry: Record<string, string>;
}

/** One row of the lifetime leaderboard, derived from all sessions. */
export interface LeaderboardEntry {
  key: string;
  displayName: string;
  lifetimeScore: number;
  sessionsPlayed: number;
  lastPlayedDate: string;
}
