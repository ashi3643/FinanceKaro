'use client';

import { useState, useEffect } from 'react';
import { Lightbulb, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

const quickTips = [
  {
    title: 'The 50-30-20 Rule',
    description: 'Spend 50% on needs, 30% on wants, 20% on savings. Simple but game-changing.',
    emoji: '📊',
    cta: 'Learn Budget Basics'
  },
  {
    title: 'Rupee Cost Averaging Works',
    description: 'Invest ₹500/month for 30 years = ₹1.8 crore. Time beats timing.',
    emoji: '📈',
    cta: 'See the Math'
  },
  {
    title: 'Scams Love Urgency',
    description: '"Act now or lose this deal!" Red flag. Real opportunities give you time.',
    emoji: '🚨',
    cta: 'Check Scam Radar'
  },
  {
    title: 'Compound Interest is Magic',
    description: 'Your money makes money. And then that money makes money too.',
    emoji: '✨',
    cta: 'Calculate Returns'
  },
  {
    title: 'Your First Salary Matters Most',
    description: 'The longer you invest, the more time your money has to grow.',
    emoji: '💰',
    cta: 'Start Learning'
  },
  {
    title: 'Not All Expenses Are Equal',
    description: '₹500 spent today → ₹5 Lakhs in retirement. Choose wisely.',
    emoji: '🎯',
    cta: 'Budget Breakdown'
  }
];

const localeCodes = ['en', 'hi', 'te', 'ta', 'mr', 'bn'];
const stripLocalePrefix = (pathname: string) => {
  const segments = pathname.split('/').filter(Boolean);
  return segments.filter((segment) => !localeCodes.includes(segment)).join('/');
};

export default function QuickTip() {
  const t = useTranslations('home');
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const [tip, setTip] = useState(quickTips[0]);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // Pick a random tip on mount
    setTip(quickTips[Math.floor(Math.random() * quickTips.length)]);
  }, []);

  const handleNextTip = () => {
    const randomTip = quickTips[Math.floor(Math.random() * quickTips.length)];
    setTip(randomTip);
  };

  // Route mapping for CTAs
  const routeMap: Record<string, string> = {
    'Learn Budget Basics': '/budget-explained',
    'See the Math': '/calculate',
    'Check Scam Radar': '/scam-radar',
    'Calculate Returns': '/calculate',
    'Start Learning': '/learn',
    'Budget Breakdown': '/budget-explained'
  };

  const handleCTA = () => {
    setIsNavigating(true);
    const route = routeMap[tip.cta] || '/learn';
    router.push(`/${locale}${route}`);
  };

  return (
    <div className="rounded-xl bg-surface border border-accent3/30 p-6 sm:p-7 shadow-sm shadow-accent3/10 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
      <div className="flex items-start gap-4">
        <div className="text-4xl flex-shrink-0">{tip.emoji}</div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-accent3 mb-2">{tip.title}</h3>
          <p className="text-sm text-text/80 mb-4 leading-relaxed">{tip.description}</p>
          
          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <button
              onClick={handleCTA}
              disabled={isNavigating}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-lg bg-accent3 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {tip.cta}
              <ArrowRight size={16} />
            </button>
            <button
              onClick={handleNextTip}
              className="px-4 py-2 rounded-lg bg-surface2 border border-border text-muted hover:border-accent3/40 font-semibold text-sm transition-all"
            >
              Next Tip
            </button>
          </div>
        </div>
      </div>
      
      <p className="text-xs text-muted mt-4 border-t border-border/50 pt-4">
        💡 Just browsing? No pressure to pick a path. These quick wins help you start today.
      </p>
    </div>
  );
}
