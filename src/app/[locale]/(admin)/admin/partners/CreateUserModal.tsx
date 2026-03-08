'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/navigation';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { createSubUser } from '@/lib/data/admin';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserRole: string;
  onCreated?: () => void;
  prefilledCommercialId?: string;
  prefilledRole?: 'PARTNER' | 'COMMERCIAL';
}

export default function CreateUserModal({ isOpen, onClose, currentUserRole, onCreated, prefilledCommercialId, prefilledRole }: CreateUserModalProps) {
  const t = useTranslations('subUsers.modal');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: (prefilledRole ?? 'PARTNER') as 'PARTNER' | 'COMMERCIAL',
  });

  const roleOptions = currentUserRole === 'ADMIN' && !prefilledRole
    ? [
        { value: 'PARTNER', label: 'Partner' },
        { value: 'COMMERCIAL', label: 'Commercial' },
      ]
    : [{ value: 'PARTNER', label: 'Partner' }];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createSubUser({
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        role: form.role,
        assignedCommercialId: prefilledCommercialId,
      });

      if (!result.success) {
        setError(result.error ?? 'Failed to create user');
        return;
      }

      setSuccess(true);
      router.refresh();
      setTimeout(() => {
        setSuccess(false);
        setForm({ email: '', firstName: '', lastName: '', role: prefilledRole ?? 'PARTNER' });
        onCreated?.();
        onClose();
      }, 1500);
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('title')} size="md">
      {success ? (
        <div className="py-8 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <p className="text-[var(--text)] font-medium">{t('success')}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('email')}
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            disabled={isPending}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('firstName')}
              required
              value={form.firstName}
              onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
              disabled={isPending}
            />
            <Input
              label={t('lastName')}
              required
              value={form.lastName}
              onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
              disabled={isPending}
            />
          </div>
          <Select
            label={t('role')}
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as 'PARTNER' | 'COMMERCIAL' }))}
            options={roleOptions}
            disabled={isPending}
          />

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isPending}>
              {isPending ? t('creating') : t('create')}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
