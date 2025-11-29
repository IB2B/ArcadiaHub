'use client';

import { memo, ReactNode, createContext, useContext, useState, useCallback } from 'react';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider');
  }
  return context;
}

// Tabs Root
interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
}

function Tabs({ defaultValue, value, onValueChange, children, className = '' }: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);

  const activeTab = value ?? internalValue;

  const setActiveTab = useCallback((id: string) => {
    if (!value) {
      setInternalValue(id);
    }
    onValueChange?.(id);
  }, [value, onValueChange]);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

// Tab List
interface TabListProps {
  children: ReactNode;
  className?: string;
}

function TabList({ children, className = '' }: TabListProps) {
  return (
    <div
      role="tablist"
      className={`
        flex gap-1 p-1 bg-[var(--card-hover)] rounded-lg
        overflow-x-auto scrollbar-hide
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// Tab Trigger
interface TabTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  icon?: ReactNode;
  badge?: string | number;
}

function TabTrigger({ value, children, className = '', disabled = false, icon, badge }: TabTriggerProps) {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-controls={`panel-${value}`}
      disabled={disabled}
      onClick={() => setActiveTab(value)}
      className={`
        flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium rounded-md
        whitespace-nowrap transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${isActive
          ? 'bg-[var(--card)] text-[var(--text)] shadow-sm'
          : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--card)]/50'
        }
        ${className}
      `}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
      {badge !== undefined && (
        <span
          className={`
            ml-1 px-1.5 py-0.5 text-xs font-medium rounded-full
            ${isActive
              ? 'bg-[var(--primary)] text-white'
              : 'bg-[var(--border)] text-[var(--text-muted)]'
            }
          `}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

// Tab Content
interface TabContentProps {
  value: string;
  children: ReactNode;
  className?: string;
  forceMount?: boolean;
}

function TabContent({ value, children, className = '', forceMount = false }: TabContentProps) {
  const { activeTab } = useTabsContext();
  const isActive = activeTab === value;

  if (!isActive && !forceMount) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      id={`panel-${value}`}
      aria-labelledby={`tab-${value}`}
      hidden={!isActive}
      className={`mt-4 ${isActive ? 'animate-in fade-in-0 duration-200' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

// Export all components
export { Tabs, TabList, TabTrigger, TabContent };

export default memo(Tabs);
