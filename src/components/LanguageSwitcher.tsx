'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useStore } from '@/lib/store';
import { useTransition } from 'react';
import { LoaderCircle } from 'lucide-react';

const languages = [
  { code: 'en', name: 'EN', displayName: 'English', enabled: true },
  { code: 'hi', name: 'HI', displayName: 'Hindi', enabled: true },
  { code: 'te', name: 'TE', displayName: 'Telugu', enabled: true }
];

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const { setLanguage } = useStore();
  const currentLocale = useLocale();
  const [isPending, startTransition] = useTransition();

  const switchLanguage = (newLocale: string, enabled: boolean) => {
    if (!enabled || isPending) {
      return;
    }
    if (!pathname) {
      return;
    }

    startTransition(() => {
      setLanguage(newLocale);
      const pathSegments = pathname.split('/').filter(Boolean);
      const currentPathWithoutLocale =
        pathSegments[0] === currentLocale ? `/${pathSegments.slice(1).join('/')}` : pathname;
      const targetPath =
        currentPathWithoutLocale === '/' || currentPathWithoutLocale === ''
          ? `/${newLocale}`
          : `/${newLocale}${currentPathWithoutLocale}`;

      router.push(targetPath);
    });
  };

  return (
    <div className="flex items-center gap-2">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => switchLanguage(lang.code, lang.enabled)}
          disabled={!lang.enabled || isPending}
          aria-label={
            lang.enabled
              ? `Switch language to ${lang.displayName}`
              : `${lang.displayName} is coming soon`
          }
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors border min-h-[44px] ${
            currentLocale === lang.code
              ? 'bg-accent text-bg border-accent'
              : lang.enabled
                ? 'bg-surface2 text-muted hover:bg-surface border-border'
                : 'bg-surface/60 text-muted border-border/70 cursor-not-allowed'
          }`}
          title={lang.enabled ? lang.displayName : `${lang.displayName} - Coming soon`}
        >
          <span className="inline-flex items-center gap-1">
            {isPending && currentLocale !== lang.code && lang.enabled ? (
              <LoaderCircle size={12} className="animate-spin" aria-hidden="true" />
            ) : null}
            {lang.name}
          </span>
        </button>
      ))}
    </div>
  );
}
