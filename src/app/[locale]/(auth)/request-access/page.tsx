'use client';

import { useState, useCallback, useTransition, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card, { CardContent } from '@/components/ui/Card';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { submitAccessRequest, uploadAccessRequestFile } from '@/lib/data/accessRequests';

type Step = 'personal' | 'company' | 'success';

interface FormData {
  // Personal
  contact_first_name: string;
  contact_last_name: string;
  contact_phone: string;
  contact_email: string;
  contact_description: string;
  contact_photo: File | null;
  contact_photo_url: string;
  contact_photo_preview: string;
  // Company
  company_name: string;
  legal_address: string;
  operational_address: string;
  business_phone: string;
  generic_email: string;
  pec: string;
  company_description: string;
  company_logo: File | null;
  company_logo_url: string;
  company_logo_preview: string;
}

const initialFormData: FormData = {
  contact_first_name: '',
  contact_last_name: '',
  contact_phone: '',
  contact_email: '',
  contact_description: '',
  contact_photo: null,
  contact_photo_url: '',
  contact_photo_preview: '',
  company_name: '',
  legal_address: '',
  operational_address: '',
  business_phone: '',
  generic_email: '',
  pec: '',
  company_description: '',
  company_logo: null,
  company_logo_url: '',
  company_logo_preview: '',
};

const icons = {
  user: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  building: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
  ),
  check: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
  phone: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  ),
  mail: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  ),
  location: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  ),
  upload: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  ),
  sparkle: (
    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  ),
};

