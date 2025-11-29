'use client';

import { memo, ReactNode } from 'react';
import { Link } from '@/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterConfig {
  key: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  width?: string;
}

interface AdminFilterBarProps {
  // Search
  searchValue: string;
  searchPlaceholder?: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;

  // Filters
  filters?: FilterConfig[];

  // Clear
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;

  // New button
  newHref?: string;
  newLabel?: string;
  newIcon?: ReactNode;

  // State
  isLoading?: boolean;

  // Custom content
  extraContent?: ReactNode;
}

const defaultPlusIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const searchIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const clearIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

function AdminFilterBar({
  searchValue,
  searchPlaceholder = 'Search...',
  onSearchChange,
  onSearchSubmit,
  filters = [],
  hasActiveFilters = false,
  onClearFilters,
  newHref,
  newLabel,
  newIcon = defaultPlusIcon,
  isLoading = false,
  extraContent,
}: AdminFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {/* Search Input - fixed width on desktop, full on mobile */}
      <div className="w-full sm:w-auto sm:min-w-[200px] sm:max-w-[280px]">
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit()}
          size="sm"
          leftIcon={searchIcon}
        />
      </div>

      {/* Filter Selects - inline with search on desktop */}
      {filters.map((filter) => (
        <Select
          key={filter.key}
          options={filter.options}
          value={filter.value}
          onChange={(e) => filter.onChange(e.target.value)}
          size="sm"
          className={filter.width || 'w-32'}
        />
      ))}

      {/* Extra Content (toggles, etc.) */}
      {extraContent}

      {/* Clear Button */}
      {hasActiveFilters && onClearFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          disabled={isLoading}
          title="Clear filters"
        >
          {clearIcon}
        </Button>
      )}

      {/* Spacer to push New button to the right */}
      <div className="flex-1" />

      {/* New Item Button */}
      {newHref && (
        <Link href={newHref}>
          <Button size="sm">
            {newIcon}
            {newLabel && <span className="hidden sm:inline ml-1">{newLabel}</span>}
          </Button>
        </Link>
      )}
    </div>
  );
}

export default memo(AdminFilterBar);
