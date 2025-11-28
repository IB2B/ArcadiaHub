'use client';

import { useState, useMemo } from 'react';
import Card from '@/components/ui/Card';
import PartnerCard from '@/components/community/PartnerCard';
import { Database } from '@/types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface CommunityPageClientProps {
  partners: Profile[];
  totalCount: number;
}

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const icons = {
  search: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  ),
  users: (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  ),
  empty: (
    <svg className="w-12 h-12 sm:w-16 sm:h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  ),
};

export default function CommunityPageClient({ partners, totalCount }: CommunityPageClientProps) {
  const [search, setSearch] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    partners.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats).sort();
  }, [partners]);

  // Filter partners
  const filteredPartners = useMemo(() => {
    return partners.filter((partner) => {
      const name = partner.company_name ||
        `${partner.contact_first_name || ''} ${partner.contact_last_name || ''}`.trim();

      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesName = name.toLowerCase().includes(searchLower);
        const matchesDesc = partner.description?.toLowerCase().includes(searchLower);
        const matchesCity = partner.city?.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesDesc && !matchesCity) return false;
      }

      // Letter filter
      if (selectedLetter) {
        const firstLetter = name.charAt(0).toUpperCase();
        if (firstLetter !== selectedLetter) return false;
      }

      // Category filter
      if (selectedCategory && partner.category !== selectedCategory) {
        return false;
      }

      return true;
    });
  }, [partners, search, selectedLetter, selectedCategory]);

  const clearFilters = () => {
    setSearch('');
    setSelectedLetter(null);
    setSelectedCategory('');
  };

  const hasFilters = search || selectedLetter || selectedCategory;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 rounded-lg bg-[var(--primary-light)] text-[var(--primary)]">
            {icons.users}
          </div>
          <div>
            <h1 className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--text)]">
              Partner Directory
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              {totalCount} registered partner{totalCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        {/* Search and Category */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              {icons.search}
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, description, or city..."
              className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] placeholder:text-[var(--text-light)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            />
          </div>

          {categories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 sm:py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm font-medium text-[var(--primary)] hover:bg-[var(--primary-light)] rounded-lg transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Alphabet Filter */}
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setSelectedLetter(null)}
            className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
              selectedLetter === null
                ? 'bg-[var(--primary)] text-white'
                : 'bg-[var(--card)] text-[var(--text-muted)] hover:bg-[var(--card-hover)]'
            }`}
          >
            All
          </button>
          {alphabet.map((letter) => (
            <button
              key={letter}
              onClick={() => setSelectedLetter(selectedLetter === letter ? null : letter)}
              className={`w-7 h-7 text-xs font-medium rounded transition-colors ${
                selectedLetter === letter
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--card)] text-[var(--text-muted)] hover:bg-[var(--card-hover)]'
              }`}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

      {/* Partners Grid */}
      {filteredPartners.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPartners.map((partner) => (
            <PartnerCard key={partner.id} partner={partner} />
          ))}
        </div>
      ) : (
        <Card>
          <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
            <div className="text-[var(--text-light)] mb-4">
              {icons.empty}
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-[var(--text)] mb-1">
              No partners found
            </h3>
            <p className="text-sm text-[var(--text-muted)] max-w-md">
              {hasFilters
                ? 'Try adjusting your search or filters to find what you\'re looking for.'
                : 'There are no partners in the directory yet.'}
            </p>
          </div>
        </Card>
      )}

      {/* Results count */}
      {filteredPartners.length > 0 && (
        <p className="text-sm text-[var(--text-muted)] text-center">
          Showing {filteredPartners.length} of {partners.length} partners
        </p>
      )}
    </div>
  );
}
