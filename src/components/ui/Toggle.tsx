'use client';

import { forwardRef, memo, InputHTMLAttributes, useId } from 'react';

interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: {
    track: 'w-8 h-4',
    thumb: 'w-3 h-3',
    translate: 'translate-x-4',
  },
  md: {
    track: 'w-10 h-5',
    thumb: 'w-4 h-4',
    translate: 'translate-x-5',
  },
  lg: {
    track: 'w-12 h-6',
    thumb: 'w-5 h-5',
    translate: 'translate-x-6',
  },
};

const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  (
    {
      label,
      description,
      size = 'md',
      className = '',
      id,
      disabled,
      checked,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const toggleId = id || generatedId;
    const styles = sizeStyles[size];

    return (
      <label
        htmlFor={toggleId}
        className={`
          flex items-start gap-3 cursor-pointer
          ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
          ${className}
        `}
      >
        <div className="relative flex-shrink-0">
          <input
            ref={ref}
            type="checkbox"
            id={toggleId}
            disabled={disabled}
            checked={checked}
            className="sr-only peer"
            {...props}
          />
          <div
            className={`
              ${styles.track} rounded-full transition-colors duration-200
              bg-[var(--border)]
              peer-checked:bg-[var(--primary)]
              peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--primary)] peer-focus-visible:ring-offset-2
              peer-disabled:opacity-60
            `}
          />
          <div
            className={`
              ${styles.thumb} absolute top-0.5 left-0.5
              bg-white rounded-full shadow-sm
              transition-transform duration-200 ease-in-out
              peer-checked:${styles.translate}
            `}
          />
        </div>
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <span className="text-sm font-medium text-[var(--text)]">
                {label}
              </span>
            )}
            {description && (
              <span className="text-xs text-[var(--text-muted)] mt-0.5">
                {description}
              </span>
            )}
          </div>
        )}
      </label>
    );
  }
);

Toggle.displayName = 'Toggle';

export default memo(Toggle);
