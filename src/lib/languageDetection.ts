// Auto-detect user's preferred language from browser settings
export const getAutoDetectedLanguage = (): string => {
  if (typeof window === 'undefined') return 'en';

  const browserLang = navigator.language.split('-')[0].toLowerCase();
  const supportedLanguages = ['en', 'hi', 'te', 'ta', 'mr', 'bn'];

  // Check if browser language is supported
  if (supportedLanguages.includes(browserLang)) {
    return browserLang;
  }

  // Fallback to English
  return 'en';
};

// Get list of all supported languages with their enabled status
export const getSupportedLanguages = () => {
  return [
    { code: 'en', label: 'English', enabled: true },
    { code: 'hi', label: 'हिंदी', enabled: true },
    { code: 'te', label: 'తెలుగు', enabled: true },
    { code: 'ta', label: 'தமிழ்', enabled: false },
    { code: 'mr', label: 'मराठी', enabled: false },
    { code: 'bn', label: 'বাংলা', enabled: false }
  ];
};
