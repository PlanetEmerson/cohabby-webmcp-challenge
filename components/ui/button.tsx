import * as React from 'react';

import { cn } from '@/lib/utils/cn';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
};

const variants = {
  primary: 'bg-primary text-text-primary shadow-sm hover:bg-primary-dark focus-visible:ring-primary',
  secondary: 'bg-info-surface text-info-dark hover:bg-info/15 focus-visible:ring-info',
  outline: 'border-2 border-primary text-primary-ink hover:bg-primary-surface focus-visible:ring-primary',
  ghost: 'text-text-secondary hover:bg-neutral-100 hover:text-text-primary focus-visible:ring-info',
};

const sizes = {
  sm: 'min-h-11 px-3 text-sm',
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-12 px-6 text-button',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-display font-semibold transition-colors duration-causal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-45',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = 'Button';
