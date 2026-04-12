import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import BottomNav from './BottomNav';
import React from 'react';

// Mock next-intl
vi.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'nav.home': 'home',
      'nav.learn': 'learn',
      'nav.calculate': 'calculate',
      'nav.scamRadar': 'scamRadar',
      'nav.rankings': 'rankings',
    };
    return translations[key] || key;
  },
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/en',
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('BottomNav', () => {
  it('renders navigation items', () => {
    render(<BottomNav />);

    // Check that all nav items are rendered (text is lowercase in actual component)
    expect(screen.getByText('home')).toBeInTheDocument();
    expect(screen.getByText('learn')).toBeInTheDocument();
    expect(screen.getByText('calculate')).toBeInTheDocument();
    expect(screen.getByText('scamRadar')).toBeInTheDocument();
    expect(screen.getByText('rankings')).toBeInTheDocument();
  });

  it('has correct aria-label for accessibility', () => {
    render(<BottomNav />);
    
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Primary navigation');
  });

  it('renders links with correct hrefs', () => {
    render(<BottomNav />);

    const homeLink = screen.getByText('home').closest('a');
    expect(homeLink).toHaveAttribute('href', '/en');

    const learnLink = screen.getByText('learn').closest('a');
    expect(learnLink).toHaveAttribute('href', '/en/learn');
  });
});