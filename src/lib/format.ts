/** Presentation helpers for scores and dates. */

/** "+9", "-7", "0" — always shows the sign for non-zero values. */
export function formatSigned(n: number): string {
  if (n > 0) return `+${n}`;
  return String(n);
}

/** Tailwind text-color class for a score delta on the green felt. */
export function scoreColorClass(n: number): string {
  if (n > 0) return 'text-emerald-300';
  if (n < 0) return 'text-rose-300';
  return 'text-cream/50';
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatDateTime(iso: string): string {
  return `${formatDate(iso)} · ${formatTime(iso)}`;
}

/** "Today", "Yesterday", or a short date. */
export function formatRelativeDay(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const dayMs = 86_400_000;
  const diffDays = Math.round((startOf(now) - startOf(d)) / dayMs);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return formatDate(iso);
}
