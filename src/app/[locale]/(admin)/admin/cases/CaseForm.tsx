'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/navigation';
import { Tables, TablesInsert, TablesUpdate } from '@/types/database.types';
import { createCase, updateCase } from '@/lib/data/admin';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';

type Case = Tables<'cases'>;
type Profile = Tables<'profiles'>;

interface CaseFormProps {
  caseData?: Case & { partner?: Profile };
  partnerOptions: { value: string; label: string }[];
}

interface FormErrors {
  [key: string]: string | undefined;
}

const CASE_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'] as const;

export default function CaseForm({ caseData, partnerOptions }: CaseFormProps) {
  const t = useTranslations('admin');
  const tCases = useTranslations('admin.cases');
  const tForm = useTranslations('admin.form');
  const tMessages = useTranslations('admin.messages');
  const tStatuses = useTranslations('admin.statuses');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isEditing = !!caseData;

  // Form state
  const [formData, setFormData] = useState({
    case_code: caseData?.case_code || '',
    partner_id: caseData?.partner_id || '',
    client_name: caseData?.client_name || '',
    status: caseData?.status || 'PENDING',
    notes: caseData?.notes || '',
    opened_at: caseData?.opened_at ? caseData.opened_at.split('T')[0] : new Date().toISOString().split('T')[0],
    closed_at: caseData?.closed_at ? caseData.closed_at.split('T')[0] : '',
  });

  // Update field
  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Generate case code
  const generateCaseCode = () => {
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const code = `CASE-${year}-${random}`;
    updateField('case_code', code);
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.case_code.trim()) {
      newErrors.case_code = tForm('required');
    }

    if (!formData.partner_id) {
      newErrors.partner_id = tForm('required');
    }

    if (!formData.client_name.trim()) {
      newErrors.client_name = tForm('required');
    }

    if (!formData.opened_at) {
      newErrors.opened_at = tForm('required');
    }

    // Validate closed_at is after opened_at
    if (formData.closed_at && formData.opened_at) {
      if (new Date(formData.closed_at) < new Date(formData.opened_at)) {
        newErrors.closed_at = tForm('invalidDateRange');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!validate()) return;

    startTransition(async () => {
      try {
        if (isEditing && caseData) {
          const updateData: TablesUpdate<'cases'> = {
            case_code: formData.case_code,
            partner_id: formData.partner_id,
            client_name: formData.client_name,
            status: formData.status,
            notes: formData.notes || null,
            opened_at: formData.opened_at,
            closed_at: formData.closed_at || null,
          };

          const result = await updateCase(caseData.id, updateData, 'Case details updated');
          if (result.success) {
            setMessage({ type: 'success', text: tMessages('updateSuccess') });
          } else {
            setMessage({ type: 'error', text: result.error || tMessages('error') });
          }
        } else {
          const insertData: TablesInsert<'cases'> = {
            case_code: formData.case_code,
            partner_id: formData.partner_id,
            client_name: formData.client_name,
            status: formData.status,
            notes: formData.notes || null,
            opened_at: formData.opened_at,
            closed_at: formData.closed_at || null,
          };

          const result = await createCase(insertData);
          if (result.success) {
            setMessage({ type: 'success', text: tMessages('createSuccess') });
            // Redirect to cases list after successful creation
            setTimeout(() => {
              router.push('/admin/cases');
            }, 1500);
          } else {
            setMessage({ type: 'error', text: result.error || tMessages('error') });
          }
        }
      } catch {
        setMessage({ type: 'error', text: tMessages('error') });
      }
    });
  };

  // Partner options with placeholder
  const partnerSelectOptions = [
    { value: '', label: tForm('selectOption') },
    ...partnerOptions,
  ];

  // Status options
  const statusOptions = CASE_STATUSES.map((s) => ({
    value: s,
    label: tStatuses(s.toLowerCase()),
  }));

  return (
    <form onSubmit={handleSubmit}>
      {/* Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Case Information */}
        <Card>
          <CardHeader title={tCases('details')} />
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  label={tCases('caseCode')}
                  value={formData.case_code}
                  onChange={(e) => updateField('case_code', e.target.value)}
                  error={errors.case_code}
                  required
                  placeholder="CASE-2024-XXXXXX"
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateCaseCode}
                  className="whitespace-nowrap"
                >
                  {tCases('generate')}
                </Button>
              </div>
            </div>
            <Select
              label={tCases('partner')}
              options={partnerSelectOptions}
              value={formData.partner_id}
              onChange={(e) => updateField('partner_id', e.target.value)}
              error={errors.partner_id}
              required
            />
            <Input
              label={tCases('clientName')}
              value={formData.client_name}
              onChange={(e) => updateField('client_name', e.target.value)}
              error={errors.client_name}
              required
            />
            <Select
              label={tCases('status')}
              options={statusOptions}
              value={formData.status}
              onChange={(e) => updateField('status', e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardHeader title={tCases('dates')} />
          <CardContent className="space-y-4">
            <Input
              label={tCases('openedAt')}
              type="date"
              value={formData.opened_at}
              onChange={(e) => updateField('opened_at', e.target.value)}
              error={errors.opened_at}
              required
            />
            <Input
              label={tCases('closedAt')}
              type="date"
              value={formData.closed_at}
              onChange={(e) => updateField('closed_at', e.target.value)}
              error={errors.closed_at}
              hint={tCases('closedAtHint')}
            />
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="lg:col-span-2">
          <CardHeader title={tCases('notes')} />
          <CardContent>
            <Textarea
              value={formData.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              rows={4}
              placeholder={tCases('notesPlaceholder')}
            />
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          {t('actions.cancel')}
        </Button>
        <Button type="submit" isLoading={isPending}>
          {isEditing ? t('actions.update') : t('actions.create')}
        </Button>
      </div>
    </form>
  );
}
