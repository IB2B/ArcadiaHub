'use client';

import { useState, useTransition, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Tables, TablesInsert, TablesUpdate } from '@/types/database.types';
import { createCase, updateCase, addCaseDocument, deleteCaseDocument } from '@/lib/data/admin';
import { uploadFileFromFormData } from '@/lib/services/storage';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import FileUpload from '@/components/ui/FileUpload';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';

type Case = Tables<'cases'>;
type Profile = Tables<'profiles'>;
type CaseDocument = Tables<'case_documents'>;

interface CaseFormProps {
  caseData?: Case & { partner?: Profile };
  partnerOptions: { value: string; label: string }[];
  caseDocuments?: CaseDocument[];
}

interface FormErrors {
  [key: string]: string | undefined;
}

const CASE_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'] as const;

export default function CaseForm({ caseData, partnerOptions, caseDocuments = [] }: CaseFormProps) {
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

  // Attachments state
  const [documents, setDocuments] = useState<CaseDocument[]>(caseDocuments);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocUrl, setNewDocUrl] = useState('');
  const [attachmentMessage, setAttachmentMessage] = useState<string | null>(null);

  const handleFileUpload = useCallback(async (formData: FormData) => {
    const result = await uploadFileFromFormData(formData, 'case-documents', 'file');
    return result;
  }, []);

  const handleFileChange = useCallback((url: string | null, file?: File) => {
    if (url) {
      setNewDocUrl(url);
      if (!newDocTitle && file) {
        setNewDocTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  }, [newDocTitle]);

  const handleAddDocument = async () => {
    if (!caseData?.id || !newDocUrl.trim() || !newDocTitle.trim()) return;
    setAttachmentMessage(null);

    const fileType = newDocUrl.split('.').pop()?.toUpperCase() || '';
    const result = await addCaseDocument(caseData.id, {
      title: newDocTitle,
      file_url: newDocUrl,
      file_type: fileType,
    });

    if (result.success) {
      setDocuments((prev) => [{
        id: crypto.randomUUID(),
        case_id: caseData.id,
        title: newDocTitle,
        file_url: newDocUrl,
        file_type: fileType,
        uploaded_by: null,
        created_at: new Date().toISOString(),
      }, ...prev]);
      setNewDocTitle('');
      setNewDocUrl('');
      setAttachmentMessage(tMessages('createSuccess'));
    } else {
      setAttachmentMessage(result.error || tMessages('error'));
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    const result = await deleteCaseDocument(docId);
    if (result.success) {
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    }
  };

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

        {/* Attachments - only shown when editing */}
        {isEditing && (
          <Card className="lg:col-span-2">
            <CardHeader title={tCases('attachments')} />
            <CardContent className="space-y-4">
              {attachmentMessage && (
                <p className="text-sm text-[var(--primary)]">{attachmentMessage}</p>
              )}

              {/* Existing documents */}
              {documents.length > 0 && (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[var(--card-hover)]">
                      <div className="flex items-center gap-3 min-w-0">
                        <svg className="w-5 h-5 flex-shrink-0 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[var(--text)] truncate">{doc.title}</p>
                          {doc.file_type && (
                            <p className="text-xs text-[var(--text-muted)] uppercase">{doc.file_type}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-[var(--text-light)] hover:text-[var(--primary)] hover:bg-[var(--primary-light)] transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                          </svg>
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="p-1.5 rounded-lg text-[var(--text-light)] hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new attachment */}
              <div className="pt-2 border-t border-[var(--border)]">
                <p className="text-sm font-medium text-[var(--text)] mb-3">{tCases('addAttachment')}</p>
                <div className="space-y-3">
                  <FileUpload
                    label={tCases('attachmentFile')}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.jpg,.jpeg,.png"
                    maxSize={50 * 1024 * 1024}
                    value={newDocUrl}
                    onChange={handleFileChange}
                    uploadAction={handleFileUpload}
                    hint="Upload a file to attach to this case"
                  />
                  <Input
                    label={tCases('attachmentTitle')}
                    value={newDocTitle}
                    onChange={(e) => setNewDocTitle(e.target.value)}
                    placeholder="Document title"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddDocument}
                    disabled={!newDocUrl || !newDocTitle}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    {tCases('addAttachment')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
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
