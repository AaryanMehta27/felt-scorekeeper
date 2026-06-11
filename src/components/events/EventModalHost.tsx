import type { GameEvent, SessionPlayer, ValueCardEvent, WinnerEvent } from '../../types';
import ValueCardEventModal from './ValueCardEventModal';
import WinnerEventModal from './WinnerEventModal';

export type EventModalRequest =
  | { mode: 'add'; kind: 'opening' | 'closing' | 'winner' }
  | { mode: 'edit'; event: GameEvent };

interface EventModalHostProps {
  request: EventModalRequest;
  players: SessionPlayer[];
  onClose: () => void;
  onSave: (event: GameEvent) => void;
}

/**
 * Renders the correct entry modal for either adding a new event or editing an
 * existing one, so both the active-session and history screens can reuse the
 * same flows. On edit, the original id/timestamp are preserved and the changes
 * are recalculated as if the event had always held the corrected values.
 */
export default function EventModalHost({
  request,
  players,
  onClose,
  onSave,
}: EventModalHostProps) {
  const handleSave = (event: GameEvent) => {
    onSave(event);
    onClose();
  };

  if (request.mode === 'add') {
    if (request.kind === 'winner') {
      return <WinnerEventModal players={players} onClose={onClose} onSave={handleSave} />;
    }
    return (
      <ValueCardEventModal
        type={request.kind}
        players={players}
        onClose={onClose}
        onSave={handleSave}
      />
    );
  }

  // Edit mode — branch on the existing event's type.
  if (request.event.type === 'winner') {
    return (
      <WinnerEventModal
        players={players}
        initial={request.event as WinnerEvent}
        onClose={onClose}
        onSave={handleSave}
      />
    );
  }

  return (
    <ValueCardEventModal
      type={request.event.type}
      players={players}
      initial={request.event as ValueCardEvent}
      onClose={onClose}
      onSave={handleSave}
    />
  );
}
