'use client';

import { useState, useMemo } from 'react';
import { Calculator, TrendingUp, PieChart, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EMICalculator() {
  const [principal, setPrincipal] = useState(1000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);
  const [tenureType, setTenureType] = useState<'years' | 'months'>('years');

  // EMI Formula: E = P * r * (1+r)^n / ((1+r)^n - 1)
  const emi = useMemo(() => {
    const p = principal;
    const r = interestRate / 12 / 100;
    const n = tenureType === 'years' ? tenure * 12 : tenure;

    if (r === 0) return p / n;

    const emiValue = p * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    return emiValue;
  }, [principal, interestRate, tenure, tenureType]);

  const totalPayment = useMemo(() => {
    const n = tenureType === 'years' ? tenure * 12 : tenure;
    return emi * n;
  }, [emi, tenure, tenureType]);

  const totalInterest = useMemo(() => {
    return totalPayment - principal;
  }, [totalPayment, principal]);

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    } else {
      return `₹${amount.toLocaleString('en-IN')}`;
    }
  };

  const tenureInYears = tenureType === 'years' ? tenure : tenure / 12;

  return (
    <motion.div 
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/20 via-surface to-purple-500/10 border border-blue-500/20 p-6 sm:p-8 shadow-lg shadow-blue-500/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated background decorations */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" aria-hidden="true" />
      
      <div className="relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">
          <Calculator size={14} />
          EMI Calculator
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white mb-2 leading-tight">
          💳 Loan EMI Calculator
        </h2>
        <p className="text-muted text-sm sm:text-base mb-6">
          Calculate your monthly EMI for home loans, car loans, or personal loans.
        </p>

        {/* Main display - EMI Amount */}
        <motion.div 
          className="bg-bg/40 border border-blue-500/20 rounded-2xl p-6 sm:p-8 mb-8 backdrop-blur-sm"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-center">
            <div className="text-xs text-muted uppercase tracking-wider mb-3 font-semibold">
              Monthly EMI
            </div>
            <div className="text-5xl sm:text-6xl font-display font-extrabold text-blue-400 mb-2">
              {formatCurrency(emi)}
            </div>
            <p className="text-sm text-white/70">
              For {tenureInYears.toFixed(1)} {tenureType === 'years' ? 'years' : 'months'} at {interestRate}% interest
            </p>
          </div>
        </motion.div>

        {/* Principal Slider */}
        <div className="space-y-3 mb-6">
          <label className="block text-sm font-semibold text-white">
            Loan Amount: <span className="text-blue-400">{formatCurrency(principal)}</span>
          </label>
          <input
            type="range"
            min="100000"
            max="10000000"
            step="50000"
            value={principal}
            onChange={(e) => setPrincipal(Number(e.target.value))}
            className="w-full h-2 bg-surface border border-border rounded-lg appearance-none cursor-pointer accent-blue-500"
            aria-label="Loan amount"
          />
          <div className="flex justify-between text-xs text-muted">
            <span>₹1L</span>
            <span>₹1Cr</span>
          </div>
        </div>

        {/* Interest Rate Slider */}
        <div className="space-y-3 mb-6">
          <label className="block text-sm font-semibold text-white">
            Interest Rate: <span className="text-blue-400">{interestRate}%</span>
          </label>
          <input
            type="range"
            min="5"
            max="20"
            step="0.1"
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            className="w-full h-2 bg-surface border border-border rounded-lg appearance-none cursor-pointer accent-blue-500"
            aria-label="Interest rate"
          />
          <div className="flex justify-between text-xs text-muted">
            <span>5%</span>
            <span>20%</span>
          </div>
        </div>

        {/* Tenure Slider */}
        <div className="space-y-3 mb-6">
          <label className="block text-sm font-semibold text-white">
            Loan Tenure: <span className="text-blue-400">{tenure} {tenureType}</span>
          </label>
          <input
            type="range"
            min="1"
            max="30"
            step="1"
            value={tenure}
            onChange={(e) => setTenure(Number(e.target.value))}
            className="w-full h-2 bg-surface border border-border rounded-lg appearance-none cursor-pointer accent-blue-500"
            aria-label="Loan tenure"
            disabled={tenureType === 'months'}
          />
          <div className="flex justify-between text-xs text-muted">
            <span>1 {tenureType}</span>
            <span>30 {tenureType}</span>
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => {
                setTenureType('years');
                setTenure(Math.min(30, tenure / 12));
              }}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                tenureType === 'years'
                  ? 'bg-blue-500 text-white'
                  : 'bg-surface2 text-muted hover:bg-surface'
              }`}
            >
              Years
            </button>
            <button
              onClick={() => {
                setTenureType('months');
                setTenure(tenure * 12);
              }}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                tenureType === 'months'
                  ? 'bg-blue-500 text-white'
                  : 'bg-surface2 text-muted hover:bg-surface'
              }`}
            >
              Months
            </button>
          </div>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-2 gap-3 mb-8 text-xs">
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
            <div className="text-muted uppercase tracking-wider font-semibold mb-1">Total Payment</div>
            <div className="text-lg font-bold text-white">
              {formatCurrency(totalPayment)}
            </div>
          </div>
          <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-3">
            <div className="text-muted uppercase tracking-wider font-semibold mb-1">Total Interest</div>
            <div className="text-lg font-bold text-purple-400">
              {formatCurrency(totalInterest)}
            </div>
          </div>
        </div>

        {/* Interest Ratio */}
        <div className="bg-bg/40 border border-blue-500/20 rounded-xl p-4 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <PieChart size={16} className="text-blue-400" />
            <span className="text-sm font-semibold text-white">Payment Breakdown</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted">Principal</span>
              <span className="text-white font-medium">{formatCurrency(principal)}</span>
            </div>
            <div className="w-full bg-surface rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(principal / totalPayment) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted">Interest</span>
              <span className="text-purple-400 font-medium">{formatCurrency(totalInterest)}</span>
            </div>
            <div className="w-full bg-surface rounded-full h-2">
              <div 
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(totalInterest / totalPayment) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tip */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-start gap-3">
          <TrendingUp size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-white/80">
            <div className="font-semibold text-blue-400 mb-1">💡 Tip</div>
            <div>
              Paying extra ₹5,000 per month can save you up to {formatCurrency(totalInterest * 0.3)} in interest over the loan tenure.
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
