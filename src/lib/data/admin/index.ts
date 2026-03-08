// Barrel re-export — keeps all existing imports from '@/lib/data/admin' working.
// Each domain has its own file; import directly from the sub-module for tree-shaking.

export * from './types';
export * from './stats';
export * from './partners';
export * from './cases';
export * from './events';
export * from './academy';
export * from './documents';
export * from './blog';
export * from './accessRequests';
export * from './subUsers';
