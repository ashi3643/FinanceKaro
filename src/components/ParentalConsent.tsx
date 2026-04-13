"use client";

import { useState, useEffect } from "react";
import { Shield, Check, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { useTranslations } from "next-intl";

export default function ParentalConsent() {
  const t = useTranslations("parentalConsent");
  const { persona } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [parentEmail, setParentEmail] = useState("");
  const [parentName, setParentName] = useState("");

  useEffect(() => {
    // Only show for junior persona (6-15 years)
    if (persona === 'junior') {
      const storedConsent = localStorage.getItem('parental-consent');
      if (!storedConsent) {
        setIsOpen(true);
      }
    }
  }, [persona]);

  const handleConsent = () => {
    if (!parentName.trim() || !parentEmail.trim()) {
      alert(t("validationError"));
      return;
    }

    // Store consent in localStorage and Supabase
    const consentData = {
      parentName: parentName.trim(),
      parentEmail: parentEmail.trim(),
      consentDate: new Date().toISOString(),
      deviceId: useStore.getState().deviceId
    };

    localStorage.setItem('parental-consent', JSON.stringify(consentData));
    setConsentGiven(true);
    setIsOpen(false);

    // TODO: Send to Supabase for compliance tracking
    console.log("Parental consent recorded:", consentData);
  };

  const handleDecline = () => {
    alert(t("declineMessage"));
    setIsOpen(false);
  };

  if (!isOpen || consentGiven || persona !== 'junior') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-surface1 rounded-2xl max-w-md w-full p-6 border border-border shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-full bg-accent/10">
            <Shield className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-text-primary">
              {t("title")}
            </h2>
            <p className="text-sm text-text-secondary">
              {t("subtitle")}
            </p>
          </div>
        </div>

        {/* Explanation */}
        <div className="bg-surface2 rounded-lg p-4 mb-4 border border-border">
          <p className="text-sm text-text-secondary leading-relaxed">
            {t("explanation")}
          </p>
        </div>

        {/* Form */}
        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              {t("parentNameLabel")}
            </label>
            <input
              type="text"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              placeholder={t("parentNamePlaceholder")}
              className="w-full px-4 py-2 rounded-lg border border-border bg-surface2 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              {t("parentEmailLabel")}
            </label>
            <input
              type="email"
              value={parentEmail}
              onChange={(e) => setParentEmail(e.target.value)}
              placeholder={t("parentEmailPlaceholder")}
              className="w-full px-4 py-2 rounded-lg border border-border bg-surface2 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        {/* Privacy Note */}
        <div className="text-xs text-text-tertiary mb-4">
          <p>{t("privacyNote")}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleDecline}
            className="flex-1 px-4 py-2 rounded-lg border border-border text-text-secondary hover:bg-surface2 transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            {t("decline")}
          </button>
          <button
            onClick={handleConsent}
            className="flex-1 px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            {t("consent")}
          </button>
        </div>
      </div>
    </div>
  );
}