export default function RequestAccessPage() {
  const t = useTranslations('requestAccess');
  const tCommon = useTranslations('common');
  const [step, setStep] = useState<Step>('personal');
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const updateField = useCallback(<K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const validatePersonalStep = useCallback(() => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.contact_first_name.trim()) newErrors.contact_first_name = t('errors.required');
    if (!formData.contact_last_name.trim()) newErrors.contact_last_name = t('errors.required');
    if (!formData.contact_phone.trim()) newErrors.contact_phone = t('errors.required');
    if (!formData.contact_email.trim()) {
      newErrors.contact_email = t('errors.required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = t('errors.invalidEmail');
    }
    if (!formData.contact_description.trim()) newErrors.contact_description = t('errors.required');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, t]);

  const validateCompanyStep = useCallback(() => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.company_name.trim()) newErrors.company_name = t('errors.required');
    if (!formData.legal_address.trim()) newErrors.legal_address = t('errors.required');
    if (!formData.operational_address.trim()) newErrors.operational_address = t('errors.required');
    if (!formData.business_phone.trim()) newErrors.business_phone = t('errors.required');
    if (!formData.generic_email.trim()) {
      newErrors.generic_email = t('errors.required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.generic_email)) {
      newErrors.generic_email = t('errors.invalidEmail');
    }
    if (!formData.pec.trim()) {
      newErrors.pec = t('errors.required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.pec)) {
      newErrors.pec = t('errors.invalidEmail');
    }
    if (!formData.company_description.trim()) newErrors.company_description = t('errors.required');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, t]);

  const handlePhotoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({ ...prev, contact_photo: t('errors.invalidFileType') }));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, contact_photo: t('errors.fileTooLarge') }));
      return;
    }

    // Show local preview immediately
    const previewUrl = URL.createObjectURL(file);
    updateField('contact_photo_preview', previewUrl);
    updateField('contact_photo', file);

    // Upload in background using FormData (File objects can't be passed directly to server actions)
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'photo');
      const result = await uploadAccessRequestFile(formData);
      if (result.success && result.url) {
        updateField('contact_photo_url', result.url);
      } else {
        setErrors((prev) => ({ ...prev, contact_photo: result.error || t('errors.uploadFailed') }));
        // Clear preview on error
        updateField('contact_photo_preview', '');
        updateField('contact_photo', null);
      }
    } catch {
      setErrors((prev) => ({ ...prev, contact_photo: t('errors.uploadFailed') }));
      updateField('contact_photo_preview', '');
      updateField('contact_photo', null);
    } finally {
      setUploadingPhoto(false);
    }
  }, [t, updateField]);

  const handleLogoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({ ...prev, company_logo: t('errors.invalidFileType') }));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, company_logo: t('errors.fileTooLarge') }));
      return;
    }

    // Show local preview immediately
    const previewUrl = URL.createObjectURL(file);
    updateField('company_logo_preview', previewUrl);
    updateField('company_logo', file);

    // Upload in background using FormData (File objects can't be passed directly to server actions)
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'logo');
      const result = await uploadAccessRequestFile(formData);
      if (result.success && result.url) {
        updateField('company_logo_url', result.url);
      } else {
        setErrors((prev) => ({ ...prev, company_logo: result.error || t('errors.uploadFailed') }));
        // Clear preview on error
        updateField('company_logo_preview', '');
        updateField('company_logo', null);
      }
    } catch {
      setErrors((prev) => ({ ...prev, company_logo: t('errors.uploadFailed') }));
      updateField('company_logo_preview', '');
      updateField('company_logo', null);
    } finally {
      setUploadingLogo(false);
    }
  }, [t, updateField]);

  const handleNextStep = useCallback(() => {
    if (step === 'personal' && validatePersonalStep()) {
      setStep('company');
    }
  }, [step, validatePersonalStep]);

  const handlePrevStep = useCallback(() => {
    if (step === 'company') {
      setStep('personal');
    }
  }, [step]);

  const handleSubmit = useCallback(async () => {
    if (!validateCompanyStep()) return;

    setSubmitError(null);

    startTransition(async () => {
      const result = await submitAccessRequest({
        contact_first_name: formData.contact_first_name,
        contact_last_name: formData.contact_last_name,
        contact_phone: formData.contact_phone,
        contact_email: formData.contact_email,
        contact_description: formData.contact_description,
        contact_photo_url: formData.contact_photo_url || undefined,
        company_name: formData.company_name,
        legal_address: formData.legal_address,
        operational_address: formData.operational_address,
        business_phone: formData.business_phone,
        generic_email: formData.generic_email,
        pec: formData.pec,
        company_description: formData.company_description,
        company_logo_url: formData.company_logo_url || undefined,
      });

      if (result.success) {
        setStep('success');
      } else {
        setSubmitError(result.error || t('errors.submitFailed'));
      }
    });
  }, [formData, validateCompanyStep, t]);

  const steps = [
    { key: 'personal', label: t('steps.personal'), icon: icons.user },
    { key: 'company', label: t('steps.company'), icon: icons.building },
  ];

  const currentStepIndex = step === 'personal' ? 0 : step === 'company' ? 1 : 2;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--background)] relative">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-xl">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold gradient-text">{tCommon('appName')}</h1>
          </Link>
        </div>

        {step !== 'success' && (
          <>
            {/* Teaser Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white mb-4">
                {icons.sparkle}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--text)] mb-2">
                {t('title')}
              </h2>
              <p className="text-sm text-[var(--text-muted)]">
                {t('subtitle')}
              </p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-4 mb-6">
              {steps.map((s, index) => (
                <div key={s.key} className="flex items-center">
                  <div
                    className={`
                      flex items-center justify-center w-10 h-10 rounded-full transition-all
                      ${index < currentStepIndex
                        ? 'bg-[var(--success)] text-white'
                        : index === currentStepIndex
                          ? 'bg-[var(--primary)] text-white'
                          : 'bg-[var(--card)] text-[var(--text-muted)] border border-[var(--border)]'
                      }
                    `}
                  >
                    {index < currentStepIndex ? icons.check : s.icon}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-12 h-1 mx-2 rounded-full ${
                        index < currentStepIndex ? 'bg-[var(--success)]' : 'bg-[var(--border)]'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        <Card>
          <CardContent className="p-6">
            {step === 'personal' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
                  {icons.user}
                  {t('personalInfo')}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={t('fields.firstName')}
                    value={formData.contact_first_name}
                    onChange={(e) => updateField('contact_first_name', e.target.value)}
                    error={errors.contact_first_name}
                    required
                    leftIcon={icons.user}
                    placeholder={t('fields.firstNamePlaceholder')}
                  />
                  <Input
                    label={t('fields.lastName')}
                    value={formData.contact_last_name}
                    onChange={(e) => updateField('contact_last_name', e.target.value)}
                    error={errors.contact_last_name}
                    required
                    placeholder={t('fields.lastNamePlaceholder')}
                  />
                </div>

                <Input
                  label={t('fields.phone')}
                  value={formData.contact_phone}
                  onChange={(e) => updateField('contact_phone', e.target.value)}
                  error={errors.contact_phone}
                  required
                  type="tel"
                  leftIcon={icons.phone}
                  placeholder={t('fields.phonePlaceholder')}
                />

                <Input
                  label={t('fields.personalEmail')}
                  value={formData.contact_email}
                  onChange={(e) => updateField('contact_email', e.target.value)}
                  error={errors.contact_email}
                  required
                  type="email"
                  leftIcon={icons.mail}
                  placeholder={t('fields.personalEmailPlaceholder')}
                />

                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
                    {t('fields.description')} <span className="text-[var(--error)]">*</span>
                  </label>
                  <textarea
                    value={formData.contact_description}
                    onChange={(e) => updateField('contact_description', e.target.value)}
                    rows={3}
                    className={`
                      w-full px-4 py-2.5 rounded-lg border transition-colors
                      bg-[var(--card)] text-[var(--text)]
                      ${errors.contact_description
                        ? 'border-[var(--error)] focus:ring-[var(--error)]'
                        : 'border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)]'
                      }
                      focus:outline-none focus:ring-2 focus:ring-opacity-20
                    `}
                    placeholder={t('fields.descriptionPlaceholder')}
                  />
                  {errors.contact_description && (
                    <p className="mt-1 text-sm text-[var(--error)]">{errors.contact_description}</p>
                  )}
                </div>

                {/* Photo Upload */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
                    {t('fields.professionalPhoto')}
                  </label>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className={`
                      w-full p-6 rounded-lg border-2 border-dashed transition-colors
                      flex flex-col items-center justify-center gap-2
                      ${formData.contact_photo_preview
                        ? 'border-[var(--success)] bg-[var(--success)]/5'
                        : 'border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/5'
                      }
                    `}
                  >
                    {formData.contact_photo_preview ? (
                      <>
                        <div className="w-16 h-16 rounded-full overflow-hidden relative">
                          <img
                            src={formData.contact_photo_preview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          {uploadingPhoto && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            </div>
                          )}
                        </div>
                        <span className="text-sm text-[var(--success)]">
                          {uploadingPhoto ? t('fields.uploading') : t('fields.photoUploaded')}
                        </span>
                      </>
                    ) : uploadingPhoto ? (
                      <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <div className="text-[var(--text-muted)]">{icons.upload}</div>
                        <span className="text-sm text-[var(--text-muted)]">{t('fields.uploadPhoto')}</span>
                        <span className="text-xs text-[var(--text-light)]">{t('fields.maxSize')}</span>
                      </>
                    )}
                  </button>
                  {errors.contact_photo && (
                    <p className="mt-1 text-sm text-[var(--error)]">{errors.contact_photo}</p>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleNextStep}>
                    {t('next')}
                    <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Button>
                </div>
              </div>
            )}

            {step === 'company' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
                  {icons.building}
                  {t('companyInfo')}
                </h3>

                <Input
                  label={t('fields.companyName')}
                  value={formData.company_name}
                  onChange={(e) => updateField('company_name', e.target.value)}
                  error={errors.company_name}
                  required
                  leftIcon={icons.building}
                  placeholder={t('fields.companyNamePlaceholder')}
                />

                <Input
                  label={t('fields.legalAddress')}
                  value={formData.legal_address}
                  onChange={(e) => updateField('legal_address', e.target.value)}
                  error={errors.legal_address}
                  required
                  leftIcon={icons.location}
                  placeholder={t('fields.legalAddressPlaceholder')}
                />

                <Input
                  label={t('fields.operationalAddress')}
                  value={formData.operational_address}
                  onChange={(e) => updateField('operational_address', e.target.value)}
                  error={errors.operational_address}
                  required
                  leftIcon={icons.location}
                  placeholder={t('fields.operationalAddressPlaceholder')}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={t('fields.businessPhone')}
                    value={formData.business_phone}
                    onChange={(e) => updateField('business_phone', e.target.value)}
                    error={errors.business_phone}
                    required
                    type="tel"
                    leftIcon={icons.phone}
                    placeholder={t('fields.businessPhonePlaceholder')}
                  />
                  <Input
                    label={t('fields.genericEmail')}
                    value={formData.generic_email}
                    onChange={(e) => updateField('generic_email', e.target.value)}
                    error={errors.generic_email}
                    required
                    type="email"
                    leftIcon={icons.mail}
                    placeholder={t('fields.genericEmailPlaceholder')}
                  />
                </div>

                <Input
                  label={t('fields.pec')}
                  value={formData.pec}
                  onChange={(e) => updateField('pec', e.target.value)}
                  error={errors.pec}
                  required
                  type="email"
                  leftIcon={icons.mail}
                  hint={t('fields.pecHint')}
                  placeholder={t('fields.pecPlaceholder')}
                />

                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
                    {t('fields.companyDescription')} <span className="text-[var(--error)]">*</span>
                  </label>
                  <textarea
                    value={formData.company_description}
                    onChange={(e) => updateField('company_description', e.target.value)}
                    rows={3}
                    className={`
                      w-full px-4 py-2.5 rounded-lg border transition-colors
                      bg-[var(--card)] text-[var(--text)]
                      ${errors.company_description
                        ? 'border-[var(--error)] focus:ring-[var(--error)]'
                        : 'border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)]'
                      }
                      focus:outline-none focus:ring-2 focus:ring-opacity-20
                    `}
                    placeholder={t('fields.companyDescriptionPlaceholder')}
                  />
                  {errors.company_description && (
                    <p className="mt-1 text-sm text-[var(--error)]">{errors.company_description}</p>
                  )}
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
                    {t('fields.companyLogo')}
                  </label>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploadingLogo}
                    className={`
                      w-full p-6 rounded-lg border-2 border-dashed transition-colors
                      flex flex-col items-center justify-center gap-2
                      ${formData.company_logo_preview
                        ? 'border-[var(--success)] bg-[var(--success)]/5'
                        : 'border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/5'
                      }
                    `}
                  >
                    {formData.company_logo_preview ? (
                      <>
                        <div className="w-20 h-16 rounded-lg overflow-hidden bg-white p-2 relative">
                          <img
                            src={formData.company_logo_preview}
                            alt="Logo Preview"
                            className="w-full h-full object-contain"
                          />
                          {uploadingLogo && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            </div>
                          )}
                        </div>
                        <span className="text-sm text-[var(--success)]">
                          {uploadingLogo ? t('fields.uploading') : t('fields.logoUploaded')}
                        </span>
                      </>
                    ) : uploadingLogo ? (
                      <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <div className="text-[var(--text-muted)]">{icons.upload}</div>
                        <span className="text-sm text-[var(--text-muted)]">{t('fields.uploadLogo')}</span>
                        <span className="text-xs text-[var(--text-light)]">{t('fields.maxSize')}</span>
                      </>
                    )}
                  </button>
                  {errors.company_logo && (
                    <p className="mt-1 text-sm text-[var(--error)]">{errors.company_logo}</p>
                  )}
                </div>

                {submitError && (
                  <div className="p-3 rounded-lg bg-[var(--error-light)] text-[var(--error)] text-sm">
                    {submitError}
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={handlePrevStep}>
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                    </svg>
                    {t('back')}
                  </Button>
                  <Button onClick={handleSubmit} isLoading={isPending}>
                    {t('submit')}
                  </Button>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--success)]/10 text-[var(--success)] mb-6">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[var(--text)] mb-2">
                  {t('success.title')}
                </h3>
                <p className="text-[var(--text-muted)] mb-6">
                  {t('success.message')}
                </p>
                <Link href="/login">
                  <Button>
                    {t('success.backToLogin')}
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Back to login */}
        {step !== 'success' && (
          <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
            {t('alreadyHaveAccount')}{' '}
            <Link href="/login" className="text-[var(--primary)] hover:underline font-medium">
              {t('signIn')}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
