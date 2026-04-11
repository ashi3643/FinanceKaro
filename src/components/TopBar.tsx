"use client";

import { useStore } from "@/lib/store";
import { useEffect } from "react";
import { Flame, Star } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";

export default function TopBar() {
  const { xp, streak, initDevice, updateStreak } = useStore();

  useEffect(() => {
    initDevice();
    updateStreak();
  }, [initDevice, updateStreak]);

  return (
    <div className="fixed top-0 w-full max-w-[420px] bg-bg/80 backdrop-blur-md z-50 px-4 py-3 flex justify-between items-center border-b border-border">
      <div className="font-display font-bold text-lg tracking-tight">
        Finance<span className="text-accent">Karo</span>
      </div>
      <div className="flex gap-2 items-center">
        <LanguageSwitcher />
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5 bg-surface2 px-2 py-1 rounded-full border border-border">
            <Flame size={16} className="text-accent2" fill="currentColor" />
            <span className="text-xs font-bold">{streak}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-surface2 px-2 py-1 rounded-full border border-border">
            <Star size={16} className="text-warning" fill="currentColor" />
            <span className="text-xs font-bold">{xp} XP</span>
          </div>
        </div>
      </div>
    </div>
  );
}
