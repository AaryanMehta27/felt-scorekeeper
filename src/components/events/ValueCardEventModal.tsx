import { useMemo, useState } from 'react';
import type { SessionPlayer, ValueCardEvent, ValueCardEventType } from '../../types';
import { buildValueCardEvent, calcValueCardChanges, sumChanges } from '../../lib/scoring';
import { getEventTalia, taliaCount } from '../../lib/rounds';
import { formatSigned, scoreColorClass } from '../../lib/format';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import NumberInput from '../ui/NumberInput';
import TallyBadge from './TallyBadge';

interface ValueCardEventModalProps {
  type: ValueCardEventType;
  players: SessionPlayer[];
  /** Show the talia tagger (opening declarations only). */
  withTalia?: boolean;
  /** Provided when editing an existing event. */
  initial?: ValueCardEvent;
  onClose: () => void;
  onSave: (event: ValueCardEvent) => void;
}

/**
 * Entry screen for Opening / Closing Value Card declarations. Each player
 * enters the value cards they hold; the resulting score change previews live
 * and a tally badge confirms the part balances to zero before it can be locked.
 * Openings also tag the round's talia holder.
 */
export default function ValueCardEventModal({
  type,
  players,
  withTalia = false,
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
  const [talia, setTalia] = useState<Record<string, number>>(() =>
    initial ? { ...getEventTalia(initial) } : {},
  );
  const bumpTalia = (key: string, delta: number) =>
    setTalia((s) => {
      const next = Math.max(0, (s[key] ?? 0) + delta);
      const out = { ...s };
      if (next === 0) delete out[key];
      else out[key] = next;
      return out;
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
  const balance = sumChanges(changes);
  const balanced = balance === 0;

  const title = type === 'opening' ? 'Opening Value Cards' : 'Closing Value Cards';

  const handleSave = () => {
    if (!balanced) return;
    onSave(
      buildValueCardEvent(
        type,
        numericInputs,
        keys,
        initial ? { id: initial.id, timestamp: initial.timestamp } : undefined,
        withTalia ? talia : undefined,
      ),
    );
  };

  return (
    <Modal
      title={title}
      subtitle="Enter the value cards each player holds"
      onClose={onClose}
      footer={
        <div className="space-y-3">
          <TallyBadge balance={balance} />
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!balanced}
            onClick={handleSave}
          >
            {initial ? 'Save Changes' : 'Lock In Scores'}
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        {withTalia && (
          <div className="rounded-2xl border border-gold/25 bg-gold/[0.07] p-3">
            <p className="mb-2 text-sm font-semibold text-gold-light">
              🃏 Talia{' '}
              <span className="font-normal text-cream/50">
                (holds for the round · multiple allowed)
              </span>
            </p>
            <div className="space-y-1.5">
              {players.map((p) => {
                const count = talia[p.key] ?? 0;
                const has = count > 0;
                return (
                  <div
                    key={p.key}
                    className={`flex items-center gap-3 rounded-xl px-2 py-1.5 ${
                      has ? 'bg-gold/10' : ''
                    }`}
                  >
                    <span
                      className={`min-w-0 flex-1 truncate text-sm font-semibold ${
                        has ? 'text-gold-light' : 'text-cream/80'
                      }`}
                    >
                      {p.displayName}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={`Remove talia from ${p.displayName}`}
                        onClick={() => bumpTalia(p.key, -1)}
                        disabled={!has}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-xl font-bold text-cream/80 transition-transform active:scale-90 disabled:opacity-30 touch-manipulation"
                      >
                        −
                      </button>
                      <span className="tnum w-6 text-center text-base font-bold text-cream">
                        {count}
                      </span>
                      <button
                        type="button"
                        aria-label={`Add talia to ${p.displayName}`}
                        onClick={() => bumpTalia(p.key, 1)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold/30 bg-gold/15 text-xl font-bold text-gold-light transition-transform active:scale-90 touch-manipulation"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            {taliaCount(talia) > 0 && (
              <p className="mt-2 text-xs text-cream/50">
                {taliaCount(talia)} talia tagged
              </p>
            )}
          </div>
        )}

        {players.map((p) => (
          <div
            key={p.key}
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-3"
          >
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold text-cream">{p.displayName}</div>
              <div className={`tnum text-sm font-bold ${scoreColorClass(changes[p.key] ?? 0)}`}>
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
