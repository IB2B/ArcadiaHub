'use client';

import { useTranslations } from 'next-intl';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import { Database, Json } from '@/types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface PartnerDetailClientProps {
  partner: Profile;
}

const icons = {
  location: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  ),
  email: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  ),
  phone: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
    </svg>
  ),
  globe: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  ),
  external: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  ),
};

interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
}

export default function PartnerDetailClient({ partner }: PartnerDetailClientProps) {
  const t = useTranslations('community');
  const displayName = partner.company_name ||
    `${partner.contact_first_name || ''} ${partner.contact_last_name || ''}`.trim() ||
    t('partner');

  const fullAddress = [
    partner.address,
    partner.city,
    partner.region,
    partner.postal_code,
    partner.country,
  ].filter(Boolean).join(', ');

  const socialLinks = (partner.social_links as SocialLinks | null) || {};

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Partner Header */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          {/* Avatar */}
          <Avatar
            size="xl"
            name={displayName}
            src={partner.logo_url || undefined}
          />

          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-start gap-2 mb-2">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--text)]">
                {displayName}
              </h1>
              {partner.category && (
                <Badge variant="primary" size="md">
                  {partner.category}
                </Badge>
              )}
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {partner.email && (
                <a
                  href={`mailto:${partner.email}`}
                  className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--primary)]"
                >
                  {icons.email}
                  <span className="truncate">{partner.email}</span>
                </a>
              )}
              {partner.phone && (
                <a
                  href={`tel:${partner.phone}`}
                  className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--primary)]"
                >
                  {icons.phone}
                  <span>{partner.phone}</span>
                </a>
              )}
              {partner.website && (
                <a
                  href={partner.website.startsWith('http') ? partner.website : `https://${partner.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--primary)]"
                >
                  {icons.globe}
                  <span className="truncate">{partner.website}</span>
                  {icons.external}
                </a>
              )}
              {fullAddress && (
                <div className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                  {icons.location}
                  <span>{fullAddress}</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {partner.tags && partner.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {partner.tags.map((tag, index) => (
                  <Badge key={index} variant="default" size="md">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Description */}
      {partner.description && (
        <Card padding="none">
          <CardHeader
            title={t('about')}
            className="p-4 border-b border-[var(--border)]"
          />
          <CardContent className="p-4">
            <p className="text-sm sm:text-base text-[var(--text-secondary)] whitespace-pre-wrap">
              {partner.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Social Links */}
      {Object.keys(socialLinks).length > 0 && (
        <Card padding="none">
          <CardHeader
            title={t('socialLinks')}
            className="p-4 border-b border-[var(--border)]"
          />
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3">
              {socialLinks.linkedin && (
                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--card-hover)] rounded-lg text-sm font-medium text-[var(--text)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)] transition-colors"
                >
                  LinkedIn
                  {icons.external}
                </a>
              )}
              {socialLinks.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--card-hover)] rounded-lg text-sm font-medium text-[var(--text)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)] transition-colors"
                >
                  Twitter
                  {icons.external}
                </a>
              )}
              {socialLinks.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--card-hover)] rounded-lg text-sm font-medium text-[var(--text)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)] transition-colors"
                >
                  Facebook
                  {icons.external}
                </a>
              )}
              {socialLinks.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--card-hover)] rounded-lg text-sm font-medium text-[var(--text)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)] transition-colors"
                >
                  Instagram
                  {icons.external}
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
