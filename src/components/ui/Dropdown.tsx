'use client';

import { useState, useRef, useEffect, useId, memo } from 'react';
import { createPortal } from 'react-dom';

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  id?: string;
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-4 py-3 text-base',
};

function Dropdown({
  options,
  value = '',
  onChange,
  label,
  placeholder,
  error,
  hint,
  disabled = false,
  size = 'md',
  className = '',
  id,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const generatedId = useId();
  const inputId = id || generatedId;

  const selectedLabel = options.find((o) => o.value === value)?.label ?? placeholder ?? '';
  const hasValue = value !== '' && value !== undefined;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        ref.current &&
        !ref.current.contains(e.target as Node) &&
        !(e.target as Element)?.closest('[data-dropdown-menu]')
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reposition on scroll/resize while open
  useEffect(() => {
    if (!open) return;
    const update = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setMenuStyle({
          position: 'fixed',
          top: rect.bottom + 4,
          left: rect.left,
          width: rect.width,
          zIndex: 9999,
        });
      }
    };
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open]);

  const handleToggle = () => {
    if (disabled) return;
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    }
    setOpen((prev) => !prev);
  };

  const handleSelect = (optionValue: string) => {
    if (disabled) return;
    onChange?.(optionValue);
    setOpen(false);
  };

  // Check if any visible width class exists in className
  const hasWidthClass = /\bw-\d+\b|\bw-\[|\bw-full\b|\bw-auto\b/.test(className);

  const menu =
    open && typeof document !== 'undefined'
      ? createPortal(
          <div
            data-dropdown-menu
            className="bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg overflow-hidden"
            style={menuStyle}
          >
            <div className="max-h-56 overflow-y-auto">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  disabled={option.disabled}
                  onClick={() => handleSelect(option.value)}
                  className={`
                    w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${option.disabled ? '' : 'hover:bg-[var(--card-hover)]'}
                    ${value === option.value ? 'text-[var(--primary)] font-medium' : 'text-[var(--text)]'}
                  `}
                >
                  {option.label}
                  {value === option.value && (
                    <svg
                      className="w-4 h-4 text-[var(--primary)] flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div className={hasWidthClass ? className : `w-full ${className}`} ref={ref}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-[var(--text)] mb-1.5"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <button
          ref={buttonRef}
          id={inputId}
          type="button"
          disabled={disabled}
          onClick={handleToggle}
          className={`
            w-full flex items-center justify-between rounded-lg border bg-[var(--card)]
            transition-all duration-200 cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent
            disabled:bg-[var(--card-hover)] disabled:cursor-not-allowed disabled:opacity-60
            ${error ? 'border-[var(--error)] focus:ring-[var(--error)]' : 'border-[var(--border)]'}
            ${sizeStyles[size]}
          `}
        >
          <span className={hasValue ? 'text-[var(--text)]' : 'text-[var(--text-light)]'}>
            {selectedLabel || <span className="text-[var(--text-light)]">{placeholder}</span>}
          </span>
          <svg
            className={`w-4 h-4 text-[var(--text-muted)] flex-shrink-0 ml-2 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {menu}
      </div>

      {(error || hint) && (
        <p className={`mt-1.5 text-xs ${error ? 'text-[var(--error)]' : 'text-[var(--text-muted)]'}`}>
          {error || hint}
        </p>
      )}
    </div>
  );
}

export default memo(Dropdown);
