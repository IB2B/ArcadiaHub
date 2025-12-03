'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Tables, TablesInsert, TablesUpdate } from '@/types/database.types';
import { createPartner, updatePartner, uploadPartnerLogo } from '@/lib/data/admin';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Toggle from '@/components/ui/Toggle';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import FileUpload from '@/components/ui/FileUpload';

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
  const tPartnersForm = useTranslations('admin.partners.form');
  const tForm = useTranslations('admin.form');
  const tMessages = useTranslations('admin.messages');
  const tCommon = useTranslations('common');
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
    logo_url: partner?.logo_url || '',
  });

  // Track if adding new category
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');

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
            logo_url: formData.logo_url || null,
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
    { value: '__new__', label: tPartnersForm('addCategory') },
  ];

  // Handle category change
  const handleCategoryChange = (value: string) => {
    if (value === '__new__') {
      setIsAddingCategory(true);
      setNewCategory('');
    } else {
      setIsAddingCategory(false);
      updateField('category', value);
    }
  };

  // Confirm new category
  const confirmNewCategory = () => {
    if (newCategory.trim()) {
      updateField('category', newCategory.trim());
      setIsAddingCategory(false);
    }
  };

  // Cancel new category
  const cancelNewCategory = () => {
    setIsAddingCategory(false);
    setNewCategory('');
  };

  // Handle logo upload
  const handleLogoUpload = async (formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> => {
    if (partner?.id) {
      formData.append('partnerId', partner.id);
    }
    return uploadPartnerLogo(formData);
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
        {/* Logo & Basic Information */}
        <Card>
          <CardHeader title={tPartners('details')} />
          <CardContent className="space-y-4">
            <FileUpload
              label={tPartnersForm('companyLogo')}
              accept="image/jpeg,image/png,image/webp,image/gif"
              maxSize={5 * 1024 * 1024}
              value={formData.logo_url}
              onChange={(url) => updateField('logo_url', url || '')}
              uploadAction={handleLogoUpload}
              showPreview={true}
              previewType="image"
              hint={tPartnersForm('logoHint')}
            />
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
                label={tPartnersForm('firstName')}
                value={formData.contact_first_name}
                onChange={(e) => updateField('contact_first_name', e.target.value)}
              />
              <Input
                label={tPartnersForm('lastName')}
                value={formData.contact_last_name}
                onChange={(e) => updateField('contact_last_name', e.target.value)}
              />
            </div>
            <Input
              label={tPartners('phone')}
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
            />
            {isAddingCategory ? (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--text)]">
                  {tPartners('category')}
                </label>
                <div className="flex gap-2">
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder={tPartnersForm('newCategoryPlaceholder')}
                    className="flex-1"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        confirmNewCategory();
                      } else if (e.key === 'Escape') {
                        cancelNewCategory();
                      }
                    }}
                  />
                  <Button type="button" size="sm" onClick={confirmNewCategory}>
                    {tPartnersForm('add')}
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={cancelNewCategory}>
                    {tCommon('cancel')}
                  </Button>
                </div>
              </div>
            ) : (
              <Select
                label={tPartners('category')}
                options={categoryOptions}
                value={formData.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
              />
            )}
            <Input
              label={tPartnersForm('website')}
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
          <CardHeader title={tPartnersForm('address')} />
          <CardContent className="space-y-4">
            <Input
              label={tPartnersForm('streetAddress')}
              value={formData.address}
              onChange={(e) => updateField('address', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={tPartnersForm('city')}
                value={formData.city}
                onChange={(e) => updateField('city', e.target.value)}
              />
              <Input
                label={tPartnersForm('region')}
                value={formData.region}
                onChange={(e) => updateField('region', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={tPartnersForm('country')}
                value={formData.country}
                onChange={(e) => updateField('country', e.target.value)}
              />
              <Input
                label={tPartnersForm('postalCode')}
                value={formData.postal_code}
                onChange={(e) => updateField('postal_code', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card className="lg:col-span-2">
          <CardHeader title={tPartnersForm('description')} />
          <CardContent>
            <Textarea
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Status */}
        <Card className="lg:col-span-2">
          <CardHeader title={tPartners('status')} />
          <CardContent>
            <Toggle
              label={tPartners('active')}
              description={tPartnersForm('activeDescription')}
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
