"use client";

import { Shield, Info, Mail, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="mt-auto py-6 px-4 border-t border-border bg-surface2">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Trust Center */}
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <Shield className="w-4 h-4 text-accent" />
          <span className="font-semibold">{t("trustCenter")}</span>
        </div>

        {/* SEBI/RBI Disclaimer */}
        <div className="bg-surface1 rounded-lg p-4 border border-border">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div className="space-y-2 text-xs text-text-secondary">
              <p className="font-semibold text-text-primary">
                {t("disclaimerTitle")}
              </p>
              <p>{t("disclaimerText")}</p>
              <p className="text-[10px] text-text-tertiary">
                {t("dataLagNotice")}
              </p>
            </div>
          </div>
        </div>

        {/* About & Contact */}
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2 text-text-secondary">
            <Info className="w-4 h-4" />
            <span>{t("aboutText")}</span>
          </div>
          <div className="flex items-center gap-2 text-text-secondary">
            <Mail className="w-4 h-4" />
            <span>support@financesekho.com</span>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-[10px] text-text-tertiary pt-2 border-t border-border">
          {t("copyright")}
        </div>
      </div>
    </footer>
  );
}
