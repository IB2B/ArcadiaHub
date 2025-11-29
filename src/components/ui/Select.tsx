'use client';

import { forwardRef, memo, SelectHTMLAttributes, ReactNode, useId } from 'react';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: ReactNode;
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-4 py-3 text-base',
};

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      hint,
      options,
      placeholder,
      size = 'md',
      leftIcon,
      className = '',
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = id || generatedId;

    // Check if a width class is provided in className
    const hasWidthClass = /\bw-\d+\b|\bw-\[|\bw-full\b|\bw-auto\b/.test(className);

    return (
      <div className={hasWidthClass ? className : 'w-full'}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-[var(--text)] mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
              {leftIcon}
            </div>
          )}
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            className={`
              w-full rounded-lg border bg-[var(--card)]
              text-[var(--text)] cursor-pointer
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent
              disabled:bg-[var(--card-hover)] disabled:cursor-not-allowed disabled:opacity-60
              ${error ? 'border-[var(--error)] focus:ring-[var(--error)]' : 'border-[var(--border)]'}
              ${leftIcon ? 'pl-10' : ''}
              ${sizeStyles[size]}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {(error || hint) && (
          <p
            className={`mt-1.5 text-xs ${
              error ? 'text-[var(--error)]' : 'text-[var(--text-muted)]'
            }`}
          >
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default memo(Select);
