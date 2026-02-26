'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Tables, TablesInsert, TablesUpdate } from '@/types/database.types';
import { createAcademyContent, updateAcademyContent } from '@/lib/data/admin';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Toggle from '@/components/ui/Toggle';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';

type AcademyContent = Tables<'academy_content'>;

interface AcademyFormProps {
  contentData?: AcademyContent;
}

interface FormErrors {
  [key: string]: string | undefined;
}

const CONTENT_TYPES = ['video', 'gallery', 'slides', 'podcast', 'recording'] as const;

export default function AcademyForm({ contentData }: AcademyFormProps) {
  const t = useTranslations('admin');
  const tAcademy = useTranslations('admin.academy');
  const tForm = useTranslations('admin.form');
  const tMessages = useTranslations('admin.messages');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isEditing = !!contentData;

  // Form state
  const [formData, setFormData] = useState({
    title: contentData?.title || '',
    description: contentData?.description || '',
    content_type: contentData?.content_type || 'video',
    thumbnail_url: contentData?.thumbnail_url || '',
    media_url: contentData?.media_url || '',
    materials_url: contentData?.materials_url || '',
    year: contentData?.year?.toString() || new Date().getFullYear().toString(),
    theme: contentData?.theme || '',
    duration_minutes: contentData?.duration_minutes?.toString() || '',
    is_downloadable: contentData?.is_downloadable ?? false,
    is_published: contentData?.is_published ?? false,
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

    if (!formData.content_type) {
      newErrors.content_type = tForm('required');
    }

    // Validate URLs if provided
    if (formData.media_url && !/^https?:\/\/.+/.test(formData.media_url)) {
      newErrors.media_url = tForm('invalidUrl');
    }

    if (formData.thumbnail_url && !/^https?:\/\/.+/.test(formData.thumbnail_url)) {
      newErrors.thumbnail_url = tForm('invalidUrl');
    }

    if (formData.materials_url && !/^https?:\/\/.+/.test(formData.materials_url)) {
      newErrors.materials_url = tForm('invalidUrl');
    }

    // Validate year
    if (formData.year) {
      const yearNum = parseInt(formData.year, 10);
      if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
        newErrors.year = 'Invalid year';
      }
    }

    // Validate duration
    if (formData.duration_minutes) {
      const duration = parseInt(formData.duration_minutes, 10);
      if (isNaN(duration) || duration < 0) {
        newErrors.duration_minutes = 'Invalid duration';
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
        if (isEditing && contentData) {
          const updateData: TablesUpdate<'academy_content'> = {
            title: formData.title,
            description: formData.description || null,
            content_type: formData.content_type,
            thumbnail_url: formData.thumbnail_url || null,
            media_url: formData.media_url || null,
            materials_url: formData.materials_url || null,
            year: formData.year ? parseInt(formData.year, 10) : null,
            theme: formData.theme || null,
            duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes, 10) : null,
            is_downloadable: formData.is_downloadable,
            is_published: formData.is_published,
          };

          const result = await updateAcademyContent(contentData.id, updateData);
          if (result.success) {
            setMessage({ type: 'success', text: tMessages('updateSuccess') });
          } else {
            setMessage({ type: 'error', text: result.error || tMessages('error') });
          }
        } else {
          const insertData: TablesInsert<'academy_content'> = {
            title: formData.title,
            description: formData.description || null,
            content_type: formData.content_type,
            thumbnail_url: formData.thumbnail_url || null,
            media_url: formData.media_url || null,
            materials_url: formData.materials_url || null,
            year: formData.year ? parseInt(formData.year, 10) : null,
            theme: formData.theme || null,
            duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes, 10) : null,
            is_downloadable: formData.is_downloadable,
            is_published: formData.is_published,
          };

          const result = await createAcademyContent(insertData);
          if (result.success) {
            setMessage({ type: 'success', text: tMessages('createSuccess') });
            setTimeout(() => {
              router.push('/admin/academy');
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

  // Content type options
  const contentTypeOptions = CONTENT_TYPES.map((type) => ({
    value: type,
    label: tAcademy(`types.${type}`),
  }));

  // Year options
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => ({
    value: (currentYear - i).toString(),
    label: (currentYear - i).toString(),
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
        {/* Basic Information */}
        <Card>
          <CardHeader title={tAcademy('details')} />
          <CardContent className="space-y-4">
            <Input
              label={tAcademy('contentTitle')}
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              error={errors.title}
              required
            />
            <Select
              label={tAcademy('contentType')}
              options={contentTypeOptions}
              value={formData.content_type}
              onChange={(e) => updateField('content_type', e.target.value)}
              error={errors.content_type}
              required
            />
            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={4}
              placeholder="Content description..."
            />
          </CardContent>
        </Card>

        {/* Media & Metadata */}
        <Card>
          <CardHeader title="Media & Metadata" />
          <CardContent className="space-y-4">
            <Input
              label={tAcademy('mediaUrl')}
              type="url"
              value={formData.media_url}
              onChange={(e) => updateField('media_url', e.target.value)}
              error={errors.media_url}
              placeholder="https://..."
              hint="URL to video, audio, or gallery"
            />
            <Input
              label={tAcademy('thumbnailUrl')}
              type="url"
              value={formData.thumbnail_url}
              onChange={(e) => updateField('thumbnail_url', e.target.value)}
              error={errors.thumbnail_url}
              placeholder="https://..."
              hint="Preview image URL"
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label={tAcademy('year')}
                options={yearOptions}
                value={formData.year}
                onChange={(e) => updateField('year', e.target.value)}
              />
              <Input
                label={tAcademy('duration')}
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => updateField('duration_minutes', e.target.value)}
                error={errors.duration_minutes}
                placeholder="Minutes"
                min={0}
              />
            </div>
            <Input
              label={tAcademy('theme')}
              value={formData.theme}
              onChange={(e) => updateField('theme', e.target.value)}
              placeholder="e.g., Marketing, Sales, Product"
            />
            <Input
              label={tAcademy('materialsUrl')}
              type="url"
              value={formData.materials_url}
              onChange={(e) => updateField('materials_url', e.target.value)}
              error={errors.materials_url}
              placeholder="https://..."
              hint="Link to supplementary documents (PDF, slides, etc.)"
            />
          </CardContent>
        </Card>

        {/* Settings */}
        <Card className="lg:col-span-2">
          <CardHeader title="Settings" />
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Toggle
                label={tAcademy('isDownloadable')}
                description="Allow partners to download this content"
                checked={formData.is_downloadable}
                onChange={(e) => updateField('is_downloadable', e.target.checked)}
              />
              <Toggle
                label={tAcademy('isPublished')}
                description="Published content is visible to partners"
                checked={formData.is_published}
                onChange={(e) => updateField('is_published', e.target.checked)}
              />
            </div>
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
