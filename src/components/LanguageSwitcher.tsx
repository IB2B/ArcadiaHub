'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/navigation';
import { useTransition } from 'react';
import Dropdown from '@/components/ui/Dropdown';

const languages = [
  { code: 'en', name: 'EN', flag: 'GB' },
  { code: 'it', name: 'IT', flag: 'IT' },
  { code: 'fr', name: 'FR', flag: 'FR' },
];

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchLocale = (newLocale: string) => {
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  };

  return (
    <Dropdown
      options={languages.map((lang) => ({ value: lang.code, label: lang.name }))}
      value={locale}
      onChange={switchLocale}
      disabled={isPending}
      size="sm"
      className="w-20"
    />
  );
}
