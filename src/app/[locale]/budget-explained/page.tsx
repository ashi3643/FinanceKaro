"use client";

import { useState } from "react";
import { PieChart, AlertTriangle, Calculator, Target, PiggyBank, CreditCard, Home, Car, GraduationCap } from "lucide-react";
import { useTranslations } from "next-intl";

export default function BudgetExplainerPage() {
  const t = useTranslations("budgetExplained");
  const [salary, setSalary] = useState(50000);
  const [expenses, setExpenses] = useState({
    rent: 15000,
    food: 8000,
    transport: 3000,
    entertainment: 5000,
    savings: 10000,
    emergency: 7000
  });

  const totalExpenses = Object.values(expenses).reduce((a, b) => a + b, 0);
  const remaining = salary - totalExpenses;

  const needsPercent = Math.round(((expenses.rent + expenses.food + expenses.transport) / Math.max(salary, 1)) * 100);
  const wantsPercent = Math.round((expenses.entertainment / Math.max(salary, 1)) * 100);
  const savingsPercent = Math.round(((expenses.savings + expenses.emergency) / Math.max(salary, 1)) * 100);

  return (
    <div className="flex flex-col min-h-full py-4 space-y-6">
      <div className="flex justify-between items-end mb-2">
        <div>
          <span className="text-xs font-bold text-muted uppercase tracking-widest block mb-1">{t("masterYourMoney")}</span>
          <h1 className="text-3xl font-display font-extrabold flex items-center gap-2">
            {t("budgetExplainer")} <Calculator className="text-accent" />
          </h1>
        </div>
      </div>

      <div className="bg-surface2/50 border border-border p-5 rounded-2xl">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-4 flex items-center gap-2">
          <Target size={16} />
          {t("yourBudgetCalculator")}
        </h3>

        <div className="space-y-4">
          <div className="bg-surface glass border border-border p-4 rounded-xl">
            <label className="block text-sm font-bold mb-2">{t("monthlySalary")} (INR)</label>
            <input
              type="number"
              value={salary}
              onChange={(e) => setSalary(Number(e.target.value))}
              aria-label="Monthly salary amount"
              className="w-full p-2 bg-bg border border-border rounded-lg text-text"
              placeholder="50000"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {Object.entries(expenses).map(([key, value]) => (
              <div key={key} className="bg-surface glass border border-border p-3 rounded-xl">
                <label className="block text-xs font-bold mb-1 capitalize">{key.replace("_", " ")}</label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setExpenses({ ...expenses, [key]: Number(e.target.value) })}
                  aria-label={`${key.replace("_", " ")} expense amount`}
                  className="w-full p-2 bg-bg border border-border rounded text-sm"
                />
              </div>
            ))}
          </div>

          <div className="bg-surface glass border border-border p-4 rounded-xl">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold font-display">INR {totalExpenses.toLocaleString()}</div>
                <div className="text-xs text-muted">{t("totalExpenses")}</div>
              </div>
              <div className={`text-2xl font-bold font-display ${remaining >= 0 ? "text-accent" : "text-accent2"}`}>
                INR {remaining.toLocaleString()}
              </div>
              <div className="text-xs text-muted col-span-2">{t("remaining")}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface2/50 border border-border p-5 rounded-2xl">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-4 flex items-center gap-2">
          <PieChart size={16} />
          {t("the503020Rule")}
        </h3>

        <div className="space-y-4">
          <div className="bg-surface glass border border-border p-4 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold">{t("needs")} (50%)</span>
              <span className="text-accent font-bold">{needsPercent}%</span>
            </div>
            <div className="w-full bg-border rounded-full h-2">
              <div className="bg-accent h-2 rounded-full" style={{ width: `${Math.min(needsPercent * 2, 100)}%` }} />
            </div>
          </div>

          <div className="bg-surface glass border border-border p-4 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold">{t("wants")} (30%)</span>
              <span className="text-warning font-bold">{wantsPercent}%</span>
            </div>
            <div className="w-full bg-border rounded-full h-2">
              <div className="bg-warning h-2 rounded-full" style={{ width: `${Math.min((wantsPercent * 10) / 3, 100)}%` }} />
            </div>
          </div>

          <div className="bg-surface glass border border-border p-4 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold">{t("savings")} (20%)</span>
              <span className="text-accent font-bold">{savingsPercent}%</span>
            </div>
            <div className="w-full bg-border rounded-full h-2">
              <div className="bg-accent h-2 rounded-full" style={{ width: `${Math.min(savingsPercent * 5, 100)}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface2/50 border border-border p-5 rounded-2xl">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-4 flex items-center gap-2">
          <AlertTriangle size={16} />
          {t("budgetingMistakes")}
        </h3>

        <div className="space-y-3">
          <div className="bg-surface glass border border-border p-4 rounded-xl">
            <div className="flex gap-3">
              <div className="shrink-0 p-2 bg-accent2/20 text-accent2 rounded-lg"><CreditCard size={16} /></div>
              <div>
                <div className="font-bold">{t("lifestyleInflation")}</div>
                <p className="text-xs text-muted mt-1">Do not increase expenses just because salary increased.</p>
              </div>
            </div>
          </div>

          <div className="bg-surface glass border border-border p-4 rounded-xl">
            <div className="flex gap-3">
              <div className="shrink-0 p-2 bg-accent2/20 text-accent2 rounded-lg"><PiggyBank size={16} /></div>
              <div>
                <div className="font-bold">{t("noEmergencyFund")}</div>
                <p className="text-xs text-muted mt-1">3-6 months of expenses can prevent debt during emergencies.</p>
              </div>
            </div>
          </div>

          <div className="bg-surface glass border border-border p-4 rounded-xl">
            <div className="flex gap-3">
              <div className="shrink-0 p-2 bg-accent2/20 text-accent2 rounded-lg"><Car size={16} /></div>
              <div>
                <div className="font-bold">{t("impulseBuying")}</div>
                <p className="text-xs text-muted mt-1">Wait before non-essential purchases and prioritize savings.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface2/50 border border-border p-5 rounded-2xl">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-4 flex items-center gap-2">
          <Target size={16} />
          {t("smartSavingsGoals")}
        </h3>

        <div className="space-y-3">
          <div className="bg-surface glass border border-border p-4 rounded-xl">
            <div className="flex gap-3">
              <div className="shrink-0 p-2 bg-accent/20 text-accent rounded-lg"><Home size={16} /></div>
              <div>
                <div className="font-bold">{t("downPaymentFund")}</div>
                <p className="text-xs text-muted mt-1">Build a dedicated down-payment corpus before taking home loans.</p>
              </div>
            </div>
          </div>

          <div className="bg-surface glass border border-border p-4 rounded-xl">
            <div className="flex gap-3">
              <div className="shrink-0 p-2 bg-accent/20 text-accent rounded-lg"><GraduationCap size={16} /></div>
              <div>
                <div className="font-bold">{t("educationFund")}</div>
                <p className="text-xs text-muted mt-1">Start early and invest consistently for long-term education goals.</p>
              </div>
            </div>
          </div>

          <div className="bg-surface glass border border-border p-4 rounded-xl">
            <div className="flex gap-3">
              <div className="shrink-0 p-2 bg-accent/20 text-accent rounded-lg"><PiggyBank size={16} /></div>
              <div>
                <div className="font-bold">{t("retirementPlanning")}</div>
                <p className="text-xs text-muted mt-1">Start with at least 10% of income and increase annually.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-accent/10 border border-accent p-4 rounded-2xl text-center">
        <div className="text-accent font-bold mb-2">{t("readyToMaster")}</div>
        <p className="text-sm text-muted mb-4">{t("trackExpenses")}</p>
        <button aria-label={t("startTracking")} className="bg-accent text-bg px-6 py-2 rounded-lg font-bold hover:bg-accent/90 transition-colors">
          {t("startTracking")}
        </button>
      </div>
    </div>
  );
}
