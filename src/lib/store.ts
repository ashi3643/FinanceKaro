import { create, StateCreator } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';
import { supabase } from './supabase';

interface PredictionResult {
  prediction: number;
  confidence: number;
  recommendation: string;
  modelVersion: string;
  timestamp: string;
}

interface AppState {
  deviceId: string;
  xp: number;
  streak: number;
  lastLoginDate: string | null;
  language: string;
  college: string | null;
  stage: 'Student' | 'First-Jobber' | null;
  unlockedLevels: number[];
  completedLessons: string[]; // ["level1-lesson1", etc]
  recentPredictions: PredictionResult[];
  isPredicting: boolean;
  predictionError: string | null;
  addXp: (amount: number) => void;
  updateStreak: () => void;
  setLanguage: (lang: string, persist?: boolean) => void;
  setCollege: (college: string) => void;
  setStage: (stage: 'Student' | 'First-Jobber') => void;
  completeLesson: (levelId: number, lessonId: string) => void;
  initDevice: () => void;
  predictWealth: (params: {
    monthlyAmount: number;
    years: number;
    annualReturn: number;
    age?: number;
    income?: number;
    riskTolerance?: string;
    financialGoals?: string[];
  }) => Promise<PredictionResult>;
  submitPredictionFeedback: (predictionId: string, feedback: string) => Promise<void>;
  clearPredictionError: () => void;
}

type MyPersist = (
  config: StateCreator<AppState, [["zustand/persist", unknown]]>,
  options: PersistOptions<AppState>
) => StateCreator<AppState, [], [["zustand/persist", AppState]]>;

let isSupabaseAvailable = !!supabase;

const handleSupabaseError = (error: { code?: string; status?: number; message?: string } | null, operation: string) => {
  if (!error) return;

  console.warn(`Supabase warning during ${operation}:`, error);

  if (
    error.code === 'PGRST205' ||
    error.status === 404 ||
    error.message?.includes("Could not find the table")
  ) {
    isSupabaseAvailable = false;
    console.warn('Supabase writes are disabled for this session because the backend schema is unavailable.');
  }
};

const safeSupabase = (operation: string, callback: () => any) => {
  if (!supabase || !isSupabaseAvailable) return;

  callback()
    .then((res: any) => {
      const result = res as unknown as { error?: { code?: string; status?: number; message?: string } };
      if (result?.error) {
        handleSupabaseError(result.error, operation);
      }
    })
    .catch((error: any) => {
      console.error(`Supabase request failed during ${operation}:`, error);
      isSupabaseAvailable = false;
    });
};

