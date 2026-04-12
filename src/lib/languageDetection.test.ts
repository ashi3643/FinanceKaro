import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAutoDetectedLanguage, getSupportedLanguages } from './languageDetection';

describe('languageDetection', () => {
  describe('getAutoDetectedLanguage', () => {
    const originalNavigator = global.navigator;

    beforeEach(() => {
      // Reset mocks
      vi.restoreAllMocks();
    });

    it('returns "en" when window is undefined (server-side)', () => {
      // Simulate server-side (no window)
      const originalWindow = global.window;
      // @ts-expect-error - temporarily delete window
      delete global.window;

      const result = getAutoDetectedLanguage();
      expect(result).toBe('en');

      // Restore window
      global.window = originalWindow;
    });

    it('returns browser language when supported', () => {
      // Mock navigator.language
      Object.defineProperty(global.navigator, 'language', {
        value: 'hi-IN',
        writable: true,
      });

      const result = getAutoDetectedLanguage();
      expect(result).toBe('hi');
    });

    it('returns "en" when browser language is not supported', () => {
      Object.defineProperty(global.navigator, 'language', {
        value: 'fr-FR',
        writable: true,
      });

      const result = getAutoDetectedLanguage();
      expect(result).toBe('en');
    });

    it('handles language code with region', () => {
      Object.defineProperty(global.navigator, 'language', {
        value: 'te-IN',
        writable: true,
      });

      const result = getAutoDetectedLanguage();
      expect(result).toBe('te');
    });

    it('handles uppercase language code', () => {
      Object.defineProperty(global.navigator, 'language', {
        value: 'HI-IN',
        writable: true,
      });

      const result = getAutoDetectedLanguage();
      expect(result).toBe('hi');
    });
  });

  describe('getSupportedLanguages', () => {
    it('returns array of supported languages', () => {
      const result = getSupportedLanguages();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      // Check structure
      result.forEach((lang) => {
        expect(lang).toHaveProperty('code');
        expect(lang).toHaveProperty('label');
        expect(lang).toHaveProperty('enabled');
      });

      // Check specific languages
      const enLang = result.find((lang) => lang.code === 'en');
      expect(enLang).toBeDefined();
      expect(enLang?.enabled).toBe(true);

      const hiLang = result.find((lang) => lang.code === 'hi');
      expect(hiLang).toBeDefined();
      expect(hiLang?.enabled).toBe(true);
    });
  });
});