'use client';

import { memo, HTMLAttributes, ReactNode } from 'react';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
type BadgeSize = 'sm' | 'md';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  icon?: ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-[var(--card-hover)] text-[var(--text-secondary)]',
  primary: 'bg-[var(--primary-light)] text-[var(--primary)]',
  success: 'bg-[var(--success-light)] text-[var(--success)]',
  warning: 'bg-[var(--warning-light)] text-[var(--warning)]',
  error: 'bg-[var(--error-light)] text-[var(--error)]',
  info: 'bg-[var(--info-light)] text-[var(--info)]',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs',
  md: 'px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs',
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-[var(--text-muted)]',
  primary: 'bg-[var(--primary)]',
  success: 'bg-[var(--success)]',
  warning: 'bg-[var(--warning)]',
  error: 'bg-[var(--error)]',
  info: 'bg-[var(--info)]',
};

function Badge({
  variant = 'default',
  size = 'md',
  dot = false,
  icon,
  className = '',
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-full
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />
      )}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

export default memo(Badge);
