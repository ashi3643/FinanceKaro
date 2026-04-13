import { supabase } from '@/lib/supabase';

export interface UserProfile {
  device_id: string;
  college?: string;
  xp?: number;
  created_at?: string;
}

export const userService = {
  async getProfile(deviceId: string): Promise<UserProfile | null> {
    if (!supabase) {
      console.warn('Supabase not available');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('device_id', deviceId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },

  async updateProfile(deviceId: string, updates: Partial<UserProfile>): Promise<boolean> {
    if (!supabase) {
      console.warn('Supabase not available');
      return false;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ device_id: deviceId, ...updates }, { onConflict: 'device_id' });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  },

  async updateCollege(deviceId: string, college: string): Promise<boolean> {
    return this.updateProfile(deviceId, { college });
  },

  async addXP(deviceId: string, amount: number): Promise<boolean> {
    const profile = await this.getProfile(deviceId);
    if (!profile) return false;

    const currentXP = profile.xp || 0;
    return this.updateProfile(deviceId, { xp: currentXP + amount });
  },
};
