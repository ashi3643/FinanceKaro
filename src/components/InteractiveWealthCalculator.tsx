'use client';

import { useState, useMemo } from 'react';
import { ArrowRight, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

export default function InteractiveWealthCalculator() {
  const router = useRouter();
  const locale = useLocale();
  const [monthlyAmount, setMonthlyAmount] = useState(500);
  const [years, setYears] = useState(40);
  const [annualReturn, setAnnualReturn] = useState(12);

  // Compound interest formula: A = P * [((1 + r)^n - 1) / r]
  // where r = annual rate (as decimal), n = number of months
  const calculatedWealth = useMemo(() => {
    const monthlyRate = annualReturn / 100 / 12;
    const months = years * 12;
    
    if (monthlyRate === 0) {
      return monthlyAmount * months;
    }
    
    const futureValue = monthlyAmount * (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate));
    return Math.round(futureValue);
  }, [monthlyAmount, years, annualReturn]);

  const crores = (calculatedWealth / 10000000).toFixed(2);
  const lakhs = ((calculatedWealth % 10000000) / 100000).toFixed(1);

  const renderAmount = () => {
    if (calculatedWealth >= 10000000) {
      return `₹${crores} Cr`;
    } else if (calculatedWealth >= 100000) {
      return `₹${lakhs} L`;
    } else {
      return `₹${(calculatedWealth / 1000).toFixed(1)}K`;
    }
  };

  const handleNavigateToCalculator = () => {
    router.push(`/${locale}/calculate`);
  };

  return (
    <motion.div 
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent/20 via-surface to-accent3/10 border border-accent/20 p-6 sm:p-8 shadow-lg shadow-accent/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated background decorations */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent/10 rounded-full blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent3/10 rounded-full blur-3xl" aria-hidden="true" />
      
      <div className="relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-bold uppercase tracking-widest mb-4">
          <Zap size={14} />
          Interactive Wealth Simulator
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white mb-2 leading-tight">
          💰 Build Your Wealth
        </h2>
        <p className="text-muted text-sm sm:text-base mb-6">
          Adjust the sliders to see your future. Compound interest compounds mindsets.
        </p>

        {/* Main display - BIG NUMBER with animation */}
        <motion.div 
          className="bg-bg/40 border border-accent/20 rounded-2xl p-6 sm:p-8 mb-8 backdrop-blur-sm"
          key={calculatedWealth}
          animate={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 200, damping: 10 }}
        >
          <div className="text-center">
            <div className="text-xs text-muted uppercase tracking-wider mb-3 font-semibold">
              After {years} years at {annualReturn}% annual return
            </div>
            <motion.div 
              className="text-5xl sm:text-6xl font-display font-extrabold text-accent mb-2"
              key={crores}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {renderAmount()}
            </motion.div>
            <p className="text-sm text-white/70">
              From ₹{monthlyAmount}/month investments
            </p>
          </div>
        </motion.div>

        {/* Monthly Amount Slider */}
        <div className="space-y-3 mb-6">
          <label htmlFor="monthly-slider" className="block text-sm font-semibold text-white">
            Monthly Investment: <span className="text-accent">₹{monthlyAmount}</span>
          </label>
          <input
            id="monthly-slider"
            type="range"
            min="100"
            max="50000"
            step="100"
            value={monthlyAmount}
            onChange={(e) => setMonthlyAmount(Number(e.target.value))}
            className="w-full h-2 bg-surface border border-border rounded-lg appearance-none cursor-pointer accent-accent"
            aria-label="Monthly investment amount"
          />
          <div className="flex justify-between text-xs text-muted">
            <span>₹100</span>
            <span>₹50K</span>
          </div>
        </div>

        {/* Time Horizon Slider */}
        <div className="space-y-3 mb-6">
          <label htmlFor="years-slider" className="block text-sm font-semibold text-white">
            Time Horizon: <span className="text-accent">{years} years</span>
          </label>
          <input
            id="years-slider"
            type="range"
            min="1"
            max="50"
            step="1"
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full h-2 bg-surface border border-border rounded-lg appearance-none cursor-pointer accent-accent"
            aria-label="Time horizon in years"
          />
          <div className="flex justify-between text-xs text-muted">
            <span>1 year</span>
            <span>50 years</span>
          </div>
        </div>

        {/* Annual Return Rate Slider */}
        <div className="space-y-3 mb-8">
          <label htmlFor="return-slider" className="block text-sm font-semibold text-white">
            Annual Return: <span className="text-accent">{annualReturn}%</span>
            <span className="text-xs text-muted ml-2">(12% = typical market avg)</span>
          </label>
          <input
            id="return-slider"
            type="range"
            min="4"
            max="20"
            step="0.5"
            value={annualReturn}
            onChange={(e) => setAnnualReturn(Number(e.target.value))}
            className="w-full h-2 bg-surface border border-border rounded-lg appearance-none cursor-pointer accent-accent"
            aria-label="Expected annual return percentage"
          />
          <div className="flex justify-between text-xs text-muted">
            <span>4% (Bonds)</span>
            <span>20% (High Risk)</span>
          </div>
        </div>

        {/* Quick insights */}
        <div className="grid grid-cols-2 gap-3 mb-8 text-xs">
          <div className="bg-accent/5 border border-accent/20 rounded-lg p-3">
            <div className="text-muted uppercase tracking-wider font-semibold mb-1">Total Invested</div>
            <div className="text-lg font-bold text-white">
              ₹{((monthlyAmount * years * 12) / 100000).toFixed(1)}L
            </div>
          </div>
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-3">
            <div className="text-muted uppercase tracking-wider font-semibold mb-1">Wealth Gain</div>
            <div className="text-lg font-bold text-accent">
              +{((calculatedWealth - (monthlyAmount * years * 12)) / (monthlyAmount * years * 12) * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        {/* CTA to full calculator */}
        <button
          onClick={handleNavigateToCalculator}
          className="w-full py-3 rounded-lg bg-accent text-black font-bold text-base flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-accent/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <TrendingUp size={18} />
          Unlock Advanced Calculator
          <ArrowRight size={18} />
        </button>

        {/* Trust message */}
        <p className="text-center text-xs text-muted mt-4">
          ✓ No login needed • ✓ Real compound math • ✓ See your power instantly
        </p>
      </div>
    </motion.div>
  );
}
