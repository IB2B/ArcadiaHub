'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Database } from '@/types/database.types';

type Event = Database['public']['Tables']['events']['Row'];

interface CalendarViewProps {
  events: Event[];
}

const eventTypeColors: Record<string, string> = {
  TRAINING: 'bg-blue-500',
  WORKSHOP: 'bg-purple-500',
  WEBINAR: 'bg-green-500',
  PHYSICAL: 'bg-orange-500',
};

export default function CalendarView({ events }: CalendarViewProps) {
  const t = useTranslations('events');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = useMemo(() => {
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [calendarStart, calendarEnd]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, Event[]>();
    events.forEach((event) => {
      const dateKey = format(new Date(event.start_datetime), 'yyyy-MM-dd');
      const existing = map.get(dateKey) || [];
      map.set(dateKey, [...existing, event]);
    });
    return map;
  }, [events]);

  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return eventsByDate.get(dateKey) || [];
  }, [selectedDate, eventsByDate]);

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--text)]">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(new Date())}
          >
            {t('today')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
        {/* Week Days Header */}
        <div className="grid grid-cols-7 border-b border-[var(--border)]">
          {weekDays.map((day) => (
            <div
              key={day}
              className="py-2 text-center text-xs font-medium text-[var(--text-muted)] bg-[var(--card-hover)]"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayEvents = eventsByDate.get(dateKey) || [];
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, new Date());
            const isSelected = selectedDate && isSameDay(day, selectedDate);

            return (
              <button
                key={index}
                onClick={() => setSelectedDate(day)}
                className={`
                  relative min-h-[80px] sm:min-h-[100px] p-1 sm:p-2 border-b border-r border-[var(--border)]
                  text-left transition-colors
                  ${!isCurrentMonth ? 'bg-[var(--card-hover)] text-[var(--text-light)]' : 'hover:bg-[var(--card-hover)]'}
                  ${isSelected ? 'bg-[var(--primary-light)] ring-2 ring-[var(--primary)] ring-inset' : ''}
                `}
              >
                <span
                  className={`
                    inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 text-xs sm:text-sm rounded-full
                    ${isToday ? 'bg-[var(--primary)] text-white font-bold' : ''}
                    ${!isToday && isCurrentMonth ? 'text-[var(--text)]' : ''}
                  `}
                >
                  {format(day, 'd')}
                </span>

                {/* Event Dots */}
                {dayEvents.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className={`
                          text-[10px] sm:text-xs px-1 py-0.5 rounded truncate text-white
                          ${eventTypeColors[event.event_type] || 'bg-gray-500'}
                        `}
                        title={event.title}
                      >
                        <span className="hidden sm:inline">{event.title}</span>
                        <span className="sm:hidden">{event.title.substring(0, 3)}...</span>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-[var(--text-muted)] px-1">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Events */}
      {selectedDate && (
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
          <h3 className="font-semibold text-[var(--text)] mb-3">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h3>
          {selectedDateEvents.length > 0 ? (
            <div className="space-y-2">
              {selectedDateEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-[var(--card-hover)] hover:bg-[var(--border)] transition-colors"
                >
                  <div
                    className={`w-1 h-10 rounded-full ${eventTypeColors[event.event_type] || 'bg-gray-500'}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--text)] truncate">
                      {event.title}
                    </p>
                    <p className="text-sm text-[var(--text-muted)]">
                      {format(new Date(event.start_datetime), 'HH:mm')}
                      {event.end_datetime && ` - ${format(new Date(event.end_datetime), 'HH:mm')}`}
                    </p>
                  </div>
                  <Badge variant="default" size="sm">
                    {t(`types.${event.event_type.toLowerCase()}`)}
                  </Badge>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-[var(--text-muted)] text-sm">
              {t('noEventsOnDay')}
            </p>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-[var(--text-muted)]">
        {Object.entries(eventTypeColors).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded ${color}`} />
            <span>{t(`types.${type.toLowerCase()}`)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
