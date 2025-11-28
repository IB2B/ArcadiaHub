'use client';

import { memo } from 'react';
import { Link } from '@/navigation';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import { Database } from '@/types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface PartnerCardProps {
  partner: Profile;
}

const icons = {
  location: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  ),
  email: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  ),
  phone: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
    </svg>
  ),
  globe: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  ),
  arrow: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  ),
};

function PartnerCard({ partner }: PartnerCardProps) {
  const displayName = partner.company_name ||
    `${partner.contact_first_name || ''} ${partner.contact_last_name || ''}`.trim() ||
    'Partner';

  const location = [partner.city, partner.region, partner.country]
    .filter(Boolean)
    .join(', ');

  return (
    <Link href={`/community/${partner.id}`}>
      <Card hover className="group h-full">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start gap-3 sm:gap-4">
            <Avatar
              size="lg"
              name={displayName}
              src={partner.logo_url || undefined}
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-semibold text-[var(--text)] truncate">
                {displayName}
              </h3>
              {partner.category && (
                <Badge variant="primary" size="sm" className="mt-1">
                  {partner.category}
                </Badge>
              )}
            </div>
            <div className="flex-shrink-0 text-[var(--text-light)] group-hover:text-[var(--primary)] transition-colors">
              {icons.arrow}
            </div>
          </div>

          {/* Description */}
          {partner.description && (
            <p className="mt-3 text-sm text-[var(--text-secondary)] line-clamp-2">
              {partner.description}
            </p>
          )}

          {/* Meta */}
          <div className="mt-auto pt-3 space-y-1.5">
            {location && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-[var(--text-muted)]">
                {icons.location}
                <span className="truncate">{location}</span>
              </div>
            )}
            {partner.email && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-[var(--text-muted)]">
                {icons.email}
                <span className="truncate">{partner.email}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {partner.tags && partner.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-[var(--border)]">
              {partner.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="default" size="sm">
                  {tag}
                </Badge>
              ))}
              {partner.tags.length > 3 && (
                <Badge variant="default" size="sm">
                  +{partner.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}

export default memo(PartnerCard);
