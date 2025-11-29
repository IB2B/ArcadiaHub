import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/navigation';
import { getAdminEvent } from '@/lib/data/admin';
import EventForm from '../EventForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: PageProps) {
  const { id } = await params;
  const t = await getTranslations('admin.events');

  const eventData = await getAdminEvent(id);

  if (!eventData) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start gap-4">
        <Link
          href="/admin/events"
          className="flex items-center justify-center w-10 h-10 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card-hover)] hover:border-[var(--primary)] transition-colors flex-shrink-0 mt-1"
        >
          <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)]">{t('edit')}</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {t('editSubtitle')}: {eventData.title}
          </p>
        </div>
      </div>

      {/* Form */}
      <EventForm eventData={eventData} />
    </div>
  );
}
