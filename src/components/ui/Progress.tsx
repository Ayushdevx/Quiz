import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'accent' | 'tertiary' | 'success' | 'warning' | 'error';
  animated?: boolean;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      value,
      max = 100,
      showValue = false,
      size = 'md',
      color = 'primary',
      animated = true,
      ...props
    },
    ref
  ) => {
    const percentage = (value / max) * 100;
    
    const sizeClasses = {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3',
    };
    
    const colorClasses = {
      primary: 'bg-primary-600',
      accent: 'bg-accent-600',
      tertiary: 'bg-tertiary-600',
      success: 'bg-success-500',
      warning: 'bg-warning-500',
      error: 'bg-error-500',
    };
    
    return (
      <div
        ref={ref}
        className={cn('w-full', className)}
        {...props}
      >
        <div className={cn('w-full bg-gray-200 rounded-full overflow-hidden', sizeClasses[size])}>
          <motion.div
            className={cn('h-full rounded-full', colorClasses[color])}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: animated ? 0.5 : 0, ease: 'easeOut' }}
          />
        </div>
        {showValue && (
          <div className="mt-1 text-xs text-gray-600 text-right">
            {Math.round(percentage)}%
          </div>
        )}
      </div>
    );
  }
);

Progress.displayName = 'Progress';

export default Progress;