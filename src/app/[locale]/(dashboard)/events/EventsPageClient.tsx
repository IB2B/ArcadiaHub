'use client';

import { useState, useMemo, useCallback } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import EventCard from '@/components/events/EventCard';
import { Database } from '@/types/database.types';

type Event = Database['public']['Tables']['events']['Row'];

interface EventsPageClientProps {
  events: Event[];
  stats: {
    total: number;
    upcoming: number;
    thisMonth: number;
  };
}

const eventTypes = [
  { value: '', label: 'All Types' },
  { value: 'TRAINING', label: 'Training' },
  { value: 'WORKSHOP', label: 'Workshop' },
  { value: 'WEBINAR', label: 'Webinar' },
  { value: 'PHYSICAL', label: 'In Person' },
];

const icons = {
  calendar: (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  ),
  upcoming: (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
  month: (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
    </svg>
  ),
  search: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  ),
  list: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  ),
  grid: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
    </svg>
  ),
  empty: (
    <svg className="w-12 h-12 sm:w-16 sm:h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  ),
};

export default function EventsPageClient({ events, stats }: EventsPageClientProps) {
  const [search, setSearch] = useState('');
  const [eventType, setEventType] = useState('');
  const [showUpcoming, setShowUpcoming] = useState(true);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesTitle = event.title.toLowerCase().includes(searchLower);
        const matchesDesc = event.description?.toLowerCase().includes(searchLower);
        if (!matchesTitle && !matchesDesc) return false;
      }

      // Type filter
      if (eventType && event.event_type !== eventType) {
        return false;
      }

      // Upcoming filter
      if (showUpcoming) {
        const eventDate = new Date(event.start_datetime);
        if (eventDate < new Date()) return false;
      }

      return true;
    });
  }, [events, search, eventType, showUpcoming]);

  const statCards = [
    {
      label: 'Total Events',
      value: stats.total,
      icon: icons.calendar,
      color: 'bg-[var(--primary-light)] text-[var(--primary)]',
    },
    {
      label: 'Upcoming',
      value: stats.upcoming,
      icon: icons.upcoming,
      color: 'bg-[var(--success-light)] text-[var(--success)]',
    },
    {
      label: 'This Month',
      value: stats.thisMonth,
      icon: icons.month,
      color: 'bg-[var(--info-light)] text-[var(--info)]',
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:gap-3">
        <h1 className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--text)]">
          Events Calendar
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Browse and register for upcoming events
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
            placeholder="Search events..."
            className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] placeholder:text-[var(--text-light)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
          />
        </div>

        {/* Type Filter */}
        <select
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
          className="px-3 py-2 sm:py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent cursor-pointer"
        >
          {eventTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>

        {/* Upcoming Toggle */}
        <Button
          variant={showUpcoming ? 'primary' : 'outline'}
          size="md"
          onClick={() => setShowUpcoming(!showUpcoming)}
        >
          {showUpcoming ? 'Upcoming Only' : 'All Events'}
        </Button>
      </div>

      {/* Events List */}
      {filteredEvents.length > 0 ? (
        <div className="space-y-3 sm:space-y-4">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <Card>
          <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
            <div className="text-[var(--text-light)] mb-4">
              {icons.empty}
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-[var(--text)] mb-1">
              No events found
            </h3>
            <p className="text-sm text-[var(--text-muted)] max-w-md">
              {search || eventType || showUpcoming
                ? 'Try adjusting your filters to find what you\'re looking for.'
                : 'There are no events scheduled at the moment. Check back soon!'}
            </p>
          </div>
        </Card>
      )}

      {/* Results count */}
      {filteredEvents.length > 0 && (
        <p className="text-sm text-[var(--text-muted)] text-center">
          Showing {filteredEvents.length} of {events.length} events
        </p>
      )}
    </div>
  );
}
