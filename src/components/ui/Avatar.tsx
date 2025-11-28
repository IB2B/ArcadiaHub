'use client';

import { memo, useMemo } from 'react';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  size?: AvatarSize;
  name?: string;
  src?: string | null;
  showStatus?: boolean;
  status?: 'online' | 'offline' | 'busy' | 'away';
  className?: string;
}

const sizeStyles: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

const statusSizes: Record<AvatarSize, string> = {
  xs: 'w-1.5 h-1.5 border',
  sm: 'w-2 h-2 border',
  md: 'w-2.5 h-2.5 border-2',
  lg: 'w-3 h-3 border-2',
  xl: 'w-4 h-4 border-2',
};

const statusColors = {
  online: 'bg-[var(--success)]',
  offline: 'bg-[var(--text-muted)]',
  busy: 'bg-[var(--error)]',
  away: 'bg-[var(--warning)]',
};

// Generate a consistent color based on name
const getColorFromName = (name: string): string => {
  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// Get initials from name
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

function Avatar({
  size = 'md',
  name = '',
  src,
  showStatus = false,
  status = 'offline',
  className = '',
}: AvatarProps) {
  const initials = useMemo(() => getInitials(name), [name]);
  const bgColor = useMemo(() => getColorFromName(name || 'User'), [name]);

  return (
    <div className={`relative inline-flex flex-shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          className={`
            ${sizeStyles[size]}
            rounded-full object-cover
            ring-2 ring-[var(--card)] ring-offset-0
          `}
        />
      ) : (
        <div
          className={`
            ${sizeStyles[size]}
            ${bgColor}
            rounded-full flex items-center justify-center
            text-white font-medium
            ring-2 ring-[var(--card)] ring-offset-0
          `}
        >
          {initials || '?'}
        </div>
      )}
      {showStatus && (
        <span
          className={`
            absolute bottom-0 right-0 rounded-full
            border-[var(--card)]
            ${statusSizes[size]}
            ${statusColors[status]}
          `}
        />
      )}
    </div>
  );
}

export default memo(Avatar);
