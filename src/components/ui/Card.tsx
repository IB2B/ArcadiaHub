'use client';

import { forwardRef, memo, HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

const paddingStyles = {
  none: '',
  sm: 'p-2.5 sm:p-3',
  md: 'p-3 sm:p-4 md:p-5',
  lg: 'p-4 sm:p-5 md:p-6',
};

const variantStyles = {
  default: 'bg-[var(--card)] border border-[var(--border)]',
  bordered: 'bg-transparent border-2 border-[var(--border)]',
  elevated: 'bg-[var(--card)] shadow-lg',
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      hover = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`
          rounded-xl transition-all duration-200
          ${variantStyles[variant]}
          ${paddingStyles[padding]}
          ${hover ? 'hover:shadow-md hover:border-[var(--primary)] cursor-pointer' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, subtitle, action, className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex items-start justify-between gap-2 sm:gap-4 mb-3 sm:mb-4 ${className}`}
        {...props}
      >
        {(title || subtitle) ? (
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-[var(--text)] truncate">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5 truncate">
                {subtitle}
              </p>
            )}
          </div>
        ) : children}
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div ref={ref} className={`${className}`} {...props}>
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[var(--border)] flex items-center gap-2 sm:gap-3 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

export default memo(Card);
export const MemoizedCardHeader = memo(CardHeader);
export const MemoizedCardContent = memo(CardContent);
export const MemoizedCardFooter = memo(CardFooter);
export { CardHeader, CardContent, CardFooter };
