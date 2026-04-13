"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { Flame, Award, Lock, CheckCircle2, Calendar } from "lucide-react";

interface StreakMilestone {
  days: number;
  reward: string;
  xp: number;
  badge: string;
}

const STREAK_MILESTONES: StreakMilestone[] = [
  { days: 3, reward: "Bronze Streaker", xp: 50, badge: "🥉" },
  { days: 7, reward: "Silver Streaker", xp: 100, badge: "🥈" },
  { days: 14, reward: "Gold Streaker", xp: 200, badge: "🥇" },
  { days: 30, reward: "Platinum Streaker", xp: 500, badge: "💎" },
  { days: 60, reward: "Diamond Streaker", xp: 1000, badge: "🏆" },
  { days: 100, reward: "Legendary Streaker", xp: 2000, badge: "👑" },
  { days: 365, reward: "Financial Champion", xp: 5000, badge: "🌟" },
];

export default function StreakMilestone() {
  const { streak, addXp, lastLoginDate } = useStore();
  const [nextMilestone, setNextMilestone] = useState<StreakMilestone | null>(null);
  const [progress, setProgress] = useState(0);
  const [unlockedMilestones, setUnlockedMilestones] = useState<StreakMilestone[]>([]);

  useEffect(() => {
    // Calculate unlocked milestones
    const unlocked = STREAK_MILESTONES.filter(m => streak >= m.days);
    setUnlockedMilestones(unlocked);

    // Find next milestone
    const next = STREAK_MILESTONES.find(m => streak < m.days);
    setNextMilestone(next || null);

    // Calculate progress to next milestone
    if (next) {
      const previousMilestone = STREAK_MILESTONES.find(m => m.days < next.days);
      const previousDays = previousMilestone ? previousMilestone.days : 0;
      const range = next.days - previousDays;
      const current = streak - previousDays;
      setProgress(Math.min(100, Math.max(0, (current / range) * 100)));
    } else {
      setProgress(100);
    }
  }, [streak]);

  const handleClaimReward = (milestone: StreakMilestone) => {
    addXp(milestone.xp);
    // In a real app, this would mark the milestone as claimed in the database
    alert(`🎉 Claimed ${milestone.reward} badge! +${milestone.xp} XP`);
  };

  return (
    <div className="bg-surface2 border border-border rounded-xl p-4 space-y-4">
      {/* Current Streak Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-warning/20 rounded-lg">
            <Flame className="text-warning" size={20} />
          </div>
          <div>
            <div className="text-2xl font-bold font-display text-warning">{streak}</div>
            <div className="text-xs text-muted">Day Streak</div>
          </div>
        </div>
        {lastLoginDate && (
          <div className="text-xs text-muted flex items-center gap-1">
            <Calendar size={12} />
            {new Date(lastLoginDate).toLocaleDateString()}
          </div>
        )}
      </div>

      {/* Progress to Next Milestone */}
      {nextMilestone && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted">Next Milestone</span>
            <span className="font-semibold text-accent">{nextMilestone.days} days</span>
          </div>
          <div className="w-full h-2 bg-surface1 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-warning to-accent transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xs text-muted text-center">
            {nextMilestone.badge} {nextMilestone.reward} (+{nextMilestone.xp} XP)
          </div>
        </div>
      )}

      {/* Milestone Grid */}
      <div className="grid grid-cols-3 gap-2">
        {STREAK_MILESTONES.map((milestone) => {
          const isUnlocked = streak >= milestone.days;
          const isNext = nextMilestone?.days === milestone.days;

          return (
            <div
              key={milestone.days}
              className={`p-3 rounded-lg border text-center transition-all ${
                isUnlocked
                  ? 'bg-accent/10 border-accent/50'
                  : isNext
                  ? 'bg-warning/10 border-warning/50'
                  : 'bg-surface/50 border-border/50'
              }`}
            >
              <div className="text-2xl mb-1">
                {isUnlocked ? milestone.badge : <Lock size={20} className="text-muted mx-auto" />}
              </div>
              <div className="text-xs font-semibold mb-1">
                {milestone.days}d
              </div>
              <div className="text-[10px] text-muted leading-tight">
                {milestone.reward}
              </div>
              {isUnlocked && (
                <button
                  onClick={() => handleClaimReward(milestone)}
                  className="mt-2 w-full py-1 bg-accent text-black text-[10px] font-bold rounded hover:bg-accent/90 transition-colors"
                >
                  Claim
                </button>
              )}
              {isNext && !isUnlocked && (
                <div className="mt-2 text-[10px] text-warning font-semibold">
                  Next
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Unlocked Milestones Summary */}
      {unlockedMilestones.length > 0 && (
        <div className="bg-accent/10 border border-accent/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Award className="text-accent" size={16} />
            <div className="text-xs font-semibold text-accent">Unlocked Badges</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {unlockedMilestones.map((milestone) => (
              <div
                key={milestone.days}
                className="px-2 py-1 bg-surface rounded text-xs flex items-center gap-1"
              >
                <span>{milestone.badge}</span>
                <span className="text-muted">{milestone.days}d</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Streak Tips */}
      <div className="text-xs text-muted text-center">
        <div className="flex items-center justify-center gap-1 mb-1">
          <CheckCircle2 size={12} className="text-accent" />
          <span className="font-semibold text-accent">Streak Tip</span>
        </div>
        <div>Complete at least one lesson daily to maintain your streak!</div>
      </div>
    </div>
  );
}
