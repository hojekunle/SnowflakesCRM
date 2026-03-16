import React from 'react';
import { cn } from '../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-[11px] uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark font-medium ml-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-2.5 rounded-lg bg-black/5 dark:bg-white/5 border border-transparent focus:border-accent/30 focus:bg-white dark:focus:bg-black/20 outline-none transition-all duration-200 text-sm placeholder:text-text-secondary-light/50 dark:placeholder:text-text-secondary-dark/50',
            error && 'border-red-500/50',
            className
          )}
          {...props}
        />
        {error && <p className="text-[10px] text-red-500 ml-1">{error}</p>}
      </div>
    );
  }
);
