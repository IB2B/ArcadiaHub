'use client';

import { memo } from 'react';
import Dropdown from './Dropdown';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
  required?: boolean;
}

// Wrapper around Dropdown that keeps the existing Select API
// (onChange receives a synthetic event so all existing callers work unchanged)
const Select = ({
  options,
  value = '',
  onChange,
  label,
  placeholder,
  error,
  hint,
  size = 'md',
  disabled,
  className,
  id,
}: SelectProps) => {
  const handleChange = (val: string) => {
    onChange?.({ target: { value: val } } as React.ChangeEvent<HTMLSelectElement>);
  };

  return (
    <Dropdown
      options={options}
      value={value}
      onChange={handleChange}
      label={label}
      placeholder={placeholder}
      error={error}
      hint={hint}
      size={size}
      disabled={disabled}
      className={className}
      id={id}
    />
  );
};

Select.displayName = 'Select';

export default memo(Select);
