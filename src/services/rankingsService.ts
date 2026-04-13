import { supabase } from '@/lib/supabase';

export interface CollegeNode {
  college: string;
  total_xp: number;
  students: number;
}

export interface CollegeSuggestion {
  name: string;
  count: number;
}

export const rankingsService = {
  async getLeaderboard(): Promise<CollegeNode[]> {
    if (!supabase) {
      console.warn('Supabase not available for leaderboard');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('college, xp')
        .not('college', 'is', null)
        .neq('college', '');

      if (error || !data || !Array.isArray(data)) {
        throw error || new Error('No data returned');
      }

      const collegeMap = new Map<string, { total_xp: number; students: number }>();
      data.forEach((profile) => {
        const college = profile.college;
        if (!college) return;
        if (collegeMap.has(college)) {
          const existing = collegeMap.get(college)!;
          existing.total_xp += profile.xp || 0;
          existing.students += 1;
        } else {
          collegeMap.set(college, { total_xp: profile.xp || 0, students: 1 });
        }
      });

      return Array.from(collegeMap.entries())
        .map(([college, stats]) => ({ college, ...stats }))
        .sort((a, b) => b.total_xp - a.total_xp);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  },

  async getCollegeSuggestions(limit: number = 100): Promise<string[]> {
    if (!supabase) {
      console.warn('Supabase not available for college suggestions');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('college_suggestions')
        .select('name')
        .order('count', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error loading college suggestions:', error);
        return [];
      }

      if (data && Array.isArray(data)) {
        return data.map((item: any) => item.name);
      }
      return [];
    } catch (error) {
      console.error('Error loading college suggestions:', error);
      return [];
    }
  },

  async addCollegeToSuggestions(collegeName: string): Promise<boolean> {
    if (!supabase) {
      console.warn('Supabase not available for college suggestions');
      return false;
    }

    try {
      const { data: existing } = await supabase
        .from('college_suggestions')
        .select('id, count')
        .eq('name', collegeName)
        .single();

      if (existing) {
        await supabase
          .from('college_suggestions')
          .update({ count: existing.count + 1 })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('college_suggestions')
          .insert({ name: collegeName, count: 1 });
      }
      return true;
    } catch (error) {
      console.error('Error adding college to suggestions:', error);
      return false;
    }
  },
};
