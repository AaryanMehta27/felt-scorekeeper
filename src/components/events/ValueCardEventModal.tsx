import { useMemo, useState } from 'react';
import type { SessionPlayer, ValueCardEvent, ValueCardEventType } from '../../types';
import { buildValueCardEvent, calcValueCardChanges } from '../../lib/scoring';
import { formatSigned, scoreColorClass } from '../../lib/format';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import NumberInput from '../ui/NumberInput';

interface ValueCardEventModalProps {
  type: ValueCardEventType;
  players: SessionPlayer[];
  /** Provided when editing an existing event. */
  initial?: ValueCardEvent;
  onClose: () => void;
  onSave: (event: ValueCardEvent) => void;
}

/**
 * Entry screen for Opening / Closing Value Card declarations. Each player
 * enters the value cards they hold; the resulting score change is previewed
 * live (the formula always sums to zero across the table).
 */
export default function ValueCardEventModal({
  type,
  players,
  initial,
  onClose,
  onSave,
}: ValueCardEventModalProps) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const p of players) {
      init[p.key] = initial ? String(initial.inputs[p.key] ?? 0) : '';
    }
    return init;
  });

  const keys = useMemo(() => players.map((p) => p.key), [players]);

  const numericInputs = useMemo(() => {
    const out: Record<string, number> = {};
    for (const k of keys) out[k] = parseInt(values[k] || '0', 10) || 0;
    return out;
  }, [keys, values]);

  const changes = useMemo(
    () => calcValueCardChanges(numericInputs, keys),
    [numericInputs, keys],
  );

  const totalCards = keys.reduce((sum, k) => sum + numericInputs[k], 0);

  const title = type === 'opening' ? 'Opening Value Cards' : 'Closing Value Cards';

  const handleSave = () => {
    onSave(
      buildValueCardEvent(
        type,
        numericInputs,
        keys,
        initial ? { id: initial.id, timestamp: initial.timestamp } : undefined,
      ),
    );
  };

  return (
    <Modal
      title={title}
      subtitle="Enter the value cards each player holds"
      onClose={onClose}
      footer={
        <Button variant="primary" size="lg" fullWidth onClick={handleSave}>
          {initial ? 'Save Changes' : 'Lock In Scores'}
        </Button>
      }
    >
      <div className="space-y-3">
        {players.map((p) => (
          <div
            key={p.key}
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-3"
          >
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold text-cream">{p.displayName}</div>
              <div
                className={`tnum text-sm font-bold ${scoreColorClass(changes[p.key] ?? 0)}`}
              >
                {formatSigned(changes[p.key] ?? 0)}
              </div>
            </div>
            <div className="w-40 shrink-0">
              <NumberInput
                ariaLabel={`${p.displayName} value cards`}
                value={values[p.key] ?? ''}
                onChange={(v) => setValues((s) => ({ ...s, [p.key]: v }))}
              />
            </div>
          </div>
        ))}

        <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3 text-sm">
          <span className="text-cream/60">Total value cards</span>
          <span className="tnum text-lg font-bold text-cream">{totalCards}</span>
        </div>
      </div>
    </Modal>
  );
}
