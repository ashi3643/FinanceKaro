"use client";

import { useState } from "react";
import { Link, Shield, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

export default function AccountAggregator() {
  const [isConnected, setIsConnected] = useState(false);
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);

  const BANKS = [
    { id: "sbi", name: "State Bank of India", logo: "🏦", supported: true },
    { id: "hdfc", name: "HDFC Bank", logo: "🏦", supported: true },
    { id: "icici", name: "ICICI Bank", logo: "🏦", supported: true },
    { id: "axis", name: "Axis Bank", logo: "🏦", supported: true },
    { id: "kotak", name: "Kotak Mahindra Bank", logo: "🏦", supported: true },
    { id: "bob", name: "Bank of Baroda", logo: "🏦", supported: true },
  ];

  const toggleBank = (bankId: string) => {
    setSelectedBanks(prev => 
      prev.includes(bankId) 
        ? prev.filter(id => id !== bankId)
        : [...prev, bankId]
    );
  };

  const handleConnect = async () => {
    if (selectedBanks.length === 0) {
      alert("Please select at least one bank to connect.");
      return;
    }

    setIsConnecting(true);

    // Simulate Account Aggregator connection
    // In production, this would:
    // 1. Redirect to Account Aggregator (Finvu, PhonePe, etc.)
    // 2. User approves consent on AA app
    // 3. Receive encrypted data via AA
    // 4. Decrypt and process data locally

    setTimeout(() => {
      setIsConnected(true);
      setIsConnecting(false);
    }, 3000);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setSelectedBanks([]);
  };

  if (isConnected) {
    return (
      <div className="bg-surface2 border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/20 rounded-lg">
            <CheckCircle2 className="text-accent" size={24} />
          </div>
          <div>
            <div className="font-bold text-text-primary">Accounts Connected</div>
            <div className="text-sm text-text-secondary">{selectedBanks.length} bank(s) linked</div>
          </div>
        </div>

        <div className="bg-surface rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Link size={16} />
            <span>Connected via Account Aggregator (Finvu)</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Shield size={16} />
            <span>Encrypted & Secure</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <CheckCircle2 size={16} />
            <span>Real-time sync enabled</span>
          </div>
        </div>

        <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
          <div className="text-sm text-accent font-semibold mb-2">
            What's Next?
          </div>
          <div className="text-xs text-text-secondary space-y-1">
            <div>• View your complete financial picture</div>
            <div>• Get personalized insights</div>
            <div>• Track spending patterns</div>
            <div>• Set smart financial goals</div>
          </div>
        </div>

        <button
          onClick={handleDisconnect}
          className="w-full py-3 bg-surface border border-border text-text-secondary font-semibold rounded-lg hover:bg-surface3 transition-colors"
        >
          Disconnect All Accounts
        </button>
      </div>
    );
  }

  return (
    <div className="bg-surface2 border border-border rounded-xl p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/20 rounded-lg">
            <Link className="text-accent" size={24} />
          </div>
          <div>
            <div className="font-bold text-text-primary text-lg">Connect Your Accounts</div>
            <div className="text-sm text-text-secondary">Via Account Aggregator (AA)</div>
          </div>
        </div>
      </div>

      {/* What is AA */}
      <div className="bg-surface rounded-lg p-4 space-y-2">
        <div className="flex items-start gap-2">
          <AlertCircle className="text-accent flex-shrink-0 mt-0.5" size={16} />
          <div className="text-sm text-text-secondary">
            <div className="font-semibold text-text-primary mb-1">What is Account Aggregator?</div>
            <div>
              RBI-licensed service that securely fetches your financial data with your consent. 
              No passwords are shared with us.
            </div>
          </div>
        </div>
      </div>

      {/* Bank Selection */}
      <div className="space-y-3">
        <div className="text-sm font-semibold text-text-primary">
          Select Your Banks
        </div>
        <div className="grid grid-cols-2 gap-3">
          {BANKS.map((bank) => (
            <button
              key={bank.id}
              onClick={() => bank.supported && toggleBank(bank.id)}
              disabled={!bank.supported || isConnecting}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedBanks.includes(bank.id)
                  ? 'bg-accent/10 border-accent'
                  : bank.supported
                  ? 'bg-surface border-border hover:border-accent/50'
                  : 'bg-surface/50 border-border/50 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="text-2xl mb-1">{bank.logo}</div>
              <div className="text-xs font-semibold text-text-primary">{bank.name}</div>
              {!bank.supported && (
                <div className="text-[10px] text-muted mt-1">Coming Soon</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-surface rounded-lg p-4 space-y-2">
        <div className="text-sm font-semibold text-text-primary">Benefits of Connecting</div>
        <div className="text-xs text-text-secondary space-y-1">
          <div>✓ Complete financial overview in one place</div>
          <div>✓ AI-powered spending insights</div>
          <div>✓ Personalized financial recommendations</div>
          <div>✓ Track investments across platforms</div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Shield className="text-accent flex-shrink-0 mt-0.5" size={16} />
          <div className="text-xs text-accent">
            <div className="font-semibold mb-1">100% Secure & Encrypted</div>
            <div>
              Your data is encrypted end-to-end. We never see your passwords. 
              You can revoke access anytime.
            </div>
          </div>
        </div>
      </div>

      {/* Connect Button */}
      <button
        onClick={handleConnect}
        disabled={selectedBanks.length === 0 || isConnecting}
        className="w-full py-4 bg-accent text-black font-bold rounded-xl hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isConnecting ? (
          <>
            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            Connecting via Account Aggregator...
          </>
        ) : (
          <>
            Connect {selectedBanks.length} Bank{selectedBanks.length !== 1 ? 's' : ''}
            <ArrowRight size={18} />
          </>
        )}
      </button>

      {/* Learn More */}
      <button className="w-full py-2 text-xs text-accent hover:text-accent/80 transition-colors">
        Learn more about Account Aggregators →
      </button>
    </div>
  );
}
