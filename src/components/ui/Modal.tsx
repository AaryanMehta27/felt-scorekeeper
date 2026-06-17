import { useEffect } from 'react';
import type { ReactNode } from 'react';

interface ModalProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  /** Sticky footer area, e.g. the primary action button. */
  footer?: ReactNode;
}

/**
 * A bottom-sheet on phones (thumb-reachable), a centered card on larger
 * screens. Locks background scroll and closes on backdrop click or Escape.
 */
export default function Modal({ title, subtitle, onClose, children, footer }: ModalProps) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-black/65 animate-fade-in"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-10 flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-4xl border border-white/10 bg-felt-dark shadow-table animate-sheet-in sm:rounded-4xl"
      >
        <div className="shrink-0 px-6 pt-3">
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-white/15 sm:hidden" />
          <div className="flex items-start justify-between gap-3 pb-3">
            <div>
              <h2 className="font-display text-2xl font-bold leading-tight text-cream">
                {title}
              </h2>
              {subtitle && <p className="mt-0.5 text-sm text-cream/60">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="-mr-1 -mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-2xl leading-none text-cream/60 transition-colors hover:bg-white/10 hover:text-cream"
            >
              ×
            </button>
          </div>
          <div className="gold-rule" />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">{children}</div>

        {footer && (
          <div className="shrink-0 border-t border-white/10 bg-black/20 px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
