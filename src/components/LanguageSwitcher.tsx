'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useStore } from '@/lib/store';

const languages = [
  { code: 'en', name: 'EN', displayName: 'English' },
  { code: 'hi', name: 'HI', displayName: 'Hindi' },
  { code: 'te', name: 'TE', displayName: 'Telugu' }
];

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const { setLanguage } = useStore();
  const currentLocale = useLocale();

  const switchLanguage = (newLocale: string) => {
    if (!pathname) {
      return;
    }

    setLanguage(newLocale);
    const pathSegments = pathname.split('/').filter(Boolean);
    const currentPathWithoutLocale =
      pathSegments[0] === currentLocale ? `/${pathSegments.slice(1).join('/')}` : pathname;
    const targetPath =
      currentPathWithoutLocale === '/' || currentPathWithoutLocale === ''
        ? `/${newLocale}`
        : `/${newLocale}${currentPathWithoutLocale}`;

    router.push(targetPath);
  };

  return (
    <div className="flex items-center gap-2">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => switchLanguage(lang.code)}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            currentLocale === lang.code
              ? 'bg-accent text-bg'
              : 'bg-surface2 text-muted hover:bg-surface'
          }`}
          title={lang.displayName}
        >
          {lang.name}
        </button>
      ))}
    </div>
  );
}
