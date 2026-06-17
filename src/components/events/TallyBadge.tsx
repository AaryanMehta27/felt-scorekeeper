import { formatSigned } from '../../lib/format';

/**
 * Reassurance indicator shown before a score is locked: confirms the part's
 * changes balance to zero. When (defensively) out of balance, it shows the
 * offset so it's obvious why the score can't be locked yet.
 */
export default function TallyBadge({ balance }: { balance: number }) {
  const balanced = balance === 0;
  return (
    <div
      className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold ${
        balanced
          ? 'border border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
          : 'border border-rose-400/30 bg-rose-500/10 text-rose-200'
      }`}
    >
      {balanced ? (
        <>
          <span aria-hidden>✓</span> Balanced — totals add to 0
        </>
      ) : (
        <>
          <span aria-hidden>⚠</span> Doesn't tally · off by{' '}
          <span className="tnum">{formatSigned(balance)}</span>
        </>
      )}
    </div>
  );
}
