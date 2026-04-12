'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import { getAutoDetectedLanguage } from '@/lib/languageDetection';

/**
 * LanguageDetector - Sets initial language preference from browser settings
 * Does NOT perform any navigation - just updates store
 * Middleware and page-level logic handles locale routing
 */
export default function LanguageDetector() {
  const setLanguage = useStore((state) => state.setLanguage);

  useEffect(() => {
    // Run only once on client mount
    if (typeof window === 'undefined') return;

    const hasAutoDetected = sessionStorage.getItem('app-lang-initialized');
    
    if (!hasAutoDetected) {
      try {
        const detectedLang = getAutoDetectedLanguage();
        // Update store only - no navigation
        setLanguage(detectedLang, false);
        sessionStorage.setItem('app-lang-initialized', 'true');
      } catch (error) {
        // Fail silently if any browser API issue
        console.debug('Language detection skipped');
      }
    }
  }, [setLanguage]);

  return null; // Invisible component
}
