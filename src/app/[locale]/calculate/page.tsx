"use client";

import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";
import { useTranslations } from "next-intl";
import RegulatoryDisclaimer from "@/components/RegulatoryDisclaimer";


export default function CalculatePage() {
  const t = useTranslations("calculate");
  const [sipAmount, setSipAmount] = useState(500);
  const [years, setYears] = useState(5);
  const [expectedReturnPercent, setExpectedReturnPercent] = useState(12);

  // Move formatCurrency above useMemo
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Math.round(val));

  const { futureValue, investedAmount, estReturns, cagrPercent } = useMemo(() => {
    const expectedReturn = expectedReturnPercent / 100;
    const n = 12;
    const r = expectedReturn / n;
    const months = years * n;

    const fv = sipAmount * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
    const invested = sipAmount * months;
    const returns = fv - invested;
    // CAGR should match the expected return rate for SIP calculations
    const cagr = expectedReturnPercent;

    return {
      futureValue: fv,
      investedAmount: invested,
      estReturns: returns,
      cagrPercent: cagr,
    };
  }, [expectedReturnPercent, sipAmount, years]);

  const getDynamicInsight = useMemo(() => {
    const monthlyInvestment = sipAmount;
    const totalYears = years;

    // Calculate equivalent values for context
    const annualCollegeFee = 120000; // Average annual college fee
    const yearsOfCollege = Math.floor(estReturns / annualCollegeFee);

    const carPrice = 800000; // Average car price
    const carsPossible = Math.floor(estReturns / carPrice);

    const monthlyRent = 15000; // Average monthly rent in metro
    const yearsOfRent = Math.floor(estReturns / (monthlyRent * 12));

    const inflationRate = 0.06; // 6% inflation
    const inflationAdjusted = estReturns / Math.pow(1 + inflationRate, totalYears);

    if (yearsOfCollege >= 2) {
      return {
        icon: "🎓",
        title: "College Fund Ready!",
        description: `This covers ${yearsOfCollege} years of college tuition (₹1.2L/year)`
      };
    } else if (carsPossible >= 1) {
      return {
        icon: "🚗",
        title: "Dream Car Achievable!",
        description: `You could buy ${carsPossible} cars worth ₹8L each`
      };
    } else if (yearsOfRent >= 1) {
      return {
        icon: "🏠",
        title: "Rent-Free Living!",
        description: `This covers ${yearsOfRent} years of metro rent (₹15K/month)`
      };
    } else {
      return {
        icon: "📈",
        title: "Inflation Beater!",
        description: `You've beaten inflation by ₹${formatCurrency(estReturns - inflationAdjusted)}`
      };
    }
  }, [estReturns, sipAmount, years]);

  return (
    <div className="flex flex-col min-h-full py-6 space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <RegulatoryDisclaimer type="investment" position="top" />
      
      {/* Section: Header */}
      <header className="mb-2">
        <span className="text-xs font-bold text-muted uppercase tracking-widest block mb-1">{t("realityCheck")}</span>
        <h1 className="text-3xl font-display font-extrabold">{t("sipCalculator")}</h1>
      </header>

      {/* Section: Inputs */}
      <section className="bg-surface glass border border-border rounded-2xl p-5 shadow-sm shadow-accent/10 space-y-7">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-accent/20 rounded-lg text-accent">
            <Calculator size={20} />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg">{t("sipMagicCurve")}</h2>
            <p className="text-xs text-muted">{t("sipHelper")}</p>
          </div>
        </div>

        {/* Input: Monthly Investment */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold mb-1" htmlFor="sipAmount">{t("monthlySavings")}</label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">100</span>
            <input
              id="sipAmount"
              type="range"
              min="100"
              max="10000"
              step="100"
              value={sipAmount}
              onChange={(e) => setSipAmount(Number(e.target.value))}
              aria-label="Monthly savings amount"
              className="flex-1 accent-accent h-2 bg-surface2 rounded-lg appearance-none cursor-pointer slider-glow"
            />
            <span className="text-xs text-muted">10,000</span>
            <input
              type="number"
              min={100}
              max={10000}
              step={100}
              value={sipAmount}
              onChange={e => setSipAmount(Math.max(100, Math.min(10000, Number(e.target.value))))}
              className="w-24 px-2 py-1 rounded border border-border bg-surface2 text-right font-mono text-sm focus:outline-accent"
              aria-label="Monthly investment input"
            />
          </div>
        </div>

        {/* Input: Investment Period */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold mb-1" htmlFor="years">{t("investmentPeriod")}</label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">1</span>
            <input
              id="years"
              type="range"
              min="1"
              max="30"
              step="1"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              aria-label="Investment period in years"
              className="flex-1 accent-accent h-2 bg-surface2 rounded-lg appearance-none cursor-pointer slider-glow"
            />
            <span className="text-xs text-muted">30</span>
            <input
              type="number"
              min={1}
              max={30}
              step={1}
              value={years}
              onChange={e => setYears(Math.max(1, Math.min(30, Number(e.target.value))))}
              className="w-16 px-2 py-1 rounded border border-border bg-surface2 text-right font-mono text-sm focus:outline-accent"
              aria-label="Investment period input"
            />
            <span className="text-xs text-muted">{t("yearsLabel")}</span>
          </div>
        </div>

        {/* Input: Expected Return */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold mb-1" htmlFor="expectedReturn">{t("expectedReturn")}</label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">1%</span>
            <input
              id="expectedReturn"
              type="range"
              min="1"
              max="20"
              step="0.5"
              value={expectedReturnPercent}
              onChange={(e) => setExpectedReturnPercent(Number(e.target.value))}
              aria-label="Expected annual return percentage"
              className="flex-1 accent-accent h-2 bg-surface2 rounded-lg appearance-none cursor-pointer slider-glow"
            />
            <span className="text-xs text-muted">20%</span>
            <input
              type="number"
              min={1}
              max={20}
              step={0.5}
              value={expectedReturnPercent}
              onChange={e => setExpectedReturnPercent(Math.max(1, Math.min(20, Number(e.target.value))))}
              className="w-16 px-2 py-1 rounded border border-border bg-surface2 text-right font-mono text-sm focus:outline-accent"
              aria-label="Expected return input"
            />
            <span className="text-xs text-muted">%</span>
          </div>
        </div>
      </section>

      {/* Section: Results */}
      <section className="space-y-6">
        <div className="rounded-2xl shadow-lg bg-gradient-to-br from-accent/10 to-accent3/10 border border-accent/30 p-6 flex flex-col items-center">
          <div className="text-xs text-muted uppercase tracking-widest mb-1">{t("futureValue")}</div>
          <div className="text-5xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent3 drop-shadow-lg mb-2">
            {formatCurrency(futureValue)}
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
          <div className="flex-1 rounded-xl bg-surface2/80 border border-border/60 p-4 flex flex-col items-center shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-surface2 rounded-full" />
              <span className="text-xs text-muted uppercase font-semibold tracking-wider">{t("totalInvestment")}</span>
            </div>
            <div className="font-mono text-lg font-bold text-muted">{formatCurrency(investedAmount)}</div>
          </div>
          <div className="flex-1 rounded-xl bg-accent/10 border border-accent/30 p-4 flex flex-col items-center shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-accent rounded-full" />
              <span className="text-xs text-accent uppercase font-semibold tracking-wider">{t("totalReturns")}</span>
            </div>
            <div className="font-mono text-lg font-bold text-accent">{formatCurrency(estReturns)}</div>
          </div>
        </div>
        <div className="mt-2 p-3 rounded-xl border border-accent/30 bg-accent/10 text-sm flex items-center justify-between">
          <span className="text-muted font-medium">{t("cagrLabel")}</span>
          <span className="font-bold text-accent text-base">{cagrPercent.toFixed(1)}%</span>
        </div>
      </section>

      {/* Section: Insights */}
      <section className="p-5 bg-surface2/50 rounded-2xl border border-border/50">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">{getDynamicInsight.icon}</span>
          <div>
            <h3 className="text-sm font-bold text-white">{getDynamicInsight.title}</h3>
            <p className="text-xs text-muted">{getDynamicInsight.description}</p>
          </div>
        </div>
        <div className="text-center pt-2 border-t border-border/30">
          <p className="text-xs italic text-muted">
            {t("truthPrefix")} <span className="text-accent font-bold">{formatCurrency(estReturns)}</span> {t("truthSuffix", { years })}
          </p>
        </div>
      </section>
    </div>
  );
}
