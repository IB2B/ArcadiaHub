'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Tables, TablesInsert, TablesUpdate } from '@/types/database.types';
import { createPartner, updatePartner, uploadPartnerLogo } from '@/lib/data/admin';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
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

  // Category dropdown state
  const [categoryList, setCategoryList] = useState<string[]>(categories);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryValue, setNewCategoryValue] = useState('');
  const categoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setCategoryOpen(false);
        setShowNewCategoryInput(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          const insertData: Omit<TablesInsert<'profiles'>, 'id'> = {
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

          const result = await createPartner(insertData);
          if (result.success) {
            setMessage({ type: 'success', text: tMessages('createSuccess') });
            setTimeout(() => router.push('/admin/partners'), 1500);
          } else {
            setMessage({ type: 'error', text: result.error || tMessages('error') });
          }
        }
      } catch {
        setMessage({ type: 'error', text: tMessages('error') });
      }
    });
  };

  const handleSelectCategory = (value: string) => {
    updateField('category', value);
    setCategoryOpen(false);
    setShowNewCategoryInput(false);
  };

  const handleAddNewCategory = () => {
    const trimmed = newCategoryValue.trim();
    if (!trimmed) return;
    if (!categoryList.includes(trimmed)) {
      setCategoryList((prev) => [...prev, trimmed]);
    }
    updateField('category', trimmed);
    setNewCategoryValue('');
    setShowNewCategoryInput(false);
    setCategoryOpen(false);
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
            {/* Custom category dropdown */}
            <div className="w-full" ref={categoryRef}>
              <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
                {tPartners('category')}
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setCategoryOpen(!categoryOpen); setShowNewCategoryInput(false); }}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all duration-200"
                >
                  <span className={formData.category ? 'text-[var(--text)]' : 'text-[var(--text-light)]'}>
                    {formData.category || '—'}
                  </span>
                  <svg className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-200 ${categoryOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {categoryOpen && (
                  <div className="absolute z-20 w-full mt-1 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg overflow-hidden">
                    <div className="max-h-52 overflow-y-auto">
                      {categoryList.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => handleSelectCategory(cat)}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--card-hover)] transition-colors flex items-center justify-between"
                        >
                          <span className={formData.category === cat ? 'text-[var(--primary)] font-medium' : 'text-[var(--text)]'}>
                            {cat}
                          </span>
                          {formData.category === cat && (
                            <svg className="w-4 h-4 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      ))}
                      {categoryList.length === 0 && !showNewCategoryInput && (
                        <p className="px-4 py-3 text-sm text-[var(--text-muted)]">{tPartnersForm('newCategoryPlaceholder')}</p>
                      )}
                    </div>

                    {/* Add new category */}
                    <div className="border-t border-[var(--border)]">
                      {!showNewCategoryInput ? (
                        <button
                          type="button"
                          onClick={() => setShowNewCategoryInput(true)}
                          className="w-full text-left px-4 py-2.5 text-sm text-[var(--primary)] hover:bg-[var(--card-hover)] transition-colors flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                          </svg>
                          {tPartnersForm('addCategory')}
                        </button>
                      ) : (
                        <div className="p-3 flex gap-2">
                          <input
                            autoFocus
                            value={newCategoryValue}
                            onChange={(e) => setNewCategoryValue(e.target.value)}
                            placeholder={tPartnersForm('newCategoryPlaceholder')}
                            className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--text)] placeholder:text-[var(--text-light)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') { e.preventDefault(); handleAddNewCategory(); }
                              if (e.key === 'Escape') { setShowNewCategoryInput(false); setNewCategoryValue(''); }
                            }}
                          />
                          <Button type="button" size="sm" onClick={handleAddNewCategory}>
                            {tPartnersForm('add')}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
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

        {/* Status — only shown when editing; new accounts start inactive until partner sets up password */}
        {isEditing && (
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
