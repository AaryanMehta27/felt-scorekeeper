import type { ReactNode } from 'react';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  /** Optional action rendered on the right (e.g. a button). */
  action?: ReactNode;
}

export default function ScreenHeader({ title, subtitle, onBack, action }: ScreenHeaderProps) {
  return (
    <header className="flex items-center gap-3 py-2">
      {onBack && (
        <button
          onClick={onBack}
          aria-label="Back"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-cream/80 transition-colors hover:bg-white/10 touch-manipulation"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate font-display text-2xl font-bold leading-tight text-cream">
          {title}
        </h1>
        {subtitle && <p className="truncate text-sm text-cream/60">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
