import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import type { Dispatch, ReactNode } from 'react';
import type { AppState, GameEvent, Session, SessionPlayer } from '../types';
import { loadState, saveState } from '../lib/storage';
import { newId } from '../lib/id';

type Action =
  | { type: 'START_SESSION'; players: SessionPlayer[] }
  | { type: 'END_SESSION' }
  | { type: 'ADD_EVENT'; event: GameEvent }
  | { type: 'UNDO_LAST' }
  | { type: 'EDIT_EVENT'; sessionId: string; event: GameEvent }
  | { type: 'RESET_ALL' };

const nowIso = () => new Date().toISOString();

/** Archive the active session into history, but only if it actually has events. */
function archiveActive(state: AppState): Session[] {
  if (state.activeSession && state.activeSession.events.length > 0) {
    return [...state.history, { ...state.activeSession, endedAt: nowIso() }];
  }
  return state.history;
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'START_SESSION': {
      const registry = { ...state.registry };
      for (const p of action.players) registry[p.key] = p.displayName;

      const session: Session = {
        id: newId(),
        date: nowIso(),
        players: action.players,
        events: [],
      };

      return {
        ...state,
        activeSession: session,
        history: archiveActive(state),
        registry,
      };
    }

    case 'END_SESSION': {
      if (!state.activeSession) return state;
      return {
        ...state,
        activeSession: null,
        history: archiveActive(state),
      };
    }

    case 'ADD_EVENT': {
      if (!state.activeSession) return state;
      return {
        ...state,
        activeSession: {
          ...state.activeSession,
          events: [...state.activeSession.events, action.event],
        },
      };
    }

    case 'UNDO_LAST': {
      if (!state.activeSession || state.activeSession.events.length === 0) return state;
      return {
        ...state,
        activeSession: {
          ...state.activeSession,
          events: state.activeSession.events.slice(0, -1),
        },
      };
    }

    case 'EDIT_EVENT': {
      const replaceIn = (s: Session): Session =>
        s.id === action.sessionId
          ? {
              ...s,
              events: s.events.map((e) => (e.id === action.event.id ? action.event : e)),
            }
          : s;

      return {
        ...state,
        activeSession: state.activeSession ? replaceIn(state.activeSession) : null,
        history: state.history.map(replaceIn),
      };
    }

    case 'RESET_ALL':
      return { version: 1, activeSession: null, history: [], registry: {} };

    default:
      return state;
  }
}

interface StoreValue {
  state: AppState;
  dispatch: Dispatch<Action>;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  // Lazily hydrate from LocalStorage so refreshes restore state immediately.
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within a StoreProvider');
  return ctx;
}
