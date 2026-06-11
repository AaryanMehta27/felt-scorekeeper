import type { GameEvent, PlayerStatus, Session, SessionPlayer } from '../types';

/** A player counts toward scoring unless explicitly held or removed. */
export function isActivePlayer(p: SessionPlayer): boolean {
  return (p.status ?? 'active') === 'active';
}

/** The players currently included in scoring for new events. */
export function getActivePlayers(session: Session): SessionPlayer[] {
  return session.players.filter(isActivePlayer);
}

/**
 * The players who actually took part in a given event — derived from the
 * event's own data, not the current roster. This is what an edit must
 * recalculate against, so changing the roster afterwards never distorts an
 * older event's number-of-players.
 */
export function getEventParticipants(event: GameEvent, session: Session): SessionPlayer[] {
  const known = session.players.filter((p) => p.key in event.changes);

  // Safety net for any participant key no longer present in the roster.
  const knownKeys = new Set(known.map((p) => p.key));
  const orphans: SessionPlayer[] = Object.keys(event.changes)
    .filter((k) => !knownKeys.has(k))
    .map((k) => ({ key: k, displayName: k, status: 'active' }));

  return [...known, ...orphans];
}

/** Short badge label for a non-active status (null when active). */
export function statusLabel(status: PlayerStatus | undefined): string | null {
  if (status === 'held') return 'On hold';
  if (status === 'removed') return 'Left';
  return null;
}
