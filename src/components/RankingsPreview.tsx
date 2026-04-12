'use client';

import { useCallback, useEffect, useState } from 'react';
import { Trophy, ArrowRight, Medal, LoaderCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';

interface CollegeRank {
  college: string;
  total_xp: number;
  students: number;
  rank?: number;
}

const localeCodes = ['en', 'hi', 'te', 'ta', 'mr', 'bn'];
const stripLocalePrefix = (pathname: string) => {
  const segments = pathname.split('/').filter(Boolean);
  return segments.filter((segment) => !localeCodes.includes(segment)).join('/');
};

export default function RankingsPreview() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('home');
  const [topColleges, setTopColleges] = useState<CollegeRank[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);

  const loadTopRankings = useCallback(async () => {
    setLoading(true);
    
    if (!supabase) {
      // Show fallback data if Supabase unavailable
      setTopColleges([
        { college: 'IIT Delhi', total_xp: 45230, students: 342, rank: 1 },
        { college: 'Delhi University', total_xp: 38912, students: 521, rank: 2 },
        { college: 'Ashoka University', total_xp: 31245, students: 198, rank: 3 }
      ]);
      setLoading(false);
      return;
    }

    try {
      // Query profiles table directly and aggregate data
      const { data, error } = await supabase
        .from('profiles')
        .select('college, xp')
        .not('college', 'is', null)
        .neq('college', '');

      if (!error && data && Array.isArray(data)) {
        // Aggregate data by college
        const collegeMap = new Map<string, { total_xp: number; students: number }>();
        
        data.forEach(profile => {
          const college = profile.college;
          if (collegeMap.has(college)) {
            const existing = collegeMap.get(college)!;
            existing.total_xp += profile.xp || 0;
            existing.students += 1;
          } else {
            collegeMap.set(college, { total_xp: profile.xp || 0, students: 1 });
          }
        });

        // Convert to array and sort
        const aggregatedData = Array.from(collegeMap.entries())
          .map(([college, stats]) => ({ college, ...stats }))
          .sort((a, b) => b.total_xp - a.total_xp)
          .slice(0, 3);

        const rankedData = aggregatedData.map((item, index) => ({
          ...item,
          rank: index + 1
        }));
        
        setTopColleges(rankedData.length > 0 ? rankedData : [
          { college: 'IIT Delhi', total_xp: 45230, students: 342, rank: 1 },
          { college: 'Delhi University', total_xp: 38912, students: 521, rank: 2 },
          { college: 'Ashoka University', total_xp: 31245, students: 198, rank: 3 }
        ]);
      } else {
        // Fallback data
        setTopColleges([
          { college: 'IIT Delhi', total_xp: 45230, students: 342, rank: 1 },
          { college: 'Delhi University', total_xp: 38912, students: 521, rank: 2 },
          { college: 'Ashoka University', total_xp: 31245, students: 198, rank: 3 }
        ]);
      }
    } catch {
      // Fallback on error
      setTopColleges([
        { college: 'IIT Delhi', total_xp: 45230, students: 342, rank: 1 },
        { college: 'Delhi University', total_xp: 38912, students: 521, rank: 2 },
        { college: 'Ashoka University', total_xp: 31245, students: 198, rank: 3 }
      ]);
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadTopRankings();
    }, 500);
    return () => clearTimeout(timer);
  }, [loadTopRankings]);

  const handleViewRankings = () => {
    setIsNavigating(true);
    router.push(`/${locale}/rankings`);
  };

  const getRankBadge = (rank: number) => {
    const badges = {
      1: { emoji: '🥇', color: 'text-yellow-500' },
      2: { emoji: '🥈', color: 'text-gray-400' },
      3: { emoji: '🥉', color: 'text-orange-500' }
    };
    return badges[rank as 1 | 2 | 3] || { emoji: '🏅', color: 'text-blue-500' };
  };

  return (
    <div className="rounded-xl bg-gradient-to-br from-surface to-surface2 border border-border p-6 shadow-sm shadow-accent/10 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-warning/20 rounded-lg text-warning">
          <Trophy size={20} />
        </div>
        <div>
          <h3 className="font-bold text-lg text-white">College Leaderboard</h3>
          <p className="text-xs text-muted">See who's earning the most XP</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <LoaderCircle className="animate-spin text-accent" size={24} />
        </div>
      ) : (
        <div className="space-y-3 mb-5">
          {topColleges.slice(0, 3).map((college, idx) => {
            const badge = getRankBadge(college.rank || idx + 1);
            return (
              <div
                key={college.college}
                className="flex items-center gap-3 p-3 rounded-lg bg-surface border border-border/50 hover:border-warning/30 transition-colors"
              >
                <span className={`text-2xl ${badge.color}`}>{badge.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-sm truncate">{college.college}</div>
                  <div className="text-xs text-muted">
                    {college.students} students • <span className="text-warning font-semibold">{college.total_xp.toLocaleString('en-IN')} XP</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={handleViewRankings}
        disabled={isNavigating}
        className="w-full py-3 rounded-lg bg-warning/10 border border-warning/30 text-warning hover:bg-warning/20 font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        View Full Rankings
        <ArrowRight size={16} />
      </button>

      <p className="text-xs text-muted mt-4 text-center">
        🎯 Competing against peers keeps you motivated
      </p>
    </div>
  );
}
