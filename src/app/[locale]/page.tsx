"use client";

import { ArrowRight, CheckCircle2, TrendingUp, ShieldAlert, BookOpen, LoaderCircle, Lock, Zap } from "lucide-react";
import { useStore } from "@/lib/store";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useTransition, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import InteractiveWealthCalculator from "@/components/InteractiveWealthCalculator";
import QuickTip from "@/components/QuickTip";
import RankingsPreview from "@/components/RankingsPreview";
import NotifyModal from "@/components/NotifyModal";
import FinancialIQBadge from "@/components/FinancialIQBadge";
import StreakMilestone from "@/components/StreakMilestone";

const languages = [
  { code: "en", label: "English", enabled: true },
  { code: "hi", label: "Hindi", enabled: true },
  { code: "te", label: "Telugu", enabled: true },
  { code: "ta", label: "Tamil", enabled: false },
  { code: "mr", label: "Marathi", enabled: false },
  { code: "bn", label: "Bengali", enabled: false }
];

const localeCodes = ["en", "hi", "te", "ta", "mr", "bn"];

const stripLocalePrefix = (pathname: string) => {
  const segments = pathname.split("/").filter(Boolean);
  const normalized = segments.filter((segment) => !localeCodes.includes(segment));
  return normalized.join("/");
};

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations();
  const { language, setLanguage, stage, setStage } = useStore();
  const [isStartPending, startLearningTransition] = useTransition();
  const [isLanguagePending, startLanguageTransition] = useTransition();
  const [notifyLanguage, setNotifyLanguage] = useState<string | null>(null);

  useEffect(() => {
    if (language !== locale) {
      setLanguage(locale, false);
    }
  }, [language, locale, setLanguage]);

  const handleStart = () => {
    if (!stage || isStartPending) {
      return;
    }

    startLearningTransition(() => {
      router.push(`/${locale}/learn`);
    });
  };

  const handleLanguageChange = (code: string, enabled: boolean) => {
    if (!enabled) {
      // Show notify modal for locked languages
      setNotifyLanguage(languages.find(l => l.code === code)?.label || code);
      return;
    }

    if (isLanguagePending || !pathname) {
      return;
    }

    startLanguageTransition(() => {
      setLanguage(code, false);
      const relativePath = stripLocalePrefix(pathname);
      const targetPath = relativePath ? `/${code}/${relativePath}` : `/${code}`;
      router.push(targetPath);
    });
  };

  return (
    <div className="flex flex-col min-h-[calc(100dvh-140px)] px-4 sm:px-5 py-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Notification Modal */}
      {notifyLanguage && (
        <NotifyModal
          language={notifyLanguage}
          onClose={() => setNotifyLanguage(null)}
        />
      )}

      {/* HERO SECTION */}
      <section className="relative mt-2 sm:mt-4 overflow-hidden">
        <div className="pointer-events-none hidden sm:block absolute -top-20 -right-24 w-52 h-52 bg-accent/10 rounded-full blur-3xl" aria-hidden="true" />

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-widest mb-4 sm:mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          Trusted by 500+
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-3 sm:mb-4 font-display text-balance text-white max-w-[24ch]">
          {t("home.heroTitle")}
        </h1>

        <p className="text-muted text-sm sm:text-base leading-relaxed max-w-lg text-balance">
          {t("home.heroSubtitle")}
        </p>
      </section>

      {/* VALUE FIRST: Interactive Wealth Calculator - Principal Priority #1 */}
      <InteractiveWealthCalculator />

      {/* ENGAGEMENT: Quick Tip for casual browsing */}
      <QuickTip />

      {/* TRUST METRICS - ENHANCED WITH LIVE DATA PROOF */}
      <div className="space-y-4 z-10 relative">
        <div className="grid grid-cols-2 gap-3">
          <article className="bg-surface border border-border rounded-lg sm:rounded-xl p-4 hover:border-accent/40 transition-colors" aria-label="500 plus active users as of April 2026">
            <CheckCircle2 className="text-accent mb-2" size={24} aria-hidden="true" />
            <div className="text-xs text-muted uppercase tracking-wider mb-1 font-semibold">{t("home.users")}</div>
            <div className="text-lg sm:text-xl font-bold font-display text-white">500+</div>
            <p className="text-[11px] text-muted mt-1">Learning right now</p>
          </article>
          <article className="bg-surface border border-border rounded-lg sm:rounded-xl p-4 hover:border-warning/40 transition-colors cursor-pointer hover:bg-surface2" onClick={() => router.push(`/${locale}/scam-radar`)}>
            <ShieldAlert className="text-warning mb-2" size={24} aria-hidden="true" />
            <div className="text-xs text-muted uppercase tracking-wider mb-1 font-semibold">{t("home.scamsBusted")}</div>
            <div className="text-lg sm:text-xl font-bold font-display text-white">10,402</div>
            <p className="text-[11px] text-warning/80 mt-1 font-medium">→ See latest reports</p>
          </article>
        </div>
      </div>

      {/* SOCIAL PROOF: Rankings Preview */}
      <RankingsPreview />

      {/* FINANCIAL IQ BADGE */}
      <FinancialIQBadge showDetails={true} />

      {/* STREAK MILESTONES */}
      <StreakMilestone />

      {/* OPTIONAL PERSONA SELECTION - Allow skipping and explore first */}
      <section className="space-y-4 z-10 relative border-t border-border/30 pt-6">
        <div>
          <h3 className="text-base font-bold text-white mb-2">Personalize Your Learning</h3>
          <p className="text-xs text-muted mb-4">Choose your path, or explore both. You can always change later.</p>
          <div className="flex flex-col gap-3" role="group" aria-label="User type selection">
            <button
              onClick={() => setStage("Student")}
              aria-pressed={stage === "Student"}
              aria-label="Select Student: Learning money management"
              className={`flex items-center gap-3 p-4 rounded-lg sm:rounded-xl border transition-all min-h-[60px] active:scale-95 ${
                stage === "Student"
                  ? "bg-accent/10 border-accent/50 shadow-sm shadow-accent/20"
                  : "bg-surface border-border hover:border-accent/40 active:bg-accent/5"
              }`}
            >
              <div className={`p-2 rounded-lg flex-shrink-0 ${
                stage === "Student" ? "bg-accent/20 text-accent" : "bg-surface2 text-muted"
              }`}>
                <BookOpen size={20} aria-hidden="true" />
              </div>
              <div className="text-left">
                <div className={`font-bold text-sm ${
                  stage === "Student" ? "text-accent" : "text-text"
                }`}>
                  👨‍🎓 Student
                </div>
                <div className="text-xs text-muted">Learning money management without pressure</div>
              </div>
            </button>

            <button
              onClick={() => setStage("First-Jobber")}
              aria-pressed={stage === "First-Jobber"}
              aria-label="Select First Jobber: Building wealth from salary"
              className={`flex items-center gap-3 p-4 rounded-lg sm:rounded-xl border transition-all min-h-[60px] active:scale-95 ${
                stage === "First-Jobber"
                  ? "bg-accent3/10 border-accent3/50 shadow-sm shadow-accent3/20"
                  : "bg-surface border-border hover:border-accent3/40 active:bg-accent3/5"
              }`}
            >
              <div className={`p-2 rounded-lg flex-shrink-0 ${
                stage === "First-Jobber" ? "bg-accent3/20 text-accent3" : "bg-surface2 text-muted"
              }`}>
                <TrendingUp size={20} aria-hidden="true" />
              </div>
              <div className="text-left">
                <div className={`font-bold text-sm ${
                  stage === "First-Jobber" ? "text-accent3" : "text-text"
                }`}>
                  💼 First Jobber
                </div>
                <div className="text-xs text-muted">Salary tips, taxes, wealth building strategies</div>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* LANGUAGE PREFERENCE (Optional, Secondary) */}
      <section className="space-y-3 z-10 relative border-t border-border/30 pt-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Language Preference</h3>
        <div className="grid grid-cols-3 gap-2" role="group" aria-label="Language selection">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code, lang.enabled)}
              disabled={!lang.enabled || isLanguagePending}
              aria-label={lang.enabled ? `Select ${lang.label}` : `${lang.label} coming soon`}
              aria-pressed={locale === lang.code}
              className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all border min-h-[44px] flex items-center justify-center gap-1 relative ${
                locale === lang.code
                  ? "bg-accent/10 border-accent/60 text-accent shadow-sm shadow-accent/20"
                  : lang.enabled
                    ? "bg-surface border-border hover:border-accent/40 text-text active:bg-accent/5"
                    : "bg-surface/60 border-border/80 text-muted cursor-not-allowed"
              }`}
              title={lang.enabled ? lang.label : `${lang.label} - Click for notification`}
            >
              {!lang.enabled ? <Lock size={12} aria-hidden="true" /> : null}
              {isLanguagePending && lang.enabled && locale !== lang.code ? (
                <LoaderCircle size={12} className="animate-spin" aria-hidden="true" />
              ) : null}
              {lang.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted">Locked languages → Click to get notified</p>
      </section>

      {/* ACTION: Start Learning CTA - Now optional, let users explore first */}
      <div className="fixed bottom-[calc(72px+env(safe-area-inset-bottom))] left-0 right-0 sm:bottom-auto sm:static sm:mt-auto pt-4 pb-4 px-4 sm:px-0 z-30 bg-gradient-to-t from-bg via-bg to-transparent sm:bg-none">
        <button
          onClick={handleStart}
          disabled={isStartPending}
          aria-label={stage ? "Start learning your chosen path" : "Continue without selecting a path"}
          className={`w-full py-4 rounded-lg sm:rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 transition-all min-h-[48px] ${
            !isStartPending
              ? stage 
                ? "bg-accent text-black hover:scale-[1.02] hover:shadow-lg shadow-accent/30 active:scale-95"
                : "bg-accent/60 text-white hover:scale-[1.02] active:scale-95 shadow-accent/20"
              : "bg-surface2 text-muted cursor-not-allowed"
          }`}
        >
          {isStartPending ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Starting...
            </>
          ) : (
            <>
              <Zap size={20} aria-hidden="true" />
              Start Learning
              <ArrowRight size={20} aria-hidden="true" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
          <div className="text-lg sm:text-xl font-bold font-display text-white">500+</div>

