'use client';

import { useState, useMemo } from 'react';
import { Link } from '@/navigation';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Database } from '@/types/database.types';

type AcademyContent = Database['public']['Tables']['academy_content']['Row'];

interface AcademyPageClientProps {
  content: AcademyContent[];
  stats: {
    totalContent: number;
    totalVideos: number;
    totalDuration: number;
  };
}

const contentTypeConfig: Record<string, { variant: 'primary' | 'success' | 'warning' | 'info' | 'default'; label: string; icon: React.ReactNode }> = {
  VIDEO: {
    variant: 'primary',
    label: 'Video',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
  },
  GALLERY: {
    variant: 'success',
    label: 'Gallery',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
      </svg>
    ),
  },
  SLIDES: {
    variant: 'warning',
    label: 'Slides',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
  },
  PODCAST: {
    variant: 'info',
    label: 'Podcast',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
      </svg>
    ),
  },
  RECORDING: {
    variant: 'default',
    label: 'Recording',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z" />
      </svg>
    ),
  },
};

const icons = {
  search: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  ),
  play: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
    </svg>
  ),
  clock: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
  academic: (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
    </svg>
  ),
  video: (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  ),
  time: (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
  empty: (
    <svg className="w-12 h-12 sm:w-16 sm:h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
    </svg>
  ),
};

const contentTypes = [
  { value: '', label: 'All Types' },
  { value: 'VIDEO', label: 'Videos' },
  { value: 'GALLERY', label: 'Galleries' },
  { value: 'SLIDES', label: 'Slides' },
  { value: 'PODCAST', label: 'Podcasts' },
  { value: 'RECORDING', label: 'Recordings' },
];

function formatDuration(minutes: number | null): string {
  if (!minutes) return '';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

export default function AcademyPageClient({ content, stats }: AcademyPageClientProps) {
  const [search, setSearch] = useState('');
  const [contentType, setContentType] = useState('');

  // Get unique years
  const years = useMemo(() => {
    const yearsSet = new Set<number>();
    content.forEach((c) => {
      if (c.year) yearsSet.add(c.year);
    });
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [content]);

  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  // Filter content
  const filteredContent = useMemo(() => {
    return content.filter((item) => {
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(searchLower);
        const matchesDesc = item.description?.toLowerCase().includes(searchLower);
        if (!matchesTitle && !matchesDesc) return false;
      }

      if (contentType && item.content_type !== contentType) return false;
      if (selectedYear && item.year !== selectedYear) return false;

      return true;
    });
  }, [content, search, contentType, selectedYear]);

  const statCards = [
    {
      label: 'Total Content',
      value: stats.totalContent,
      icon: icons.academic,
      color: 'bg-[var(--primary-light)] text-[var(--primary)]',
    },
    {
      label: 'Videos',
      value: stats.totalVideos,
      icon: icons.video,
      color: 'bg-[var(--success-light)] text-[var(--success)]',
    },
    {
      label: 'Total Duration',
      value: `${Math.round(stats.totalDuration / 60)}h`,
      icon: icons.time,
      color: 'bg-[var(--info-light)] text-[var(--info)]',
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:gap-3">
        <h1 className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--text)]">
          Academy
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Explore training materials, videos, and resources
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} padding="sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`p-2 sm:p-2.5 rounded-lg ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--text)]">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                  {stat.label}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            {icons.search}
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search content..."
            className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] placeholder:text-[var(--text-light)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
          />
        </div>

        {/* Type Filter */}
        <select
          value={contentType}
          onChange={(e) => setContentType(e.target.value)}
          className="px-3 py-2 sm:py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent cursor-pointer"
        >
          {contentTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>

        {/* Year Filter */}
        {years.length > 0 && (
          <select
            value={selectedYear || ''}
            onChange={(e) => setSelectedYear(e.target.value ? Number(e.target.value) : null)}
            className="px-3 py-2 sm:py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent cursor-pointer"
          >
            <option value="">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Content Grid */}
      {filteredContent.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContent.map((item) => {
            const typeConfig = contentTypeConfig[item.content_type] || contentTypeConfig.VIDEO;
            return (
              <Link key={item.id} href={`/academy/${item.id}`}>
                <Card hover className="group h-full">
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-[var(--card-hover)] rounded-lg mb-3 overflow-hidden">
                    {item.thumbnail_url ? (
                      <img
                        src={item.thumbnail_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                        {typeConfig.icon}
                      </div>
                    )}
                    {/* Play overlay for videos */}
                    {item.content_type === 'VIDEO' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center text-[var(--primary)]">
                          {icons.play}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={typeConfig.variant} size="sm">
                      {typeConfig.label}
                    </Badge>
                    {item.year && (
                      <Badge variant="default" size="sm">
                        {item.year}
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-sm sm:text-base font-semibold text-[var(--text)] line-clamp-2 mb-1">
                    {item.title}
                  </h3>

                  {item.description && (
                    <p className="text-xs sm:text-sm text-[var(--text-muted)] line-clamp-2 mb-2">
                      {item.description}
                    </p>
                  )}

                  {item.duration_minutes && (
                    <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                      {icons.clock}
                      <span>{formatDuration(item.duration_minutes)}</span>
                    </div>
                  )}
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <Card>
          <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
            <div className="text-[var(--text-light)] mb-4">
              {icons.empty}
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-[var(--text)] mb-1">
              No content found
            </h3>
            <p className="text-sm text-[var(--text-muted)] max-w-md">
              {search || contentType || selectedYear
                ? 'Try adjusting your filters to find what you\'re looking for.'
                : 'There is no academy content available yet. Check back soon!'}
            </p>
          </div>
        </Card>
      )}

      {/* Results count */}
      {filteredContent.length > 0 && (
        <p className="text-sm text-[var(--text-muted)] text-center">
          Showing {filteredContent.length} of {content.length} items
        </p>
      )}
    </div>
  );
}
