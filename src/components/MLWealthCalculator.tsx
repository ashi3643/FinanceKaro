'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowRight, Zap, TrendingUp, Brain, AlertCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useStore } from '@/lib/store';

// Debounce function to limit API calls
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

export default function MLWealthCalculator() {
  const router = useRouter();
  const locale = useLocale();
  const [monthlyAmount, setMonthlyAmount] = useState(500);
  const [years, setYears] = useState(40);
  const [annualReturn, setAnnualReturn] = useState(12);
  const [age, setAge] = useState(30);
  const [income, setIncome] = useState(50000);
  const [riskTolerance, setRiskTolerance] = useState<'low' | 'medium' | 'high'>('medium');
  
  const { predictWealth, isPredicting, predictionError, recentPredictions, submitPredictionFeedback } = useStore();
  const [mlPrediction, setMlPrediction] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [recommendation, setRecommendation] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Traditional compound interest calculation (fallback)
  const calculatedWealth = useCallback(() => {
    const monthlyRate = annualReturn / 100 / 12;
    const months = years * 12;
    
    if (monthlyRate === 0) {
      return monthlyAmount * months;
    }
    
    const futureValue = monthlyAmount * (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate));
    return Math.round(futureValue);
  }, [monthlyAmount, years, annualReturn]);

  // Fetch ML prediction with debouncing
  const fetchMlPrediction = useCallback(
    debounce(async () => {
      try {
        const result = await predictWealth({
          monthlyAmount,
          years,
          annualReturn,
          age,
          income,
          riskTolerance,
          financialGoals: ['retirement', 'wealth_building']
        });
        
        setMlPrediction(result.prediction);
        setConfidence(result.confidence);
        setRecommendation(result.recommendation);
        setShowFeedback(true);
      } catch (error) {
        // Use fallback calculation if ML prediction fails
        setMlPrediction(calculatedWealth());
        setConfidence(0.5);
        setRecommendation('Using standard calculation. Try adjusting parameters for personalized insights.');
      }
    }, 500),
    [monthlyAmount, years, annualReturn, age, income, riskTolerance, predictWealth]
  );

  // Trigger ML prediction when inputs change
  useEffect(() => {
    fetchMlPrediction();
  }, [monthlyAmount, years, annualReturn, age, income, riskTolerance, fetchMlPrediction]);

  const handleFeedback = async (isAccurate: boolean) => {
    if (recentPredictions.length > 0) {
      const latestPrediction = recentPredictions[0];
      await submitPredictionFeedback(
        latestPrediction.timestamp,
        isAccurate ? 'accurate' : 'inaccurate'
      );
      setFeedbackSubmitted(true);
      setTimeout(() => setShowFeedback(false), 2000);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)} L`;
    } else {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
  };

  const handleNavigateToCalculator = () => {
    router.push(`/${locale}/calculate`);
  };

  const traditionalWealth = calculatedWealth();
  const displayWealth = mlPrediction !== null ? mlPrediction : traditionalWealth;
  const wealthDifference = mlPrediction !== null ? ((mlPrediction - traditionalWealth) / traditionalWealth) * 100 : 0;

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
          <Brain size={14} />
          AI-Powered Wealth Simulator
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white mb-2 leading-tight">
          🧠 Smart Wealth Builder
        </h2>
        <p className="text-muted text-sm sm:text-base mb-6">
          Get AI-powered predictions based on your profile and market trends.
        </p>

        {/* Prediction Confidence Indicator */}
        {mlPrediction !== null && (
          <div className="mb-4 p-3 bg-surface/50 rounded-lg border border-accent/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-white">AI Confidence</span>
              <span className="text-sm font-bold text-accent">{Math.round(confidence * 100)}%</span>
            </div>
            <div className="w-full bg-surface2 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-accent h-2 rounded-full transition-all duration-500"
                style={{ width: `${confidence * 100}%` }}
              />
            </div>
            {wealthDifference !== 0 && (
              <p className="text-xs text-muted mt-2">
                AI prediction is {Math.abs(wealthDifference).toFixed(1)}% {wealthDifference > 0 ? 'higher' : 'lower'} than standard calculation
              </p>
            )}
          </div>
        )}

        {/* Main display - BIG NUMBER with animation */}
        <motion.div 
          className="bg-bg/40 border border-accent/20 rounded-2xl p-6 sm:p-8 mb-8 backdrop-blur-sm"
          key={displayWealth}
          animate={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 200, damping: 10 }}
        >
          <div className="text-center">
            <div className="text-xs text-muted uppercase tracking-wider mb-3 font-semibold">
              After {years} years at {annualReturn}% annual return
              {mlPrediction !== null && (
                <span className="ml-2 text-accent">• AI-Powered</span>
              )}
            </div>
            <motion.div 
              className="text-5xl sm:text-6xl font-display font-extrabold text-accent mb-2"
              key={displayWealth}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {formatCurrency(displayWealth)}
            </motion.div>
            <p className="text-sm text-white/70">
              From ₹{monthlyAmount}/month investments
            </p>
            
            {/* AI Recommendation */}
            {recommendation && (
              <motion.div 
                className="mt-4 p-3 bg-surface/50 rounded-lg border border-accent/10"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-start gap-2">
                  <Brain size={16} className="text-accent mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-white/80">{recommendation}</p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Error Display */}
        {predictionError && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-red-300">
              <AlertCircle size={16} />
              <span className="text-sm font-medium">Prediction Error</span>
            </div>
            <p className="text-xs text-red-300/80 mt-1">{predictionError}</p>
            <p className="text-xs text-red-300/60 mt-1">Using standard calculation as fallback</p>
          </div>
        )}

        {/* User Profile Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-white">
              Your Age: <span className="text-accent">{age}</span>
            </label>
            <input
              type="range"
              min="18"
              max="70"
              step="1"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full h-2 bg-surface border border-border rounded-lg appearance-none cursor-pointer accent-accent"
            />
            <div className="flex justify-between text-xs text-muted">
              <span>18</span>
              <span>70</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-white">
              Annual Income: <span className="text-accent">₹{income.toLocaleString()}</span>
            </label>
            <input
              type="range"
              min="20000"
              max="2000000"
              step="10000"
              value={income}
              onChange={(e) => setIncome(Number(e.target.value))}
              className="w-full h-2 bg-surface border border-border rounded-lg appearance-none cursor-pointer accent-accent"
            />
            <div className="flex justify-between text-xs text-muted">
              <span>₹20K</span>
              <span>₹20L</span>
            </div>
          </div>
        </div>

        {/* Risk Tolerance Selector */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-white mb-3">
            Risk Tolerance
          </label>
          <div className="flex gap-2">
            {(['low', 'medium', 'high'] as const).map((risk) => (
              <button
                key={risk}
                onClick={() => setRiskTolerance(risk)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  riskTolerance === risk
                    ? 'bg-accent text-white'
                    : 'bg-surface2 text-muted hover:bg-surface'
                }`}
              >
                {risk.charAt(0).toUpperCase() + risk.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Original Calculator Inputs */}
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-white">
              Monthly Investment: <span className="text-accent">₹{monthlyAmount}</span>
            </label>
            <input
              type="range"
              min="100"
              max="50000"
              step="100"
              value={monthlyAmount}
              onChange={(e) => setMonthlyAmount(Number(e.target.value))}
              className="w-full h-2 bg-surface border border-border rounded-lg appearance-none cursor-pointer accent-accent"
            />
            <div className="flex justify-between text-xs text-muted">
              <span>₹100</span>
              <span>₹50K</span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-white">
              Time Horizon: <span className="text-accent">{years} years</span>
            </label>
            <input
              type="range"
              min="1"
              max="50"
              step="1"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full h-2 bg-surface border border-border rounded-lg appearance-none cursor-pointer accent-accent"
            />
            <div className="flex justify-between text-xs text-muted">
              <span>1 year</span>
              <span>50 years</span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-white">
              Annual Return: <span className="text-accent">{annualReturn}%</span>
            </label>
            <input
              type="range"
              min="5"
              max="25"
              step="0.5"
              value={annualReturn}
              onChange={(e) => setAnnualReturn(Number(e.target.value))}
              className="w-full h-2 bg-surface border border-border rounded-lg appearance-none cursor-pointer accent-accent"
            />
            <div className="flex justify-between text-xs text-muted">
              <span>5%</span>
              <span>25%</span>
            </div>
          </div>
        </div>

        {/* Feedback Section */}
        {showFeedback && !feedbackSubmitted && (
          <motion.div 
            className="mt-6 p-4 bg-surface/50 rounded-lg border border-accent/20"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-sm font-semibold text-white mb-3">Was this prediction helpful?</p>
            <div className="flex gap-3">
              <button
                onClick={() => handleFeedback(true)}
                className="flex-1 py-2 px-4 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg flex items-center justify-center gap-2 text-green-300 transition-colors"
              >
                <ThumbsUp size={16} />
                <span>Accurate</span>
              </button>
              <button
                onClick={() => handleFeedback(false)}
                className="flex-1 py-2 px-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg flex items-center justify-center gap-2 text-red-300 transition-colors"
              >
                <ThumbsDown size={16} />
                <span>Needs Improvement</span>
              </button>
            </div>
          </motion.div>
        )}

        {feedbackSubmitted && (
          <div className="mt-6 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
            <p className="text-sm text-green-300">Thank you for your feedback! This helps improve our AI.</p>
          </div>
        )}

        {/* Loading State */}
        {isPredicting && (
          <div className="mt-6 p-3 bg-surface/50 rounded-lg border border-accent/20 text-center">
            <div className="inline-flex items-center gap-2 text-accent">
              <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">AI is analyzing your profile...</span>
            </div>
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={handleNavigateToCalculator}
          className="mt-8 w-full py-3 px-6 bg-gradient-to-r from-accent to-accent3 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-accent/20"
        >
          <TrendingUp size={20} />
          Explore Advanced Calculator
          <ArrowRight size={20} />
        </button>

        <p className="text-xs text-muted text-center mt-4">
          Predictions improve with more data. Your feedback helps train our AI model.
        </p>
      </div>
    </motion.div>
  );
}