import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils/cn';

const colors = {
  primary: 'border-primary/30 bg-primary/10 text-primary-ink',
  info: 'border-info/30 bg-info/10 text-info-dark',
  success: 'border-success/30 bg-success/10 text-success-dark',
  accent: 'border-accent/30 bg-accent/10 text-accent-dark',
  gold: 'border-gold/30 bg-gold/10 text-gold-dark',
};

export function Chip({
  color = 'info',
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { color?: keyof typeof colors }) {
  return (
    <span
      className={cn('inline-flex rounded-full border px-3 py-1 text-body-sm font-medium', colors[color], className)}
      {...props}
    />
  );
}
