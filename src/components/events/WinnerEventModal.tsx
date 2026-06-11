import { useMemo, useState } from 'react';
import type { SessionPlayer, WinnerEvent } from '../../types';
import { buildWinnerEvent, calcWinnerChanges } from '../../lib/scoring';
import { formatSigned, scoreColorClass } from '../../lib/format';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import NumberInput from '../ui/NumberInput';

interface WinnerEventModalProps {
  players: SessionPlayer[];
  /** Provided when editing an existing event. */
  initial?: WinnerEvent;
  onClose: () => void;
  onSave: (event: WinnerEvent) => void;
}

/**
 * Winner Settlement entry. Pick the winner, then every other player enters the
 * points they lost. The winner's gain (the sum of all losses) previews live.
 */
export default function WinnerEventModal({
  players,
  initial,
  onClose,
  onSave,
}: WinnerEventModalProps) {
  const [winnerKey, setWinnerKey] = useState<string>(
    initial?.winnerKey ?? players[0]?.key ?? '',
  );
  const [losses, setLosses] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const p of players) {
      init[p.key] = initial ? String(initial.inputs[p.key] ?? 0) : '';
    }
    return init;
  });

  const keys = useMemo(() => players.map((p) => p.key), [players]);

  const numericLosses = useMemo(() => {
    const out: Record<string, number> = {};
    for (const k of keys) out[k] = parseInt(losses[k] || '0', 10) || 0;
    return out;
  }, [keys, losses]);

  const changes = useMemo(
    () => calcWinnerChanges(winnerKey, numericLosses, keys),
    [winnerKey, numericLosses, keys],
  );

  const winnerGain = changes[winnerKey] ?? 0;

  const handleSave = () => {
    onSave(
      buildWinnerEvent(
        winnerKey,
        numericLosses,
        keys,
        initial ? { id: initial.id, timestamp: initial.timestamp } : undefined,
      ),
    );
  };

  return (
    <Modal
      title="Winner Settlement"
      subtitle="Select the winner, then enter each loss"
      onClose={onClose}
      footer={
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleSave}
          disabled={!winnerKey}
        >
          {initial ? 'Save Changes' : 'Lock In Scores'}
        </Button>
      }
    >
      <div className="space-y-5">
        <div>
          <p className="mb-2 text-sm font-semibold text-cream/70">Winner</p>
          <div className="flex flex-wrap gap-2">
            {players.map((p) => {
              const selected = p.key === winnerKey;
              return (
                <button
                  key={p.key}
                  onClick={() => setWinnerKey(p.key)}
                  className={`min-h-[2.75rem] rounded-2xl border px-4 text-sm font-semibold transition-colors touch-manipulation ${
                    selected
                      ? 'border-gold-light/60 bg-gradient-to-b from-gold-light to-gold text-felt-deep shadow-gold'
                      : 'border-white/12 bg-white/5 text-cream/80 hover:bg-white/10'
                  }`}
                >
                  {selected && <span className="mr-1">👑</span>}
                  {p.displayName}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3">
          <span className="text-sm text-cream/80">
            {players.find((p) => p.key === winnerKey)?.displayName ?? 'Winner'} collects
          </span>
          <span className="tnum text-2xl font-extrabold text-gold-light">
            {formatSigned(winnerGain)}
          </span>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-cream/70">Points lost by each player</p>
          {players
            .filter((p) => p.key !== winnerKey)
            .map((p) => (
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
                    ariaLabel={`${p.displayName} points lost`}
                    value={losses[p.key] ?? ''}
                    onChange={(v) => setLosses((s) => ({ ...s, [p.key]: v }))}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>
    </Modal>
  );
}
