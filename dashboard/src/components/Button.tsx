import { motion } from 'framer-motion';
import type { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'outline' | 'primary' | 'ghost';
  loading?: boolean;
  children: ReactNode;
}

export function Button({ variant = 'outline', loading, children, className = '', ...props }: ButtonProps) {
  const baseClasses = variant === 'primary'
    ? 'btn-primary'
    : variant === 'ghost'
    ? 'inline-flex items-center gap-2 px-4 py-2 font-mono text-sm text-muted hover:text-foreground transition-colors'
    : 'btn-outline';

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseClasses} ${loading ? 'opacity-70 cursor-wait' : ''} ${className}`}
      disabled={loading || props.disabled}
      {...(props as any)}
    >
      {loading && <Spinner />}
      {children}
    </motion.button>
  );
}

function Spinner() {
  return (
    <span
      className="inline-block w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"
    />
  );
}
