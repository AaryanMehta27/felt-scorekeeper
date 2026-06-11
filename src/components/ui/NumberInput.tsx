interface NumberInputProps {
  /** Held as a string so the field can be cleared while typing. */
  value: string;
  onChange: (value: string) => void;
  min?: number;
  ariaLabel?: string;
}

/**
 * Large numeric entry tuned for one-handed use at a table: a wide centered
 * field flanked by big +/- steppers. Numeric keypad on mobile, no spinner.
 */
export default function NumberInput({
  value,
  onChange,
  min = 0,
  ariaLabel,
}: NumberInputProps) {
  const current = parseInt(value || '0', 10) || 0;

  const setNumber = (n: number) => onChange(String(Math.max(min, n)));

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label="Decrease"
        onClick={() => setNumber(current - 1)}
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-2xl font-bold text-cream/80 transition-transform active:scale-90 touch-manipulation"
      >
        −
      </button>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ''))}
        onFocus={(e) => e.target.select()}
        placeholder="0"
        className="tnum h-12 w-full min-w-0 rounded-2xl border border-white/10 bg-black/30 text-center text-2xl font-bold text-cream placeholder:text-cream/30 focus:border-gold/60 focus:outline-none"
      />
      <button
        type="button"
        aria-label="Increase"
        onClick={() => setNumber(current + 1)}
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-2xl font-bold text-cream/80 transition-transform active:scale-90 touch-manipulation"
      >
        +
      </button>
    </div>
  );
}
