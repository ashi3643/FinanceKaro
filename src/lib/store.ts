import { create, StateCreator } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';
import { supabase } from './supabase';

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
  addXp: (amount: number) => void;
  updateStreak: () => void;
  setLanguage: (lang: string) => void;
  setCollege: (college: string) => void;
  setStage: (stage: 'Student' | 'First-Jobber') => void;
  completeLesson: (levelId: number, lessonId: string) => void;
  initDevice: () => void;
}

type MyPersist = (
  config: StateCreator<AppState, [["zustand/persist", unknown]]>,
  options: PersistOptions<AppState>
) => StateCreator<AppState, [], [["zustand/persist", AppState]]>;

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

      initDevice: async () => {
        const state = get();
        if (!state.deviceId) {
          const newId = crypto.randomUUID();
          set({ deviceId: newId });
          
          if (!supabase) return;

          // Fire and forget insert to Supabase
          await supabase.from('profiles').insert({
            device_id: newId,
            xp: state.xp,
            streak: state.streak,
            stage: state.stage,
            language: state.language,
            college: state.college
          }).select().single().then(res => res.error && console.error(res.error));
        }
      },

      addXp: (amount) => {
        set((state) => ({ xp: state.xp + amount }));
        const deviceId = get().deviceId;
        if (deviceId && supabase) {
          supabase.from('profiles').update({ xp: get().xp }).eq('device_id', deviceId).then(res => res.error && console.error(res.error));
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
        if (state.deviceId && supabase) {
           supabase.from('profiles').update({ 
             streak: newStreak, 
             last_login_date: today 
           }).eq('device_id', state.deviceId).then(res => res.error && console.error(res.error));
        }
      },

      setLanguage: (lang) => {
        set({ language: lang });
        const deviceId = get().deviceId;
        if (deviceId && supabase) {
          supabase.from('profiles').update({ language: lang }).eq('device_id', deviceId).then(res => res.error && console.error(res.error));
        }
      },

      setCollege: (college) => {
        set({ college });
        const deviceId = get().deviceId;
        if (deviceId && supabase) {
          supabase.from('profiles').update({ college }).eq('device_id', deviceId).then(res => res.error && console.error(res.error));
        }
      },
      
      setStage: (stage) => {
        set({ stage });
        const deviceId = get().deviceId;
        if (deviceId && supabase) {
          supabase.from('profiles').update({ stage: stage }).eq('device_id', deviceId).then(res => res.error && console.error(res.error));
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

        if (state.deviceId && supabase) {
           supabase.from('completed_lessons').insert({
              device_id: state.deviceId,
              level_id: levelId,
              lesson_id: lessonId
           }).then(res => res.error && console.error(res.error));
        }
      }
    }),
    {
      name: 'financekaro-storage',
    }
  )
);
