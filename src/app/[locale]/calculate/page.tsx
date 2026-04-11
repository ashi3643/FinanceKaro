"use client";

import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";
import { useTranslations } from "next-intl";

export default function CalculatePage() {
  const t = useTranslations("calculate");
  const [sipAmount, setSipAmount] = useState(500);
  const [years, setYears] = useState(5);
  const [expectedReturnPercent, setExpectedReturnPercent] = useState(12);

  const { futureValue, investedAmount, estReturns, cagrPercent } = useMemo(() => {
    const expectedReturn = expectedReturnPercent / 100;
    const n = 12;
    const r = expectedReturn / n;
    const months = years * n;

    const fv = sipAmount * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
    const invested = sipAmount * months;
    const returns = fv - invested;
    const cagr = years > 0 && invested > 0 ? (Math.pow(fv / invested, 1 / years) - 1) * 100 : 0;

    return {
      futureValue: fv,
      investedAmount: invested,
      estReturns: returns,
      cagrPercent: Math.max(0, cagr),
    };
  }, [expectedReturnPercent, sipAmount, years]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Math.round(val));

  return (
    <div className="flex flex-col min-h-full py-4 space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex justify-between items-end mb-2">
        <div>
          <span className="text-xs font-bold text-muted uppercase tracking-widest block mb-1">{t("realityCheck")}</span>
          <h1 className="text-3xl font-display font-extrabold">{t("sipCalculator")}</h1>
        </div>
      </div>

      <div className="bg-surface glass border border-border rounded-2xl p-5 shadow-sm shadow-accent/10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-accent/20 rounded-lg text-accent">
            <Calculator size={20} />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg">{t("sipMagicCurve")}</h2>
            <p className="text-xs text-muted">{t("sipHelper")}</p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted">{t("monthlySavings")}</span>
              <span className="font-bold font-mono text-accent">{formatCurrency(sipAmount)}</span>
            </div>
            <input
              type="range"
              min="100"
              max="10000"
              step="100"
              value={sipAmount}
              onChange={(e) => setSipAmount(Number(e.target.value))}
              className="w-full accent-accent h-1.5 bg-surface2 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted">{t("investmentPeriod")}</span>
              <span className="font-bold font-mono text-accent">{years} {t("yearsLabel")}</span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full accent-accent h-1.5 bg-surface2 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted">{t("expectedReturn")}</span>
              <span className="font-bold font-mono text-accent">{expectedReturnPercent}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="0.5"
              value={expectedReturnPercent}
              onChange={(e) => setExpectedReturnPercent(Number(e.target.value))}
              className="w-full accent-accent h-1.5 bg-surface2 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <div className="text-center mb-6">
            <div className="text-xs text-muted uppercase tracking-widest mb-1">{t("futureValue")}</div>
            <div className="text-4xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent3">
              {formatCurrency(futureValue)}
            </div>
          </div>

          <div className="flex h-4 rounded-full overflow-hidden w-full mb-3">
            <div className="bg-surface2 h-full transition-all duration-300" style={{ width: `${(investedAmount / futureValue) * 100}%` }} />
            <div className="bg-accent h-full transition-all duration-300" style={{ width: `${(estReturns / futureValue) * 100}%` }} />
          </div>
          <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
            <div className="text-muted flex items-center gap-1"><div className="w-2 h-2 bg-surface2 rounded-full" /> {t("totalInvestment")}: {formatCurrency(investedAmount)}</div>
            <div className="text-accent flex items-center gap-1"><div className="w-2 h-2 bg-accent rounded-full" /> {t("totalReturns")}: {formatCurrency(estReturns)}</div>
          </div>
          <div className="mt-4 p-3 rounded-xl border border-accent/30 bg-accent/10 text-sm flex items-center justify-between">
            <span className="text-muted">{t("cagrLabel")}</span>
            <span className="font-bold text-accent">{cagrPercent.toFixed(2)}%</span>
          </div>
        </div>
      </div>

      <div className="p-5 bg-surface2/50 rounded-2xl border border-border/50 text-center">
        <h3 className="text-[13px] font-bold uppercase tracking-widest text-muted mb-2">{t("shockingTruth")}</h3>
        <p className="text-sm italic text-muted">
          {t("truthPrefix")} <span className="text-accent font-bold">{formatCurrency(estReturns)}</span> {t("truthSuffix", { years })}
        </p>
      </div>
    </div>
  );
}
