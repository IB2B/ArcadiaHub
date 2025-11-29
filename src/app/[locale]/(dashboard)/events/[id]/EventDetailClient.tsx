'use client';

import { useTranslations } from 'next-intl';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import AddToCalendarButton from '@/components/events/AddToCalendarButton';
import { Database, Json } from '@/types/database.types';

type Event = Database['public']['Tables']['events']['Row'];

interface EventDetailClientProps {
  event: Event;
}

const eventTypeConfig: Record<string, { variant: 'primary' | 'success' | 'warning' | 'info'; key: string }> = {
  TRAINING: { variant: 'primary', key: 'training' },
  WORKSHOP: { variant: 'success', key: 'workshop' },
  WEBINAR: { variant: 'info', key: 'webinar' },
  PHYSICAL: { variant: 'warning', key: 'physical' },
};

const icons = {
  calendar: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  ),
  clock: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
  location: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  ),
  link: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
    </svg>
  ),
  video: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  ),
  document: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  ),
  download: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  ),
  play: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
    </svg>
  ),
  external: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  ),
};

function formatEventDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatEventTime(startDate: string, endDate?: string | null): string {
  const start = new Date(startDate);
  const startTime = start.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (endDate) {
    const end = new Date(endDate);
    const endTime = end.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${startTime} - ${endTime}`;
  }

  return startTime;
}

function isEventPast(dateString: string): boolean {
  return new Date(dateString) < new Date();
}

interface Attachment {
  name: string;
  url: string;
}

export default function EventDetailClient({ event }: EventDetailClientProps) {
  const t = useTranslations('events');
  const typeConfig = eventTypeConfig[event.event_type] || eventTypeConfig.TRAINING;
  const isPast = isEventPast(event.start_datetime);
  const attachments = (event.attachments as Attachment[] | null) || [];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Event Header */}
      <Card>
        <div className="flex flex-col gap-4">
          {/* Title and Badges */}
          <div className="flex flex-wrap items-start gap-3">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant={typeConfig.variant} size="md">
                  {t(`types.${typeConfig.key}`)}
                </Badge>
                {isPast && (
                  <Badge variant="default" size="md">
                    {t('pastEvent')}
                  </Badge>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--text)]">
                {event.title}
              </h1>
            </div>
            {!isPast && (
              <AddToCalendarButton
                title={event.title}
                description={event.description || ''}
                startDate={event.start_datetime}
                endDate={event.end_datetime || undefined}
                location={event.location || event.meeting_link || ''}
              />
            )}
          </div>

          {/* Event Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            {/* Date */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--card-hover)]">
              <div className="text-[var(--primary)]">{icons.calendar}</div>
              <div>
                <p className="text-[var(--text-muted)] text-xs">{t('date')}</p>
                <p className="font-medium text-[var(--text)]">
                  {formatEventDate(event.start_datetime)}
                </p>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--card-hover)]">
              <div className="text-[var(--primary)]">{icons.clock}</div>
              <div>
                <p className="text-[var(--text-muted)] text-xs">{t('time')}</p>
                <p className="font-medium text-[var(--text)]">
                  {formatEventTime(event.start_datetime, event.end_datetime)}
                </p>
              </div>
            </div>

            {/* Location */}
            {event.location && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--card-hover)]">
                <div className="text-[var(--primary)]">{icons.location}</div>
                <div>
                  <p className="text-[var(--text-muted)] text-xs">{t('location')}</p>
                  <p className="font-medium text-[var(--text)]">
                    {event.location}
                  </p>
                </div>
              </div>
            )}

            {/* Meeting Link */}
            {event.meeting_link && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--card-hover)]">
                <div className="text-[var(--primary)]">{icons.link}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[var(--text-muted)] text-xs">{t('meetingLink')}</p>
                  <a
                    href={event.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[var(--primary)] hover:underline truncate block"
                  >
                    {t('joinMeeting')}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Description and Attachments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Description */}
        <div className="lg:col-span-2">
          <Card padding="none">
            <CardHeader
              title={t('description')}
              className="p-4 border-b border-[var(--border)]"
            />
            <CardContent className="p-4">
              {event.description ? (
                <div className="prose prose-sm max-w-none text-[var(--text-secondary)]">
                  <p className="whitespace-pre-wrap">{event.description}</p>
                </div>
              ) : (
                <p className="text-sm text-[var(--text-muted)]">
                  {t('noDescription')}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Recording */}
          {event.recording_url && (
            <Card padding="none">
              <CardHeader
                title={t('recording')}
                className="p-4 border-b border-[var(--border)]"
              />
              <CardContent className="p-4">
                <a
                  href={event.recording_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-[var(--primary-light)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-colors"
                >
                  <div>{icons.play}</div>
                  <span className="font-medium">{t('watchRecording')}</span>
                  <div className="ml-auto">{icons.external}</div>
                </a>
              </CardContent>
            </Card>
          )}

          {/* Attachments */}
          <Card padding="none">
            <CardHeader
              title={t('attachments')}
              subtitle={t('files', { count: attachments.length })}
              className="p-4 border-b border-[var(--border)]"
            />
            <CardContent className="p-4">
              {attachments.length > 0 ? (
                <div className="space-y-2">
                  {attachments.map((attachment, index) => (
                    <a
                      key={index}
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--card-hover)] transition-colors group"
                    >
                      <div className="flex-shrink-0 text-[var(--text-muted)]">
                        {icons.document}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text)] truncate">
                          {attachment.name}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-[var(--text-light)] group-hover:text-[var(--primary)] transition-colors">
                        {icons.download}
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--text-muted)] text-center py-4">
                  {t('noAttachments')}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
