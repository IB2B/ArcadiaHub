'use client';

import { memo } from 'react';
import { Link } from '@/navigation';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Database } from '@/types/database.types';

type Event = Database['public']['Tables']['events']['Row'];

interface EventCardProps {
  event: Event;
}

const eventTypeConfig: Record<string, { variant: 'primary' | 'success' | 'warning' | 'info'; label: string; icon: React.ReactNode }> = {
  TRAINING: {
    variant: 'primary',
    label: 'Training',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
      </svg>
    ),
  },
  WORKSHOP: {
    variant: 'success',
    label: 'Workshop',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
      </svg>
    ),
  },
  WEBINAR: {
    variant: 'info',
    label: 'Webinar',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
  },
  PHYSICAL: {
    variant: 'warning',
    label: 'In Person',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
      </svg>
    ),
  },
};

const icons = {
  calendar: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  ),
  clock: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
  location: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  ),
  arrow: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  ),
};

function formatEventDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatEventTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function isEventPast(dateString: string): boolean {
  return new Date(dateString) < new Date();
}

function EventCard({ event }: EventCardProps) {
  const typeConfig = eventTypeConfig[event.event_type] || eventTypeConfig.TRAINING;
  const isPast = isEventPast(event.start_datetime);

  return (
    <Link href={`/events/${event.id}`}>
      <Card hover className={`group ${isPast ? 'opacity-60' : ''}`}>
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Date Box */}
          <div className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg flex flex-col items-center justify-center ${isPast ? 'bg-[var(--card-hover)]' : 'bg-[var(--primary-light)]'}`}>
            <span className={`text-xs font-medium uppercase ${isPast ? 'text-[var(--text-muted)]' : 'text-[var(--primary)]'}`}>
              {new Date(event.start_datetime).toLocaleDateString('en-US', { month: 'short' })}
            </span>
            <span className={`text-xl sm:text-2xl font-bold ${isPast ? 'text-[var(--text-muted)]' : 'text-[var(--primary)]'}`}>
              {new Date(event.start_datetime).getDate()}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-semibold text-[var(--text)] line-clamp-2">
                  {event.title}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <Badge variant={typeConfig.variant} size="sm">
                    {typeConfig.label}
                  </Badge>
                  {isPast && (
                    <Badge variant="default" size="sm">
                      Past
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2 sm:mt-3 text-xs sm:text-sm text-[var(--text-muted)]">
              <div className="flex items-center gap-1">
                {icons.clock}
                <span>{formatEventTime(event.start_datetime)}</span>
              </div>
              {(event.location || event.meeting_link) && (
                <div className="flex items-center gap-1">
                  {icons.location}
                  <span className="truncate max-w-[150px]">
                    {event.location || 'Online'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Arrow */}
          <div className="flex-shrink-0 text-[var(--text-light)] group-hover:text-[var(--primary)] transition-colors">
            {icons.arrow}
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default memo(EventCard);
