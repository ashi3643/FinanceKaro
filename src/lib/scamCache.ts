const SCAM_CACHE_KEY = 'financekaro-scam-cache';
const SCAM_CACHE_VERSION = 'v1';
const SCAM_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export interface ScamPattern {
  id: number;
  title: string;
  message: string;
  isScam: boolean;
  realTruth: string;
}

export interface ScamCacheData {
  version: string;
  timestamp: number;
  patterns: ScamPattern[];
}

export const scamCache = {
  get(): ScamPattern[] | null {
    if (typeof window === 'undefined') return null;

    try {
      const cached = localStorage.getItem(SCAM_CACHE_KEY);
      if (!cached) return null;

      const data: ScamCacheData = JSON.parse(cached);
      
      // Check version
      if (data.version !== SCAM_CACHE_VERSION) {
        this.clear();
        return null;
      }

      // Check TTL
      const age = Date.now() - data.timestamp;
      if (age > SCAM_CACHE_TTL) {
        this.clear();
        return null;
      }

      return data.patterns;
    } catch (error) {
      console.error('Error reading scam cache:', error);
      return null;
    }
  },

  set(patterns: ScamPattern[]): void {
    if (typeof window === 'undefined') return;

    try {
      const data: ScamCacheData = {
        version: SCAM_CACHE_VERSION,
        timestamp: Date.now(),
        patterns,
      };

      localStorage.setItem(SCAM_CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error writing scam cache:', error);
    }
  },

  clear(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(SCAM_CACHE_KEY);
    } catch (error) {
      console.error('Error clearing scam cache:', error);
    }
  },

  isValid(): boolean {
    const cached = this.get();
    return cached !== null && cached.length > 0;
  },

  syncWithSupabase: async (supabase: any): Promise<boolean> => {
    try {
      if (!supabase) {
        console.warn('Supabase not available for scam sync');
        return false;
      }

      const { data, error } = await supabase
        .from('scam_patterns')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error syncing scam patterns:', error);
        return false;
      }

      if (data && Array.isArray(data) && data.length > 0) {
        const patterns: ScamPattern[] = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          message: item.message,
          isScam: item.is_scam,
          realTruth: item.real_truth,
        }));

        scamCache.set(patterns);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error syncing scam patterns:', error);
      return false;
    }
  },

  search(query: string, patterns: ScamPattern[]): ScamPattern[] {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    return patterns.filter(
      pattern =>
        pattern.title.toLowerCase().includes(lowerQuery) ||
        pattern.message.toLowerCase().includes(lowerQuery) ||
        pattern.realTruth.toLowerCase().includes(lowerQuery)
    );
  },
};
