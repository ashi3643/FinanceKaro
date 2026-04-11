"use client";

import { ArrowRight, CheckCircle2, TrendingUp, ShieldAlert, BookOpen } from "lucide-react";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";

export default function Home() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();
  const { language, setLanguage, setStage } = useStore();
  const [selectedStage, setSelectedStageLocal] = useState<"Student" | "First-Jobber" | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = async () => {
    if (selectedStage) {
      setIsLoading(true);
      setStage(selectedStage);
      await router.push(`/${locale}/learn`);
    }
  };

  const handleLanguageChange = (code: string) => {
    setLanguage(code);
    router.push(`/${code}`);
  };

  const languages = [
    { code: "en", label: "English" },
    { code: "hi", label: "Hindi" },
    { code: "te", label: "Telugu" },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-120px)] px-4 sm:px-5 py-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <section className="relative mt-2 sm:mt-4 overflow-hidden">
        <div className="hidden md:block absolute -top-20 -right-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
        <div className="hidden md:block absolute top-20 -left-20 w-48 h-48 bg-accent3/10 rounded-full blur-3xl" />

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-widest mb-4 sm:mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          V1 PRD Launch
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-[1.2] mb-4 sm:mb-5 font-display text-balance text-white">
          {t("home.heroTitle")}
        </h1>

        <p className="text-muted text-sm sm:text-base leading-relaxed max-w-sm mb-2 text-balance">
          {t("home.heroSubtitle")}
        </p>
        <p className="text-text/80 font-medium text-xs sm:text-sm border-l-2 border-accent pl-3 italic mb-6 sm:mb-8">
          {t("home.heroFact")}
        </p>
      </section>

      <section className="space-y-3 z-10 relative">
        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-muted">{t("home.pickLanguage")}</h3>
        <div className="grid grid-cols-3 gap-2" role="group" aria-label="Language Selection">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              aria-label={`Select ${lang.label}`}
              aria-pressed={language === lang.code}
              className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all border min-h-[44px] flex items-center justify-center ${
                language === lang.code
                  ? "bg-accent/10 border-accent/50 text-accent shadow-sm shadow-accent/20"
                  : "bg-surface border-border hover:border-accent/40 text-text/90 active:bg-accent/5"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3 z-10 relative">
        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-muted">{t("home.whoAreYou")}</h3>
        <div className="flex flex-col gap-3" role="group" aria-label="User Type Selection">
          <button
            onClick={() => setSelectedStageLocal("Student")}
            aria-pressed={selectedStage === "Student"}
            aria-label="I'm a Student: Pocket money and survival"
            className={`flex items-center gap-3 p-4 rounded-lg sm:rounded-xl border transition-all min-h-[60px] active:scale-95 ${
              selectedStage === "Student"
                ? "bg-accent/10 border-accent/50 shadow-sm shadow-accent/20"
                : "bg-surface border-border hover:border-accent/40 active:bg-accent/5"
            }`}
          >
            <div className={`p-2 rounded-lg flex-shrink-0 ${
              selectedStage === "Student" ? "bg-accent/20 text-accent" : "bg-surface2 text-muted"
            }`}>
              <BookOpen size={20} aria-hidden="true" />
            </div>
            <div className="text-left">
              <div className={`font-bold text-sm ${
                selectedStage === "Student" ? "text-accent" : "text-text"
              }`}>{t("home.imStudent")}</div>
              <div className="text-xs text-muted">{t("home.studentDesc")}</div>
            </div>
          </button>

          <button
            onClick={() => setSelectedStageLocal("First-Jobber")}
            aria-pressed={selectedStage === "First-Jobber"}
            aria-label="First Jobber: Salary, taxes, building wealth"
            className={`flex items-center gap-3 p-4 rounded-lg sm:rounded-xl border transition-all min-h-[60px] active:scale-95 ${
              selectedStage === "First-Jobber"
                ? "bg-accent3/10 border-accent3/50 shadow-sm shadow-accent3/20"
                : "bg-surface border-border hover:border-accent3/40 active:bg-accent3/5"
            }`}
          >
            <div className={`p-2 rounded-lg flex-shrink-0 ${
              selectedStage === "First-Jobber" ? "bg-accent3/20 text-accent3" : "bg-surface2 text-muted"
            }`}>
              <TrendingUp size={20} aria-hidden="true" />
            </div>
            <div className="text-left">
              <div className={`font-bold text-sm ${
                selectedStage === "First-Jobber" ? "text-accent3" : "text-text"
              }`}>{t("home.firstJobber")}</div>
              <div className="text-xs text-muted">{t("home.jobberDesc")}</div>
            </div>
          </button>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 z-10 relative">
        <article className="bg-surface border border-border rounded-lg sm:rounded-xl p-4 hover:border-accent/40 transition-colors" aria-label="500 plus active users">
          <CheckCircle2 className="text-accent mb-2" size={24} aria-hidden="true" />
          <div className="text-xs text-muted/70 uppercase tracking-wider mb-1 font-semibold">{t("home.users")}</div>
          <div className="text-lg sm:text-xl font-bold font-display text-white">500+</div>
        </article>
        <article className="bg-surface border border-border rounded-lg sm:rounded-xl p-4 hover:border-warning/40 transition-colors" aria-label="10 thousand 402 scams busted">
          <ShieldAlert className="text-warning mb-2" size={24} aria-hidden="true" />
          <div className="text-xs text-muted/70 uppercase tracking-wider mb-1 font-semibold">{t("home.scamsBusted")}</div>
          <div className="text-lg sm:text-xl font-bold font-display text-white">10,402</div>
        </article>
      </div>

      <div className="fixed bottom-[72px] left-0 right-0 sm:bottom-auto sm:static sm:mt-auto pt-4 pb-4 px-4 sm:px-0 z-30 bg-gradient-to-t from-bg via-bg to-transparent sm:bg-none">
        <button
          onClick={handleStart}
          disabled={!selectedStage || isLoading}
          aria-label={selectedStage ? "Start Learning" : "Select a user type to continue"}
          className={`w-full py-4 rounded-lg sm:rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 transition-all min-h-[48px] ${
            selectedStage && !isLoading
              ? "bg-accent text-black hover:scale-[1.02] hover:shadow-lg shadow-accent/30 active:scale-95"
              : "bg-surface2/50 text-muted/70 cursor-not-allowed"
          }`}
        >
          {isLoading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Loading...
            </>
          ) : (
            <>
              {t("home.startLearning")}
              <ArrowRight size={20} aria-hidden="true" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
