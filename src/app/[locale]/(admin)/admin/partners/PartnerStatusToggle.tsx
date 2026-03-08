'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/navigation';
import { deactivateSubUser, reactivateSubUser } from '@/lib/data/admin';
import Button from '@/components/ui/Button';

interface PartnerStatusToggleProps {
  userId: string;
  isActive: boolean;
}

export default function PartnerStatusToggle({ userId, isActive }: PartnerStatusToggleProps) {
  const t = useTranslations('subUsers');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleToggle = () => {
    setError(null);
    startTransition(async () => {
      const result = isActive
        ? await deactivateSubUser(userId)
        : await reactivateSubUser(userId);
      if (!result.success) {
        setError(result.error ?? 'Action failed');
      } else {
        router.refresh();
      }
    });
  };

  return (
    <div className="flex items-center gap-3">
      <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${isActive ? 'text-[var(--success)]' : 'text-[var(--text-muted)]'}`}>
        <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-[var(--success)]' : 'bg-[var(--text-muted)]'}`} />
        {isActive ? 'Active' : 'Inactive'}
      </span>
      <Button
        variant={isActive ? 'danger' : 'secondary'}
        size="sm"
        onClick={handleToggle}
        disabled={isPending}
      >
        {isPending ? '...' : isActive ? t('deactivate') : t('reactivate')}
      </Button>
      {error && <span className="text-sm text-[var(--error)]">{error}</span>}
    </div>
  );
}
