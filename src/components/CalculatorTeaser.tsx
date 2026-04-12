'use client';

import { useState, useMemo } from 'react';
import { ArrowRight, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useStore } from '@/lib/store';

const localeCodes = ['en', 'hi', 'te', 'ta', 'mr', 'bn'];
const stripLocalePrefix = (pathname: string) => {
  const segments = pathname.split('/').filter(Boolean);
  return segments.filter((segment) => !localeCodes.includes(segment)).join('/');
};

export default function CalculatorTeaser() {
  const t = useTranslations('home');
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const { setLanguage } = useStore();
  const [scenario, setScenario] = useState<'netflix' | 'coffee' | 'subscription'>('netflix');
  const [isNavigating, setIsNavigating] = useState(false);

  // Pre-calculated scenarios to show immediate impact
  const scenarios = {
    netflix: {
      title: '🍿 Netflix vs. Retirement',
      monthly: 500,
      display: '₹500/mo',
      years: 40,
      currentRate: 12,
      result: 16200000,
      insight: '₹1.62 Crore in 40 years! Your monthly Netflix could become serious wealth.'
    },
    coffee: {
      title: '☕ Daily Coffee vs. Wealth',
      monthly: 300,
      display: '₹300/mo',
      years: 30,
      currentRate: 12,
      result: 4800000,
      insight: '₹48 Lakhs in 30 years! That daily coffee habit compounds to real money.'
    },
    subscription: {
      title: '📱 All Subscriptions vs. Dream',
      monthly: 1500,
      display: '₹1500/mo',
      years: 35,
      currentRate: 12,
      result: 16850000,
      insight: '₹1.68+ Crore in 35 years. Your subscriptions could fund your dream.'
    }
  };

  const handleNavigateToCalculator = async () => {
    setIsNavigating(true);
    const relativePath = stripLocalePrefix(pathname);
    const targetPath = `/${locale}/calculate`;
    router.push(targetPath);
  };

  const current = scenarios[scenario];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent/20 via-surface to-accent3/10 border border-accent/20 p-6 sm:p-8 shadow-lg shadow-accent/10 animate-in fade-in slide-in-from-top-4 duration-500">
      {/* Animated background decorations */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent/10 rounded-full blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent3/10 rounded-full blur-3xl" aria-hidden="true" />
      
      <div className="relative z-10">
        {/* Teaser Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-bold uppercase tracking-widest mb-4">
          <Zap size={14} />
          Aha! Moment
        </div>

        {/* Main value proposition */}
        <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white mb-2 leading-tight">
          {current.title}
        </h2>
        <p className="text-muted text-sm sm:text-base mb-6">
          See the real cost of your habits over 30-40 years.
        </p>

        {/* Big number reveal */}
        <div className="bg-bg/40 border border-accent/20 rounded-xl p-4 sm:p-6 mb-6 backdrop-blur-sm">
          <div className="text-xs text-muted uppercase tracking-wider mb-2 font-semibold">
            {current.monthly} invested for {current.years} years
          </div>
          <div className="text-4xl sm:text-5xl font-display font-extrabold text-accent mb-1">
            ₹{(current.result / 10000000).toFixed(1)} Cr
          </div>
          <p className="text-sm text-white/80 font-medium">{current.insight}</p>
        </div>

        {/* Scenario tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {Object.entries(scenarios).map(([key, data]) => (
            <button
              key={key}
              onClick={() => setScenario(key as 'netflix' | 'coffee' | 'subscription')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                scenario === key
                  ? 'bg-accent text-black'
                  : 'bg-surface border border-border hover:border-accent/40'
              }`}
            >
              {data.title.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* CTA to full calculator */}
        <button
          onClick={handleNavigateToCalculator}
          disabled={isNavigating}
          className="w-full py-3 rounded-lg bg-accent text-black font-bold text-base flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-accent/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Try Full Calculator
          <ArrowRight size={18} />
        </button>

        {/* Subtext */}
        <p className="text-center text-xs text-muted mt-4">
          No login needed. See the power of compound interest instantly.
        </p>
      </div>
    </div>
  );
}
