/**
 * Player name normalization.
 *
 * Prevents duplicate leaderboard entries from spelling/casing variations:
 *   "Aaryan", "aaryan", " Aaryan ", "AARYAN"  ->  key "aaryan"
 *
 * The normalized key is used internally for identity and merging; the cleaned
 * display name preserves the player's preferred capitalization for the UI.
 */

/** Trim, collapse internal whitespace — keeps the user's chosen capitalization. */
export function cleanName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

/** Produce the case-insensitive identity key used to merge lifetime profiles. */
export function normalizeKey(name: string): string {
  return cleanName(name).toLowerCase();
}
