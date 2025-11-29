'use client';

import { forwardRef, memo, TextareaHTMLAttributes, useId } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

const resizeStyles = {
  none: 'resize-none',
  vertical: 'resize-y',
  horizontal: 'resize-x',
  both: 'resize',
};

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      hint,
      resize = 'vertical',
      className = '',
      id,
      disabled,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const textareaId = id || generatedId;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-[var(--text)] mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          rows={rows}
          className={`
            w-full px-4 py-2.5 rounded-lg border bg-[var(--card)]
            text-[var(--text)] text-sm placeholder:text-[var(--text-light)]
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent
            disabled:bg-[var(--card-hover)] disabled:cursor-not-allowed disabled:opacity-60
            ${error ? 'border-[var(--error)] focus:ring-[var(--error)]' : 'border-[var(--border)]'}
            ${resizeStyles[resize]}
            ${className}
          `}
          {...props}
        />
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

Textarea.displayName = 'Textarea';

export default memo(Textarea);
