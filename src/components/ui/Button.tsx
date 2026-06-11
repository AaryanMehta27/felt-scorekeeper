import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  children: ReactNode;
}

const base =
  'inline-flex select-none items-center justify-center gap-2 rounded-2xl font-semibold ' +
  'transition-transform duration-100 touch-manipulation active:scale-[0.97] ' +
  'disabled:pointer-events-none disabled:opacity-40 ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-0';

const variants: Record<Variant, string> = {
  primary:
    'bg-gradient-to-b from-gold-light to-gold text-felt-deep shadow-gold border border-gold-light/60',
  secondary: 'bg-white/10 text-cream border border-white/15 hover:bg-white/[0.14]',
  ghost: 'bg-transparent text-cream/90 border border-white/10 hover:bg-white/5',
  danger: 'bg-rose-600/90 text-white border border-rose-300/30 hover:bg-rose-600',
};

const sizes: Record<Size, string> = {
  md: 'min-h-[3rem] px-5 text-base',
  lg: 'min-h-[3.5rem] px-6 text-lg',
};

export default function Button({
  variant = 'secondary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
