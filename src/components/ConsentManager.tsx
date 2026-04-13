"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { getDataService } from "@/lib/dataService";
import { Shield, CheckCircle2, AlertCircle, FileText, Trash, Download } from "lucide-react";

export default function ConsentManager() {
  const { deviceId } = useStore();
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  const [activeTab, setActiveTab] = useState<'consent' | 'rights'>('consent');
  const dataService = getDataService();

  useEffect(() => {
    const checkConsent = async () => {
      try {
        if (deviceId) {
          const consent = await dataService.checkConsent(deviceId);
          setHasConsent(consent);
          
          // Show consent modal if no consent exists
          if (!consent) {
            setShowConsentModal(true);
          }
        }
      } catch (error) {
        console.error('Error checking consent:', error);
        // Don't show modal if there's an error
        setShowConsentModal(false);
      }
    };

    checkConsent();
  }, [deviceId, dataService]);

  const handleGiveConsent = async () => {
    try {
      if (deviceId) {
        await dataService.storeConsent(deviceId, true);
        setHasConsent(true);
        setShowConsentModal(false);
      }
    } catch (error) {
      console.error('Error giving consent:', error);
      alert('Failed to save consent. Please try again.');
    }
  };

  const handleRevokeConsent = async () => {
    try {
      if (deviceId) {
        await dataService.storeConsent(deviceId, false);
        setHasConsent(false);
      }
    } catch (error) {
      console.error('Error revoking consent:', error);
      alert('Failed to revoke consent. Please try again.');
    }
  };

  const handleDeleteData = async () => {
    try {
      if (deviceId && confirm('Are you sure you want to delete all your data? This action cannot be undone.')) {
        const deleted = await dataService.deleteUserData(deviceId);
        if (deleted) {
          alert('Your data has been deleted successfully.');
        } else {
          alert('Failed to delete data. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error deleting data:', error);
      alert('Failed to delete data. Please try again.');
    }
  };

  const handleExportData = async () => {
    try {
      if (deviceId) {
        const data = await dataService.exportUserData(deviceId);
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `financesekho-data-${deviceId}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  if (!showConsentModal && hasConsent) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-surface1 rounded-2xl max-w-lg w-full p-6 border border-border shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-accent/20 rounded-lg">
            <Shield className="text-accent" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-text-primary">
              Data Privacy Consent
            </h2>
            <p className="text-sm text-text-secondary">
              DPDP Act Compliance
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('consent')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'consent'
                ? 'bg-accent text-black'
                : 'bg-surface2 text-text-secondary'
            }`}
          >
            Consent
          </button>
          <button
            onClick={() => setActiveTab('rights')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'rights'
                ? 'bg-accent text-black'
                : 'bg-surface2 text-text-secondary'
            }`}
          >
            Your Rights
          </button>
        </div>

        {/* Consent Tab */}
        {activeTab === 'consent' && (
          <div className="space-y-4">
            <div className="bg-surface2 rounded-lg p-4 border border-border">
              <h3 className="font-semibold text-text-primary mb-2">Data We Collect</h3>
              <ul className="text-sm text-text-secondary space-y-1">
                <li>• Learning progress and quiz results</li>
                <li>• Financial IQ and streak data</li>
                <li>• Knowledge state for adaptive learning</li>
                <li>• Device identifier for session management</li>
              </ul>
            </div>

            <div className="bg-surface2 rounded-lg p-4 border border-border">
              <h3 className="font-semibold text-text-primary mb-2">How We Use Your Data</h3>
              <ul className="text-sm text-text-secondary space-y-1">
                <li>• Personalize learning content</li>
                <li>• Track your financial education journey</li>
                <li>• Provide adaptive difficulty</li>
                <li>• Improve our educational algorithms</li>
              </ul>
            </div>

            <div className="bg-warning/10 rounded-lg p-4 border border-warning/30">
              <div className="flex items-start gap-2">
                <AlertCircle className="text-warning flex-shrink-0 mt-0.5" size={16} />
                <div className="text-sm text-warning">
                  <div className="font-semibold mb-1">Important Notice</div>
                  <div>
                    We do NOT collect or process your actual financial data (bank accounts, investments, etc.). 
                    All financial calculations are performed locally on your device.
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface2 rounded-lg p-4 border border-border">
              <h3 className="font-semibold text-text-primary mb-2">30-Day Data Lag</h3>
              <p className="text-sm text-text-secondary">
                All market data shown in this app is 30+ days old as required by SEBI regulations for non-advisory platforms.
              </p>
            </div>

            {!hasConsent ? (
              <button
                onClick={handleGiveConsent}
                className="w-full py-3 bg-accent text-black font-semibold rounded-lg hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={18} />
                I Accept - Continue Learning
              </button>
            ) : (
              <button
                onClick={handleRevokeConsent}
                className="w-full py-3 bg-surface2 border border-border text-text-secondary font-semibold rounded-lg hover:bg-surface3 transition-colors"
              >
                Revoke Consent
              </button>
            )}
          </div>
        )}

        {/* Rights Tab */}
        {activeTab === 'rights' && (
          <div className="space-y-4">
            <div className="text-sm text-text-secondary mb-4">
              Under the Digital Personal Data Protection (DPDP) Act, you have the following rights:
            </div>

            <div className="space-y-3">
              <div className="bg-surface2 rounded-lg p-4 border border-border">
                <div className="flex items-start gap-3">
                  <FileText className="text-accent flex-shrink-0 mt-0.5" size={18} />
                  <div>
                    <div className="font-semibold text-text-primary mb-1">Right to Access</div>
                    <div className="text-sm text-text-secondary">
                      You can request a copy of all data we hold about you.
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-surface2 rounded-lg p-4 border border-border">
                <div className="flex items-start gap-3">
                  <Download className="text-accent flex-shrink-0 mt-0.5" size={18} />
                  <div>
                    <div className="font-semibold text-text-primary mb-1">Right to Portability</div>
                    <div className="text-sm text-text-secondary">
                      You can export your data in a machine-readable format.
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-surface2 rounded-lg p-4 border border-border">
                <div className="flex items-start gap-3">
                  <Trash className="text-warning flex-shrink-0 mt-0.5" size={18} />
                  <div>
                    <div className="font-semibold text-text-primary mb-1">Right to Erasure</div>
                    <div className="text-sm text-text-secondary">
                      You can request deletion of all your personal data.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleExportData}
                className="flex-1 py-3 bg-surface2 border border-border text-text-primary font-semibold rounded-lg hover:bg-surface3 transition-colors flex items-center justify-center gap-2"
              >
                <Download size={18} />
                Export Data
              </button>
              <button
                onClick={handleDeleteData}
                className="flex-1 py-3 bg-warning/20 border border-warning text-warning font-semibold rounded-lg hover:bg-warning/30 transition-colors flex items-center justify-center gap-2"
              >
                <Trash size={18} />
                Delete All Data
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
