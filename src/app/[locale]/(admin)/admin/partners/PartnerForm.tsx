'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Tables, TablesInsert, TablesUpdate } from '@/types/database.types';
import { createPartner, updatePartner } from '@/lib/data/admin';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Toggle from '@/components/ui/Toggle';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';

type Profile = Tables<'profiles'>;

interface PartnerFormProps {
  partner?: Profile;
  categories: string[];
}

interface FormErrors {
  [key: string]: string | undefined;
}

export default function PartnerForm({ partner, categories }: PartnerFormProps) {
  const t = useTranslations('admin');
  const tPartners = useTranslations('admin.partners');
  const tForm = useTranslations('admin.form');
  const tMessages = useTranslations('admin.messages');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isEditing = !!partner;

  // Form state
  const [formData, setFormData] = useState({
    company_name: partner?.company_name || '',
    email: partner?.email || '',
    contact_first_name: partner?.contact_first_name || '',
    contact_last_name: partner?.contact_last_name || '',
    phone: partner?.phone || '',
    address: partner?.address || '',
    city: partner?.city || '',
    region: partner?.region || '',
    country: partner?.country || '',
    postal_code: partner?.postal_code || '',
    category: partner?.category || '',
    website: partner?.website || '',
    description: partner?.description || '',
    is_active: partner?.is_active ?? true,
  });

  // Update field
  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = tForm('required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = tForm('invalidEmail');
    }

    if (!formData.company_name.trim()) {
      newErrors.company_name = tForm('required');
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = tForm('invalidUrl');
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
        if (isEditing && partner) {
          const updateData: TablesUpdate<'profiles'> = {
            company_name: formData.company_name || null,
            email: formData.email,
            contact_first_name: formData.contact_first_name || null,
            contact_last_name: formData.contact_last_name || null,
            phone: formData.phone || null,
            address: formData.address || null,
            city: formData.city || null,
            region: formData.region || null,
            country: formData.country || null,
            postal_code: formData.postal_code || null,
            category: formData.category || null,
            website: formData.website || null,
            description: formData.description || null,
            is_active: formData.is_active,
          };

          const result = await updatePartner(partner.id, updateData);
          if (result.success) {
            setMessage({ type: 'success', text: tMessages('updateSuccess') });
          } else {
            setMessage({ type: 'error', text: result.error || tMessages('error') });
          }
        } else {
          // For new partner, we need to generate an ID or handle this differently
          // In a real app, you'd typically create the user through Supabase Auth first
          setMessage({ type: 'error', text: 'New partner creation requires auth user setup. Please use Supabase Auth to create the user first.' });
        }
      } catch {
        setMessage({ type: 'error', text: tMessages('error') });
      }
    });
  };

  // Category options
  const categoryOptions = [
    { value: '', label: tForm('selectOption') },
    ...categories.map((cat) => ({ value: cat, label: cat })),
    // Allow adding new category
    { value: '__new__', label: '+ Add new category' },
  ];

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
          <CardHeader title={tPartners('details')} />
          <CardContent className="space-y-4">
            <Input
              label={tPartners('companyName')}
              value={formData.company_name}
              onChange={(e) => updateField('company_name', e.target.value)}
              error={errors.company_name}
              required
            />
            <Input
              label={tPartners('email')}
              type="email"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              error={errors.email}
              required
              disabled={isEditing} // Can't change email for existing partner
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={formData.contact_first_name}
                onChange={(e) => updateField('contact_first_name', e.target.value)}
              />
              <Input
                label="Last Name"
                value={formData.contact_last_name}
                onChange={(e) => updateField('contact_last_name', e.target.value)}
              />
            </div>
            <Input
              label={tPartners('phone')}
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
            />
            <Select
              label={tPartners('category')}
              options={categoryOptions}
              value={formData.category}
              onChange={(e) => updateField('category', e.target.value === '__new__' ? '' : e.target.value)}
            />
            <Input
              label="Website"
              type="url"
              value={formData.website}
              onChange={(e) => updateField('website', e.target.value)}
              error={errors.website}
              placeholder="https://..."
            />
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader title="Address" />
          <CardContent className="space-y-4">
            <Input
              label="Street Address"
              value={formData.address}
              onChange={(e) => updateField('address', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="City"
                value={formData.city}
                onChange={(e) => updateField('city', e.target.value)}
              />
              <Input
                label="Region/State"
                value={formData.region}
                onChange={(e) => updateField('region', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Country"
                value={formData.country}
                onChange={(e) => updateField('country', e.target.value)}
              />
              <Input
                label="Postal Code"
                value={formData.postal_code}
                onChange={(e) => updateField('postal_code', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card className="lg:col-span-2">
          <CardHeader title="Description" />
          <CardContent>
            <Textarea
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={4}
              placeholder="Partner description..."
            />
          </CardContent>
        </Card>

        {/* Status */}
        <Card className="lg:col-span-2">
          <CardHeader title={tPartners('status')} />
          <CardContent>
            <Toggle
              label={tPartners('active')}
              description="Active partners can log in and access the platform"
              checked={formData.is_active}
              onChange={(e) => updateField('is_active', e.target.checked)}
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
