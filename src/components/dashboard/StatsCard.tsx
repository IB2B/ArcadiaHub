'use client';

import { memo, ReactNode } from 'react';
import Card from '@/components/ui/Card';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon?: ReactNode;
  iconBg?: string;
  trend?: ReactNode;
}

const changeColors = {
  increase: 'text-[var(--success)]',
  decrease: 'text-[var(--error)]',
  neutral: 'text-[var(--text-muted)]',
};

function StatsCard({ title, value, change, icon, iconBg = 'bg-[var(--primary-light)]', trend }: StatsCardProps) {
  return (
    <Card hover>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-[var(--text-muted)] truncate">{title}</p>
          <p className="mt-1 sm:mt-2 text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--text)]">{value}</p>
          {change && (
            <div className={`mt-1 sm:mt-2 flex items-center gap-1 text-xs sm:text-sm ${changeColors[change.type]}`}>
              {change.type === 'increase' && (
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
              )}
              {change.type === 'decrease' && (
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                </svg>
              )}
              <span className="font-medium">{Math.abs(change.value)}%</span>
              <span className="text-[var(--text-muted)] hidden xs:inline">vs last month</span>
            </div>
          )}
          {trend && <div className="mt-1 sm:mt-2">{trend}</div>}
        </div>
        {icon && (
          <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${iconBg} flex items-center justify-center text-[var(--primary)]`}>
            <span className="[&>svg]:w-5 [&>svg]:h-5 sm:[&>svg]:w-6 sm:[&>svg]:h-6">
              {icon}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}

export default memo(StatsCard);
