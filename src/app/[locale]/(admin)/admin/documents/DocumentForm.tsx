'use client';

import { useState, useTransition, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/navigation';
import { Tables, TablesInsert, TablesUpdate } from '@/types/database.types';
import { createDocument, updateDocument } from '@/lib/data/admin';
import { uploadFileFromFormData } from '@/lib/services/storage';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Toggle from '@/components/ui/Toggle';
import FileUpload from '@/components/ui/FileUpload';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';

type Document = Tables<'documents'>;

interface DocumentFormProps {
  documentData?: Document;
}

interface FormErrors {
  [key: string]: string | undefined;
}

const DOCUMENT_CATEGORIES = ['contracts', 'presentations', 'brand_kit', 'marketing', 'guidelines'] as const;

export default function DocumentForm({ documentData }: DocumentFormProps) {
  const t = useTranslations('admin');
  const tDocs = useTranslations('admin.documents');
  const tForm = useTranslations('admin.form');
  const tMessages = useTranslations('admin.messages');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isEditing = !!documentData;

  // Form state
  const [formData, setFormData] = useState({
    title: documentData?.title || '',
    description: documentData?.description || '',
    category: documentData?.category || 'contracts',
    file_url: documentData?.file_url || '',
    file_type: documentData?.file_type || '',
    file_size: documentData?.file_size?.toString() || '',
    folder_path: documentData?.folder_path || '',
    is_published: documentData?.is_published ?? false,
  });

  // Update field
  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = tForm('required');
    }

    if (!formData.category) {
      newErrors.category = tForm('required');
    }

    if (!formData.file_url.trim()) {
      newErrors.file_url = tForm('required');
    } else if (!/^https?:\/\/.+/.test(formData.file_url)) {
      newErrors.file_url = tForm('invalidUrl');
    }

    // Validate file size if provided
    if (formData.file_size) {
      const size = parseInt(formData.file_size, 10);
      if (isNaN(size) || size < 0) {
        newErrors.file_size = 'Invalid file size';
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
        if (isEditing && documentData) {
          const updateData: TablesUpdate<'documents'> = {
            title: formData.title,
            description: formData.description || null,
            category: formData.category,
            file_url: formData.file_url,
            file_type: formData.file_type || null,
            file_size: formData.file_size ? parseInt(formData.file_size, 10) : null,
            folder_path: formData.folder_path || null,
            is_published: formData.is_published,
          };

          const result = await updateDocument(documentData.id, updateData);
          if (result.success) {
            setMessage({ type: 'success', text: tMessages('updateSuccess') });
          } else {
            setMessage({ type: 'error', text: result.error || tMessages('error') });
          }
        } else {
          const insertData: TablesInsert<'documents'> = {
            title: formData.title,
            description: formData.description || null,
            category: formData.category,
            file_url: formData.file_url,
            file_type: formData.file_type || null,
            file_size: formData.file_size ? parseInt(formData.file_size, 10) : null,
            folder_path: formData.folder_path || null,
            is_published: formData.is_published,
          };

          const result = await createDocument(insertData);
          if (result.success) {
            setMessage({ type: 'success', text: tMessages('createSuccess') });
            setTimeout(() => {
              router.push('/admin/documents');
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

  // Category options
  const categoryOptions = DOCUMENT_CATEGORIES.map((cat) => ({
    value: cat,
    label: tDocs(`categories.${cat}`),
  }));

  // File upload handler
  const handleFileUpload = useCallback(async (formData: FormData) => {
    const result = await uploadFileFromFormData(formData, 'documents', 'file');
    return result;
  }, []);

  // Handle file change from FileUpload component
  const handleFileChange = useCallback((url: string | null, file?: File) => {
    if (url) {
      setFormData((prev) => ({
        ...prev,
        file_url: url,
        file_type: file?.name.split('.').pop()?.toUpperCase() || prev.file_type,
        file_size: file?.size?.toString() || prev.file_size,
      }));
      if (errors.file_url) {
        setErrors((prev) => ({ ...prev, file_url: undefined }));
      }
    } else if (!url && !file) {
      // Cleared
      setFormData((prev) => ({
        ...prev,
        file_url: '',
        file_type: '',
        file_size: '',
      }));
    }
  }, [errors.file_url]);

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
        {/* Basic Information */}
        <Card>
          <CardHeader title={tDocs('details')} />
          <CardContent className="space-y-4">
            <Input
              label={tDocs('documentTitle')}
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              error={errors.title}
              required
            />
            <Select
              label={tDocs('category')}
              options={categoryOptions}
              value={formData.category}
              onChange={(e) => updateField('category', e.target.value)}
              error={errors.category}
              required
            />
            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={3}
              placeholder="Document description..."
            />
          </CardContent>
        </Card>

        {/* File Information */}
        <Card>
          <CardHeader title="File Information" />
          <CardContent className="space-y-4">
            <FileUpload
              label="Document File"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
              maxSize={50 * 1024 * 1024}
              value={formData.file_url}
              onChange={handleFileChange}
              uploadAction={handleFileUpload}
              error={errors.file_url}
              hint="Upload PDF, Word, Excel, PowerPoint, or ZIP files"
            />

            {/* Manual URL option */}
            <div className="pt-2 border-t border-[var(--border)]">
              <p className="text-xs text-[var(--text-muted)] mb-2">Or enter URL manually:</p>
              <Input
                label={tDocs('fileUrl')}
                type="url"
                value={formData.file_url}
                onChange={(e) => updateField('file_url', e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label={tDocs('fileType')}
                value={formData.file_type}
                onChange={(e) => updateField('file_type', e.target.value)}
                placeholder="e.g., PDF, DOCX"
              />
              <Input
                label={tDocs('fileSize')}
                type="number"
                value={formData.file_size}
                onChange={(e) => updateField('file_size', e.target.value)}
                error={errors.file_size}
                placeholder="Size in bytes"
                min={0}
              />
            </div>
            <Input
              label="Folder Path"
              value={formData.folder_path}
              onChange={(e) => updateField('folder_path', e.target.value)}
              placeholder="e.g., /contracts/2024"
              hint="Optional path for organization"
            />
          </CardContent>
        </Card>

        {/* Publishing */}
        <Card className="lg:col-span-2">
          <CardHeader title="Publishing" />
          <CardContent>
            <Toggle
              label={tDocs('isPublished')}
              description="Published documents are visible to partners"
              checked={formData.is_published}
              onChange={(e) => updateField('is_published', e.target.checked)}
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
