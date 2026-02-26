'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { format } from 'date-fns';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Database } from '@/types/database.types';

type AcademyContent = Database['public']['Tables']['academy_content']['Row'];

interface AcademyDetailClientProps {
  item: AcademyContent;
  relatedContent: AcademyContent[];
}

const contentTypeConfig: Record<string, { variant: 'primary' | 'success' | 'warning' | 'info' | 'default'; key: string }> = {
  VIDEO: { variant: 'primary', key: 'video' },
  GALLERY: { variant: 'success', key: 'gallery' },
  SLIDES: { variant: 'warning', key: 'slides' },
  PODCAST: { variant: 'info', key: 'podcast' },
  RECORDING: { variant: 'default', key: 'recording' },
};

const icons = {
  download: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  ),
  clock: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  calendar: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  ),
  eye: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  play: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
    </svg>
  ),
};

function formatDuration(minutes: number | null): string {
  if (!minutes) return '';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins} min`;
}

function getYouTubeId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function getVimeoId(url: string): string | null {
  const regex = /(?:vimeo\.com\/)(\d+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export default function AcademyDetailClient({ item, relatedContent }: AcademyDetailClientProps) {
  const t = useTranslations('academy');
  const typeConfig = contentTypeConfig[item.content_type] || contentTypeConfig.VIDEO;

  const renderMedia = () => {
    if (item.content_type === 'VIDEO' || item.content_type === 'RECORDING') {
      if (item.media_url) {
        const youtubeId = getYouTubeId(item.media_url);
        const vimeoId = getVimeoId(item.media_url);

        if (youtubeId) {
          return (
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
                title={item.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          );
        }

        if (vimeoId) {
          return (
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
              <iframe
                src={`https://player.vimeo.com/video/${vimeoId}`}
                title={item.title}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          );
        }

        // Generic video player
        return (
          <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
            <video
              src={item.media_url}
              controls
              className="w-full h-full"
              poster={item.thumbnail_url || undefined}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        );
      }
    }

    if (item.content_type === 'PODCAST' && item.media_url) {
      return (
        <div className="bg-[var(--card)] rounded-xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-lg bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary)]">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text)]">{t('podcast')}</h3>
              {item.duration_minutes && (
                <p className="text-sm text-[var(--text-muted)]">{formatDuration(item.duration_minutes)}</p>
              )}
            </div>
          </div>
          <audio src={item.media_url} controls className="w-full" />
        </div>
      );
    }

    // Gallery or Slides with thumbnail
    if (item.thumbnail_url) {
      return (
        <div className="relative aspect-video rounded-xl overflow-hidden bg-[var(--card-hover)]">
          <img
            src={item.thumbnail_url}
            alt={item.title}
            className="w-full h-full object-cover"
          />
          {item.content_type === 'GALLERY' && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <div className="bg-white/90 rounded-full p-3 text-[var(--text)]">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Fallback
    return (
      <div className="aspect-video rounded-xl bg-[var(--card-hover)] flex items-center justify-center">
        <div className="text-center text-[var(--text-muted)]">
          <svg className="w-16 h-16 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
          </svg>
          <p className="text-sm">{t('noPreview')}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Media & Description - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Media Player */}
          {renderMedia()}

          {/* Title & Description */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant={typeConfig.variant}>
                {t(`types.${typeConfig.key}`)}
              </Badge>
              {item.year && (
                <Badge variant="default">{item.year}</Badge>
              )}
              {item.theme && (
                <Badge variant="default">{item.theme}</Badge>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--text)] mb-4">
              {item.title}
            </h1>

            {item.description && (
              <div className="prose prose-sm max-w-none text-[var(--text-muted)]">
                <p className="whitespace-pre-wrap">{item.description}</p>
              </div>
            )}
          </div>

          {/* Materials Download */}
          {item.materials_url && (
            <Card padding="md">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[var(--success-light,var(--primary-light))] text-[var(--success,var(--primary))]">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-[var(--text)]">{t('supplementaryMaterials')}</p>
                    <p className="text-sm text-[var(--text-muted)]">{t('materialsHint')}</p>
                  </div>
                </div>
                <a href={item.materials_url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                  <Button>
                    {icons.download}
                    <span>{t('downloadMaterials')}</span>
                  </Button>
                </a>
              </div>
            </Card>
          )}

          {/* Download Section */}
          {item.is_downloadable && item.media_url && (
            <Card padding="md">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[var(--primary-light)] text-[var(--primary)]">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-[var(--text)]">{t('downloadMaterials')}</p>
                    <p className="text-sm text-[var(--text-muted)]">{t('downloadHint')}</p>
                  </div>
                </div>
                <a href={item.media_url} download className="flex-shrink-0">
                  <Button>
                    {icons.download}
                    <span>{t('download')}</span>
                  </Button>
                </a>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Info Card */}
          <Card padding="md">
            <h3 className="font-semibold text-[var(--text)] mb-4">{t('details')}</h3>
            <div className="space-y-3">
              {item.duration_minutes && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-[var(--text-muted)]">{icons.clock}</span>
                  <span className="text-[var(--text)]">{formatDuration(item.duration_minutes)}</span>
                </div>
              )}
              {item.created_at && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-[var(--text-muted)]">{icons.calendar}</span>
                  <span className="text-[var(--text)]">{format(new Date(item.created_at), 'PPP')}</span>
                </div>
              )}
              {item.view_count !== null && item.view_count > 0 && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-[var(--text-muted)]">{icons.eye}</span>
                  <span className="text-[var(--text)]">{item.view_count} {t('views')}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Related Content */}
          {relatedContent.length > 0 && (
            <Card padding="md">
              <h3 className="font-semibold text-[var(--text)] mb-4">{t('relatedContent')}</h3>
              <div className="space-y-3">
                {relatedContent.map((related) => {
                  const relatedTypeConfig = contentTypeConfig[related.content_type] || contentTypeConfig.VIDEO;
                  return (
                    <Link
                      key={related.id}
                      href={`/academy/${related.id}`}
                      className="block group"
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden bg-[var(--card-hover)]">
                          {related.thumbnail_url ? (
                            <img
                              src={related.thumbnail_url}
                              alt={related.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--text)] line-clamp-2 group-hover:text-[var(--primary)] transition-colors">
                            {related.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={relatedTypeConfig.variant} size="sm">
                              {t(`types.${relatedTypeConfig.key}`)}
                            </Badge>
                            {related.duration_minutes && (
                              <span className="text-xs text-[var(--text-muted)]">
                                {formatDuration(related.duration_minutes)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
