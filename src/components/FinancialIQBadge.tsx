"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { getDKTModel } from "@/lib/dktModel";
import { Brain, TrendingUp, Award } from "lucide-react";

interface FinancialIQProps {
  showDetails?: boolean;
}

export default function FinancialIQBadge({ showDetails = false }: FinancialIQProps) {
  const { xp, streak, completedLessons } = useStore();
  const dktModel = getDKTModel();
  const [financialIQ, setFinancialIQ] = useState(0);
  const [financialAge, setFinancialAge] = useState(0);

  useEffect(() => {
    // Calculate Financial IQ based on multiple factors
    const calculateFinancialIQ = () => {
      try {
        const progress = dktModel.getOverallProgress();
        
        // Base score from knowledge mastery (0-40 points)
        const knowledgeScore = (progress?.averageMastery || 0) * 40;
        
        // XP contribution (0-30 points, capped at 10000 XP)
        const xpScore = Math.min(30, (xp / 10000) * 30);
        
        // Streak contribution (0-20 points, max 30 day streak)
        const streakScore = Math.min(20, (streak / 30) * 20);
        
        // Lesson completion contribution (0-10 points, max 50 lessons)
        const lessonScore = Math.min(10, ((completedLessons?.length || 0) / 50) * 10);
        
        // Total IQ score (0-100)
        const iq = Math.round(knowledgeScore + xpScore + streakScore + lessonScore);
        
        // Calculate financial age (1-100 years equivalent)
        // Financial age = IQ * 0.8 (roughly correlates)
        const age = Math.min(100, Math.max(1, Math.round(iq * 0.8)));
        
        setFinancialIQ(iq);
        setFinancialAge(age);
      } catch (error) {
        console.error('Error calculating Financial IQ:', error);
        // Set default values if calculation fails
        setFinancialIQ(0);
        setFinancialAge(0);
      }
    };

    calculateFinancialIQ();
  }, [xp, streak, completedLessons, dktModel]);

  const getIQLabel = (iq: number): string => {
    if (iq >= 90) return "Financial Genius";
    if (iq >= 80) return "Expert";
    if (iq >= 70) return "Advanced";
    if (iq >= 60) return "Proficient";
    if (iq >= 50) return "Intermediate";
    if (iq >= 40) return "Beginner";
    return "Novice";
  };

  const getIQColor = (iq: number): string => {
    if (iq >= 90) return "text-purple-500";
    if (iq >= 80) return "text-blue-500";
    if (iq >= 70) return "text-green-500";
    if (iq >= 60) return "text-yellow-500";
    if (iq >= 50) return "text-orange-500";
    return "text-red-500";
  };

  const iqLabel = getIQLabel(financialIQ);
  const iqColor = getIQColor(financialIQ);

  return (
    <div className="bg-surface2 border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="text-accent" size={20} />
          <span className="font-semibold text-sm">Financial IQ</span>
        </div>
        {showDetails && (
          <button
            onClick={() => {
              // Share functionality
              const shareText = `My Financial IQ is ${financialIQ} (${financialAge} years equivalent)! 🧠\n\nTrack your financial journey with FinanceSekho.`;
              if (navigator.share) {
                navigator.share({
                  title: 'My Financial IQ',
                  text: shareText,
                });
              } else {
                navigator.clipboard.writeText(shareText);
                alert('Copied to clipboard!');
              }
            }}
            className="text-xs text-accent hover:text-accent/80 flex items-center gap-1"
          >
            <TrendingUp size={14} />
            Share
          </button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className={`text-3xl font-bold font-display ${iqColor}`}>
            {financialIQ}
          </div>
          <div className="text-xs text-muted">IQ Score</div>
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold mb-1">{iqLabel}</div>
          <div className="text-xs text-muted">Financial Age: {financialAge} yrs</div>
          <div className="mt-2 w-full h-2 bg-surface1 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r from-accent to-accent/60 transition-all duration-300`}
              style={{ width: `${financialIQ}%` }}
            />
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
          <div className="text-center">
            <div className="text-lg font-bold text-accent">{xp}</div>
            <div className="text-[10px] text-muted uppercase tracking-wider">XP</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-warning">{streak}</div>
            <div className="text-[10px] text-muted uppercase tracking-wider">Day Streak</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-500">{completedLessons.length}</div>
            <div className="text-[10px] text-muted uppercase tracking-wider">Lessons</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-500">{dktModel?.getOverallProgress()?.conceptsLearned || 0}</div>
            <div className="text-[10px] text-muted uppercase tracking-wider">Mastered</div>
          </div>
        </div>
      )}

      {financialIQ >= 80 && (
        <div className="bg-accent/10 border border-accent/30 rounded-lg p-2 flex items-center gap-2">
          <Award className="text-accent" size={16} />
          <div className="text-xs text-accent font-medium">
            Congratulations! You're in the top 20% of financial learners.
          </div>
        </div>
      )}
    </div>
  );
}
