"use client";

import { useState } from "react";
import { PieChart, TrendingDown, TrendingUp, AlertTriangle, Calculator, Target, PiggyBank, CreditCard, Home, Car, GraduationCap } from "lucide-react";

export default function BudgetExplainerPage() {
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

  const needsPercent = Math.round(((expenses.rent + expenses.food + expenses.transport) / salary) * 100);
  const wantsPercent = Math.round((expenses.entertainment / salary) * 100);
  const savingsPercent = Math.round(((expenses.savings + expenses.emergency) / salary) * 100);

  return (
    <div className="flex flex-col min-h-full py-4 space-y-6">
      <div className="flex justify-between items-end mb-2">
        <div>
          <span className="text-xs font-bold text-muted uppercase tracking-widest block mb-1">Master Your Money</span>
          <h1 className="text-3xl font-display font-extrabold flex items-center gap-2">Budget Explainer <Calculator className="text-accent"/></h1>
        </div>
      </div>

      {/* Interactive Budget Calculator */}
      <div className="bg-surface2/50 border border-border p-5 rounded-2xl">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-4 flex items-center gap-2">
          <Target size={16} />
          Your Budget Calculator
        </h3>

        <div className="space-y-4">
          {/* Salary Input */}
          <div className="bg-surface glass border border-border p-4 rounded-xl">
            <label className="block text-sm font-bold mb-2">Monthly Salary (₹)</label>
            <input
              type="number"
              value={salary}
              onChange={(e) => setSalary(Number(e.target.value))}
              className="w-full p-2 bg-bg border border-border rounded-lg text-text"
              placeholder="50000"
            />
          </div>

          {/* Expense Categories */}
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(expenses).map(([key, value]) => (
              <div key={key} className="bg-surface glass border border-border p-3 rounded-xl">
                <label className="block text-xs font-bold mb-1 capitalize">{key.replace('_', ' ')}</label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setExpenses({...expenses, [key]: Number(e.target.value)})}
                  className="w-full p-2 bg-bg border border-border rounded text-sm"
                />
              </div>
            ))}
          </div>

          {/* Results */}
          <div className="bg-surface glass border border-border p-4 rounded-xl">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold font-display">₹{totalExpenses.toLocaleString()}</div>
                <div className="text-xs text-muted">Total Expenses</div>
              </div>
              <div className={`text-2xl font-bold font-display ${remaining >= 0 ? 'text-accent' : 'text-accent2'}`}>
                ₹{remaining.toLocaleString()}
              </div>
              <div className="text-xs text-muted col-span-2">Remaining</div>
            </div>
          </div>
        </div>
      </div>

      {/* 50-30-20 Rule */}
      <div className="bg-surface2/50 border border-border p-5 rounded-2xl">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-4 flex items-center gap-2">
          <PieChart size={16} />
          The 50-30-20 Rule
        </h3>

        <div className="space-y-4">
          <div className="bg-surface glass border border-border p-4 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold">Needs (50%)</span>
              <span className="text-accent font-bold">{needsPercent}%</span>
            </div>
            <div className="w-full bg-border rounded-full h-2">
              <div className="bg-accent h-2 rounded-full" style={{width: `${Math.min(needsPercent * 2, 100)}%`}}></div>
            </div>
            <p className="text-xs text-muted mt-2">Rent, food, transport, utilities, minimum debt payments</p>
          </div>

          <div className="bg-surface glass border border-border p-4 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold">Wants (30%)</span>
              <span className="text-warning font-bold">{wantsPercent}%</span>
            </div>
            <div className="w-full bg-border rounded-full h-2">
              <div className="bg-warning h-2 rounded-full" style={{width: `${Math.min(wantsPercent * 10/3, 100)}%`}}></div>
            </div>
            <p className="text-xs text-muted mt-2">Entertainment, dining out, shopping, subscriptions</p>
          </div>

          <div className="bg-surface glass border border-border p-4 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold">Savings (20%)</span>
              <span className="text-accent font-bold">{savingsPercent}%</span>
            </div>
            <div className="w-full bg-border rounded-full h-2">
              <div className="bg-accent h-2 rounded-full" style={{width: `${Math.min(savingsPercent * 5, 100)}%`}}></div>
            </div>
            <p className="text-xs text-muted mt-2">Emergency fund, investments, debt payoff beyond minimums</p>
          </div>
        </div>
      </div>

      {/* Common Mistakes */}
      <div className="bg-surface2/50 border border-border p-5 rounded-2xl">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-4 flex items-center gap-2">
          <AlertTriangle size={16} />
          Budgeting Mistakes to Avoid
        </h3>

        <div className="space-y-3">
          <div className="bg-surface glass border border-border p-4 rounded-xl">
            <div className="flex gap-3">
              <div className="shrink-0 p-2 bg-accent2/20 text-accent2 rounded-lg">
                <CreditCard size={16} />
              </div>
              <div>
                <div className="font-bold">Lifestyle Inflation</div>
                <p className="text-xs text-muted mt-1">Don't increase expenses just because salary increased. Save the difference!</p>
              </div>
            </div>
          </div>

          <div className="bg-surface glass border border-border p-4 rounded-xl">
            <div className="flex gap-3">
              <div className="shrink-0 p-2 bg-accent2/20 text-accent2 rounded-lg">
                <PiggyBank size={16} />
              </div>
              <div>
                <div className="font-bold">No Emergency Fund</div>
                <p className="text-xs text-muted mt-1">3-6 months expenses saved can prevent debt during emergencies.</p>
              </div>
            </div>
          </div>

          <div className="bg-surface glass border border-border p-4 rounded-xl">
            <div className="flex gap-3">
              <div className="shrink-0 p-2 bg-accent2/20 text-accent2 rounded-lg">
                <Car size={16} />
              </div>
              <div>
                <div className="font-bold">Impulse Buying</div>
                <p className="text-xs text-muted mt-1">Wait 30 days before buying non-essential items over ₹1000.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Savings Goals */}
      <div className="bg-surface2/50 border border-border p-5 rounded-2xl">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-4 flex items-center gap-2">
          <Target size={16} />
          Smart Savings Goals
        </h3>

        <div className="space-y-3">
          <div className="bg-surface glass border border-border p-4 rounded-xl">
            <div className="flex gap-3">
              <div className="shrink-0 p-2 bg-accent/20 text-accent rounded-lg">
                <Home size={16} />
              </div>
              <div>
                <div className="font-bold">Down Payment Fund</div>
                <p className="text-xs text-muted mt-1">Save 20% of home value. For ₹50L home, save ₹10L first.</p>
              </div>
            </div>
          </div>

          <div className="bg-surface glass border border-border p-4 rounded-xl">
            <div className="flex gap-3">
              <div className="shrink-0 p-2 bg-accent/20 text-accent rounded-lg">
                <GraduationCap size={16} />
              </div>
              <div>
                <div className="font-bold">Education Fund</div>
                <p className="text-xs text-muted mt-1">Start early. ₹10k/month from age 25 can become ₹1Cr by 35.</p>
              </div>
            </div>
          </div>

          <div className="bg-surface glass border border-border p-4 rounded-xl">
            <div className="flex gap-3">
              <div className="shrink-0 p-2 bg-accent/20 text-accent rounded-lg">
                <PiggyBank size={16} />
              </div>
              <div>
                <div className="font-bold">Retirement Planning</div>
                <p className="text-xs text-muted mt-1">Start with 10% of salary. Compound interest is your best friend.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="bg-accent/10 border border-accent p-4 rounded-2xl text-center">
        <div className="text-accent font-bold mb-2">Ready to Master Your Budget?</div>
        <p className="text-xs text-muted mb-4">Track your expenses and watch your money grow</p>
        <button className="bg-accent text-bg px-6 py-2 rounded-lg font-bold hover:bg-accent/90 transition-colors">
          Start Tracking
        </button>
      </div>
    </div>
  );
}
