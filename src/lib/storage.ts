import type { AppState, Session } from '../types';

const STORAGE_KEY = 'felt-scorekeeper:v1';

const emptyState: AppState = {
  version: 1,
  activeSession: null,
  history: [],
  registry: {},
};

function isSession(value: unknown): value is Session {
  if (!value || typeof value !== 'object') return false;
  const s = value as Record<string, unknown>;
  return (
    typeof s.id === 'string' &&
    typeof s.date === 'string' &&
    Array.isArray(s.players) &&
    Array.isArray(s.events)
  );
}

/**
 * Load and lightly validate persisted state. Any corruption falls back to a
 * clean empty state rather than crashing the app.
 */
export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState;

    const parsed = JSON.parse(raw) as Partial<AppState>;
    if (!parsed || typeof parsed !== 'object') return emptyState;

    return {
      version: 1,
      activeSession: isSession(parsed.activeSession) ? parsed.activeSession : null,
      history: Array.isArray(parsed.history) ? parsed.history.filter(isSession) : [],
      registry:
        parsed.registry && typeof parsed.registry === 'object' ? parsed.registry : {},
    };
  } catch {
    return emptyState;
  }
}

/** Persist the full application state to LocalStorage. */
export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage may be unavailable (private mode / quota). The app keeps working
    // in-memory for the current visit.
  }
}

/** Wipe all persisted data. */
export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* no-op */
  }
}
