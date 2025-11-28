'use client';

import { useState } from 'react';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import { Database } from '@/types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface ProfilePageClientProps {
  profile: Profile;
}

const icons = {
  edit: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
  ),
  user: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  ),
  building: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
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
  location: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  ),
  globe: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  ),
  key: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
    </svg>
  ),
};

export default function ProfilePageClient({ profile }: ProfilePageClientProps) {
  const [isEditing, setIsEditing] = useState(false);

  const displayName = profile.company_name ||
    `${profile.contact_first_name || ''} ${profile.contact_last_name || ''}`.trim() ||
    'Partner';

  const fullAddress = [
    profile.address,
    profile.city,
    profile.region,
    profile.postal_code,
    profile.country,
  ].filter(Boolean).join(', ');

  const roleLabel = {
    PARTNER: 'Partner',
    COMMERCIAL: 'Harlock Commercial',
    ADMIN: 'Administrator',
  }[profile.role] || profile.role;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--text)]">
          My Profile
        </h1>
        <Button
          variant={isEditing ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
        >
          {icons.edit}
          <span className="ml-1.5">{isEditing ? 'Save' : 'Edit'}</span>
        </Button>
      </div>

      {/* Profile Header Card */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-2">
            <Avatar
              size="xl"
              name={displayName}
              src={profile.logo_url || undefined}
            />
            {isEditing && (
              <Button variant="ghost" size="sm">
                Change Logo
              </Button>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-start gap-2 mb-2">
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--text)]">
                {displayName}
              </h2>
              <Badge variant="primary" size="md">
                {roleLabel}
              </Badge>
              {profile.category && (
                <Badge variant="default" size="md">
                  {profile.category}
                </Badge>
              )}
            </div>

            {profile.description && (
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                {profile.description}
              </p>
            )}

            {/* Tags */}
            {profile.tags && profile.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {profile.tags.map((tag, index) => (
                  <Badge key={index} variant="default" size="sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Contact Information */}
        <Card padding="none">
          <CardHeader
            title="Contact Information"
            className="p-4 border-b border-[var(--border)]"
          />
          <CardContent className="p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="text-[var(--text-muted)]">{icons.user}</div>
              <div>
                <p className="text-xs text-[var(--text-muted)]">Contact Person</p>
                <p className="text-sm font-medium text-[var(--text)]">
                  {`${profile.contact_first_name || ''} ${profile.contact_last_name || ''}`.trim() || '-'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="text-[var(--text-muted)]">{icons.email}</div>
              <div>
                <p className="text-xs text-[var(--text-muted)]">Email</p>
                <p className="text-sm font-medium text-[var(--text)]">
                  {profile.email}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="text-[var(--text-muted)]">{icons.phone}</div>
              <div>
                <p className="text-xs text-[var(--text-muted)]">Phone</p>
                <p className="text-sm font-medium text-[var(--text)]">
                  {profile.phone || '-'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="text-[var(--text-muted)]">{icons.globe}</div>
              <div>
                <p className="text-xs text-[var(--text-muted)]">Website</p>
                {profile.website ? (
                  <a
                    href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-[var(--primary)] hover:underline"
                  >
                    {profile.website}
                  </a>
                ) : (
                  <p className="text-sm font-medium text-[var(--text)]">-</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card padding="none">
          <CardHeader
            title="Address"
            className="p-4 border-b border-[var(--border)]"
          />
          <CardContent className="p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="text-[var(--text-muted)]">{icons.building}</div>
              <div>
                <p className="text-xs text-[var(--text-muted)]">Company Name</p>
                <p className="text-sm font-medium text-[var(--text)]">
                  {profile.company_name || '-'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="text-[var(--text-muted)]">{icons.location}</div>
              <div>
                <p className="text-xs text-[var(--text-muted)]">Full Address</p>
                <p className="text-sm font-medium text-[var(--text)]">
                  {fullAddress || '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security */}
      <Card padding="none">
        <CardHeader
          title="Security"
          className="p-4 border-b border-[var(--border)]"
        />
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-[var(--text-muted)]">{icons.key}</div>
              <div>
                <p className="text-sm font-medium text-[var(--text)]">Password</p>
                <p className="text-xs text-[var(--text-muted)]">
                  Last changed: Unknown
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