export const useStore = create<AppState>()(
  (persist as MyPersist)(
    (set, get) => ({
      deviceId: '',
      xp: 0,
      streak: 0,
      lastLoginDate: null,
      language: 'en',
      college: null,
      stage: null,
      unlockedLevels: [1], // Level 1 is always unlocked
      completedLessons: [],
      recentPredictions: [],
      isPredicting: false,
      predictionError: null,

      initDevice: async () => {
        const state = get();
        if (!state.deviceId) {
          const newId = crypto.randomUUID();
          set({ deviceId: newId });

          if (isSupabaseAvailable) {
            safeSupabase('create profile', () =>
              supabase!.from('profiles').insert({
                device_id: newId,
                xp: state.xp,
                streak: state.streak,
                stage: state.stage,
                language: state.language,
                college: state.college
              }).select().single()
            );
          }
        }
      },

      addXp: (amount) => {
        set((state) => ({ xp: state.xp + amount }));
        if (!isSupabaseAvailable) return;

        const deviceId = get().deviceId;
        if (deviceId) {
          safeSupabase('update xp', () =>
            supabase!.from('profiles').update({ xp: get().xp }).eq('device_id', deviceId)
          );
        }
      },
      
      updateStreak: () => {
        const today = new Date().toISOString().split('T')[0];
        const state = get();
        
        if (state.lastLoginDate === today) return; // Already logged in today
        
        let newStreak = 1;
        if (!state.lastLoginDate) {
          newStreak = 1;
        } else {
          const lastLogin = new Date(state.lastLoginDate);
          const currentDate = new Date(today);
          const diffTime = Math.abs(currentDate.getTime() - lastLogin.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
          newStreak = diffDays === 1 ? state.streak + 1 : 1;
        }
        
        set({ streak: newStreak, lastLoginDate: today });
        if (!isSupabaseAvailable) return;

        if (state.deviceId) {
          safeSupabase('update streak', () =>
            supabase!.from('profiles').update({ 
              streak: newStreak, 
              last_login_date: today 
            }).eq('device_id', state.deviceId)
          );
        }
      },

      setLanguage: (lang, persist = true) => {
        set({ language: lang });
        if (!persist || !isSupabaseAvailable) return;

        const deviceId = get().deviceId;
        if (deviceId) {
          safeSupabase('update language', () =>
            supabase!.from('profiles').update({ language: lang }).eq('device_id', deviceId)
          );
        }
      },

      setCollege: (college) => {
        set({ college });
        if (!isSupabaseAvailable) return;

        const deviceId = get().deviceId;
        if (deviceId) {
          safeSupabase('update college', () =>
            supabase!.from('profiles').update({ college }).eq('device_id', deviceId)
          );
        }
      },
      
      setStage: (stage) => {
        set({ stage });
        if (!isSupabaseAvailable) return;

        const deviceId = get().deviceId;
        if (deviceId) {
          safeSupabase('update stage', () =>
            supabase!.from('profiles').update({ stage: stage }).eq('device_id', deviceId)
          );
        }
      },

      completeLesson: (levelId, lessonId) => {
        const state = get();
        const lessonKey = `level${levelId}-${lessonId}`;
        if (state.completedLessons.includes(lessonKey)) return;

        const newCompleted = [...state.completedLessons, lessonKey];

        // Check if current level is completed and unlock next level
        const currentLevelLessons = newCompleted.filter(k => k.startsWith(`level${levelId}`)).length;
        const nextLevelId = levelId + 1;
        const shouldUnlockNext = currentLevelLessons >= 7 && nextLevelId <= 5 && !state.unlockedLevels.includes(nextLevelId);

        set({
          completedLessons: newCompleted,
          unlockedLevels: shouldUnlockNext
            ? [...state.unlockedLevels, nextLevelId]
            : state.unlockedLevels
        });

        if (!isSupabaseAvailable) return;

        if (state.deviceId) {
          safeSupabase('insert completed lesson', () =>
            supabase!.from('completed_lessons').insert({
              device_id: state.deviceId,
              level_id: levelId,
              lesson_id: lessonId
            })
          );
        }
      },

      predictWealth: async (params) => {
        set({ isPredicting: true, predictionError: null });
        
        try {
          const response = await fetch('/api/predict', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...params,
              deviceId: get().deviceId
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Prediction failed');
          }

          const result = await response.json();
          
          const predictionResult: PredictionResult = {
            prediction: result.prediction,
            confidence: result.confidence,
            recommendation: result.recommendation,
            modelVersion: result.modelVersion,
            timestamp: result.timestamp
          };

          // Update recent predictions (keep last 5)
          set((state) => ({
            recentPredictions: [predictionResult, ...state.recentPredictions.slice(0, 4)],
            isPredicting: false
          }));

          return predictionResult;
        } catch (error) {
          set({
            isPredicting: false,
            predictionError: error instanceof Error ? error.message : 'Unknown error'
          });
          throw error;
        }
      },

      submitPredictionFeedback: async (predictionId: string, feedback: string) => {
        try {
          // In a real implementation, you would send this to your backend
          // For now, we'll just log it and potentially store in Supabase
          console.log(`Feedback for prediction ${predictionId}: ${feedback}`);
          
          if (supabase && get().deviceId) {
            // Find the prediction in recent predictions
            const state = get();
            const prediction = state.recentPredictions.find(p =>
              p.timestamp === predictionId || p.modelVersion === predictionId
            );
            
            if (prediction) {
              // Store feedback in Supabase
              await supabase.from('model_predictions').update({
                feedback: feedback
              }).eq('device_id', state.deviceId)
                .eq('created_at', prediction.timestamp);
            }
          }
        } catch (error) {
          console.error('Failed to submit feedback:', error);
        }
      },

      clearPredictionError: () => {
        set({ predictionError: null });
      }
    }),
    {
      name: 'financekaro-storage',
    }
  )
);
