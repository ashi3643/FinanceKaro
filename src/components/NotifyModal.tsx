'use client';

import { useState } from 'react';
import { Mail, Bell, X } from 'lucide-react';

interface NotifyModalProps {
  language: string;
  onClose: () => void;
}

export default function NotifyModal({ language, onClose }: NotifyModalProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    setSubmitted(true);
    setLoading(false);

    // Close modal after 2 seconds
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-surface rounded-2xl p-8 max-w-sm w-full text-center animate-in zoom-in-95">
          <div className="text-4xl mb-4">✨</div>
          <h3 className="font-display text-lg font-bold text-accent mb-2">
            You're on the list!
          </h3>
          <p className="text-sm text-muted mb-4">
            We'll let you know the moment {language} is available.
          </p>
          <p className="text-xs text-text/60">
            (Check your email for updates)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in">
      <div className="bg-surface rounded-2xl p-6 sm:p-8 max-w-sm w-full animate-in zoom-in-95">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
            <Bell className="text-accent" size={20} />
            Coming Soon
          </h3>
          <button
            onClick={onClose}
            className="text-muted hover:text-text transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-muted mb-5">
          {language} will be available soon. Enter your email to be notified when it launches!
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-2.5 bg-bg border border-border rounded-lg text-text placeholder-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full py-2.5 bg-accent text-black font-semibold rounded-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding...' : 'Notify Me'}
          </button>
        </form>

        <p className="text-xs text-muted/60 mt-4 text-center">
          We promise no spam, just updates on {language} launch.
        </p>
      </div>
    </div>
  );
}
