import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', disabled, ...props }, ref) => {
    return (
      <button
        className={cn(
          'px-4 py-2 rounded-md text-sm font-medium transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variant === 'default' && 'bg-blue-500 text-white hover:bg-blue-600',
          variant === 'outline' && 'border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800',
          className
        )}
        disabled={disabled}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button'; 
