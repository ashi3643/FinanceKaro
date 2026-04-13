'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, X, Info } from 'lucide-react';

interface RegulatoryDisclaimerProps {
  type?: 'investment' | 'stock' | 'general';
  position?: 'top' | 'bottom' | 'modal';
  onDismiss?: () => void;
}

const DISCLAIMER_MESSAGES = {
  investment: {
    icon: AlertTriangle,
    title: 'Investment Disclaimer',
    message: 'This tool is for educational purposes only. Past performance does not guarantee future results. Consult a SEBI-registered investment advisor before making investment decisions.',
    color: 'warning',
  },
  stock: {
    icon: AlertTriangle,
    title: 'Stock Market Disclaimer',
    message: 'Stock market investments are subject to market risks. This is a simulation for educational purposes only. Not a recommendation to buy/sell any securities.',
    color: 'warning',
  },
  general: {
    icon: Info,
    title: 'Educational Purpose Only',
    message: 'FinanceKaro provides financial education content. This is not financial advice. Please consult qualified professionals for personal financial decisions.',
    color: 'accent',
  },
};

export default function RegulatoryDisclaimer({ 
  type = 'general', 
  position = 'top',
  onDismiss 
}: RegulatoryDisclaimerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const config = DISCLAIMER_MESSAGES[type];
  const Icon = config.icon;

  useEffect(() => {
    const hasSeen = localStorage.getItem(`disclaimer-${type}-${position}`);
    if (hasSeen) {
      setIsDismissed(true);
    }
  }, [type, position]);

  const handleDismiss = () => {
    localStorage.setItem(`disclaimer-${type}-${position}`, 'true');
    setIsDismissed(true);
    onDismiss?.();
  };

  const handleAcknowledge = () => {
    localStorage.setItem(`disclaimer-${type}-${position}`, 'true');
    setIsDismissed(true);
    setShowModal(false);
    onDismiss?.();
  };

  if (isDismissed && position !== 'modal') return null;

  // Modal version
  if (position === 'modal') {
    return (
      <>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-surface1 rounded-2xl max-w-lg w-full p-6 border border-border shadow-2xl">
              <div className="flex items-start gap-4 mb-4">
                <div className={`p-3 rounded-full bg-${config.color}/20`}>
                  <Icon className={`text-${config.color}`} size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-text mb-2">{config.title}</h3>
                  <p className="text-sm text-muted">{config.message}</p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAcknowledge}
                  className="flex-1 py-3 px-4 bg-accent text-black font-bold rounded-xl hover:bg-accent/90 transition-colors"
                >
                  I Understand
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Sticky banner version
  return (
    <div className={`fixed ${position === 'top' ? 'top-0' : 'bottom-0'} left-0 right-0 z-40 bg-${config.color}/10 border-b border-${config.color}/30 backdrop-blur-sm`}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <Icon className={`text-${config.color}`} size={20} />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-text">
            <span className="font-semibold">{config.title}:</span> {config.message}
          </p>
        </div>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss disclaimer"
          className="p-1 text-muted hover:text-text transition-colors flex-shrink-0"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
