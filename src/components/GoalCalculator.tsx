'use client';

import { useState, useMemo } from 'react';
import { Target, TrendingUp, Calendar, PiggyBank, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GoalCalculator() {
  const [goalAmount, setGoalAmount] = useState(5000000);
  const [currentSavings, setCurrentSavings] = useState(1000000);
  const [timeframe, setTimeframe] = useState(10);
  const [timeframeType, setTimeframeType] = useState<'years' | 'months'>('years');
  const [expectedReturn, setExpectedReturn] = useState(12);

  // Calculate required monthly investment
  const requiredMonthlyInvestment = useMemo(() => {
    const amountNeeded = goalAmount - currentSavings;
    if (amountNeeded <= 0) return 0;

    const periods = timeframeType === 'years' ? timeframe * 12 : timeframe;
    const monthlyRate = expectedReturn / 12 / 100;

    if (monthlyRate === 0) return amountNeeded / periods;

    // Future Value of Annuity Formula: PMT = FV * r / ((1+r)^n - 1)
    const pmt = amountNeeded * monthlyRate / (Math.pow(1 + monthlyRate, periods) - 1);
    return pmt;
  }, [goalAmount, currentSavings, timeframe, timeframeType, expectedReturn]);

  const finalAmount = useMemo(() => {
    const periods = timeframeType === 'years' ? timeframe * 12 : timeframe;
    const monthlyRate = expectedReturn / 12 / 100;

    if (monthlyRate === 0) {
      return currentSavings + (requiredMonthlyInvestment * periods);
    }

    const futureValueSavings = currentSavings * Math.pow(1 + monthlyRate, periods);
    const futureValueInvestments = requiredMonthlyInvestment * ((Math.pow(1 + monthlyRate, periods) - 1) / monthlyRate);
    return futureValueSavings + futureValueInvestments;
  }, [currentSavings, requiredMonthlyInvestment, timeframe, timeframeType, expectedReturn]);

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    } else {
      return `₹${amount.toLocaleString('en-IN')}`;
    }
  };

  const timeframeInYears = timeframeType === 'years' ? timeframe : timeframe / 12;
  const amountNeeded = goalAmount - currentSavings;

  return (
    <motion.div 
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/20 via-surface to-teal-500/10 border border-green-500/20 p-6 sm:p-8 shadow-lg shadow-green-500/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated background decorations */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-green-500/10 rounded-full blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl" aria-hidden="true" />
      
      <div className="relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 text-xs font-bold uppercase tracking-widest mb-4">
          <Target size={14} />
          Goal Calculator
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white mb-2 leading-tight">
          🎯 Financial Goal Planner
        </h2>
        <p className="text-muted text-sm sm:text-base mb-6">
          Calculate how much you need to save monthly to reach your financial goals.
        </p>

        {/* Main display - Required Monthly Investment */}
        <motion.div 
          className="bg-bg/40 border border-green-500/20 rounded-2xl p-6 sm:p-8 mb-8 backdrop-blur-sm"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-center">
            <div className="text-xs text-muted uppercase tracking-wider mb-3 font-semibold">
              Required Monthly Investment
            </div>
            <div className="text-5xl sm:text-6xl font-display font-extrabold text-green-400 mb-2">
              {formatCurrency(requiredMonthlyInvestment)}
            </div>
            <p className="text-sm text-white/70">
              To reach {formatCurrency(goalAmount)} in {timeframeInYears.toFixed(1)} {timeframeType === 'years' ? 'years' : 'months'} at {expectedReturn}% return
            </p>
          </div>
        </motion.div>

        {/* Goal Amount Slider */}
        <div className="space-y-3 mb-6">
          <label className="block text-sm font-semibold text-white">
            Goal Amount: <span className="text-green-400">{formatCurrency(goalAmount)}</span>
          </label>
          <input
            type="range"
            min="100000"
            max="100000000"
            step="100000"
            value={goalAmount}
            onChange={(e) => setGoalAmount(Number(e.target.value))}
            className="w-full h-2 bg-surface border border-border rounded-lg appearance-none cursor-pointer accent-green-500"
            aria-label="Goal amount"
          />
          <div className="flex justify-between text-xs text-muted">
            <span>₹1L</span>
            <span>₹10Cr</span>
          </div>
        </div>

        {/* Current Savings Slider */}
        <div className="space-y-3 mb-6">
          <label className="block text-sm font-semibold text-white">
            Current Savings: <span className="text-green-400">{formatCurrency(currentSavings)}</span>
          </label>
          <input
            type="range"
            min="0"
            max={goalAmount}
            step="50000"
            value={currentSavings}
            onChange={(e) => setCurrentSavings(Number(e.target.value))}
            className="w-full h-2 bg-surface border border-border rounded-lg appearance-none cursor-pointer accent-green-500"
            aria-label="Current savings"
          />
          <div className="flex justify-between text-xs text-muted">
            <span>₹0</span>
            <span>{formatCurrency(goalAmount)}</span>
          </div>
        </div>

        {/* Timeframe Slider */}
        <div className="space-y-3 mb-6">
          <label className="block text-sm font-semibold text-white">
            Timeframe: <span className="text-green-400">{timeframe} {timeframeType}</span>
          </label>
          <input
            type="range"
            min="1"
            max="40"
            step="1"
            value={timeframe}
            onChange={(e) => setTimeframe(Number(e.target.value))}
            className="w-full h-2 bg-surface border border-border rounded-lg appearance-none cursor-pointer accent-green-500"
            aria-label="Timeframe"
            disabled={timeframeType === 'months'}
          />
          <div className="flex justify-between text-xs text-muted">
            <span>1 {timeframeType}</span>
            <span>40 {timeframeType}</span>
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => {
                setTimeframeType('years');
                setTimeframe(Math.min(40, Math.round(timeframe / 12)));
              }}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                timeframeType === 'years'
                  ? 'bg-green-500 text-white'
                  : 'bg-surface2 text-muted hover:bg-surface'
              }`}
            >
              Years
            </button>
            <button
              onClick={() => {
                setTimeframeType('months');
                setTimeframe(timeframe * 12);
              }}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                timeframeType === 'months'
                  ? 'bg-green-500 text-white'
                  : 'bg-surface2 text-muted hover:bg-surface'
              }`}
            >
              Months
            </button>
          </div>
        </div>

        {/* Expected Return Slider */}
        <div className="space-y-3 mb-6">
          <label className="block text-sm font-semibold text-white">
            Expected Annual Return: <span className="text-green-400">{expectedReturn}%</span>
          </label>
          <input
            type="range"
            min="5"
            max="20"
            step="0.5"
            value={expectedReturn}
            onChange={(e) => setExpectedReturn(Number(e.target.value))}
            className="w-full h-2 bg-surface border border-border rounded-lg appearance-none cursor-pointer accent-green-500"
            aria-label="Expected return"
          />
          <div className="flex justify-between text-xs text-muted">
            <span>5% (Conservative)</span>
            <span>20% (Aggressive)</span>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3 mb-8 text-xs">
          <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3">
            <div className="text-muted uppercase tracking-wider font-semibold mb-1">Amount Needed</div>
            <div className="text-lg font-bold text-white">
              {formatCurrency(amountNeeded)}
            </div>
          </div>
          <div className="bg-teal-500/5 border border-teal-500/20 rounded-lg p-3">
            <div className="text-muted uppercase tracking-wider font-semibold mb-1">Projected Value</div>
            <div className="text-lg font-bold text-teal-400">
              {formatCurrency(finalAmount)}
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        {currentSavings > 0 && (
          <div className="bg-bg/40 border border-green-500/20 rounded-xl p-4 mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-white">Goal Progress</span>
              <span className="text-sm font-bold text-green-400">
                {((currentSavings / goalAmount) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-surface rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-teal-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (currentSavings / goalAmount) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="space-y-3">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-start gap-3">
            <PiggyBank size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-white/80">
              <div className="font-semibold text-green-400 mb-1">💡 Start Early</div>
              <div>
                Starting 5 years earlier can reduce your monthly investment by up to 40% due to compound interest.
              </div>
            </div>
          </div>
          <div className="bg-teal-500/10 border border-teal-500/30 rounded-lg p-4 flex items-start gap-3">
            <Sparkles size={20} className="text-teal-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-white/80">
              <div className="font-semibold text-teal-400 mb-1">🎯 Be Realistic</div>
              <div>
                Choose expected returns based on your risk profile: 8-10% (conservative), 12-15% (moderate), 15%+ (aggressive).
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
