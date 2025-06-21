import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings } from '@/types/finance';
import { Platform } from 'react-native';

interface SettingsState extends AppSettings {
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setCurrency: (currency: string) => void;
  setLanguage: (language: string) => void;
  toggleNotifications: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      currency: '€',
      language: 'de',
      theme: 'system',
      notificationsEnabled: true,
      
      setTheme: (theme) => {
        console.log("Setting theme in store:", theme);
        set({ theme });
        
        // Force a UI refresh on iOS and Android by toggling a value
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
          // This is a workaround to force the UI to refresh
          setTimeout(() => {
            set(state => ({ ...state }));
          }, 50);
          
          // And another refresh after a bit longer
          setTimeout(() => {
            set(state => ({ ...state }));
          }, 200);
        }
      },
      setCurrency: (currency) => set({ currency }),
      setLanguage: (language) => set({ language }),
      toggleNotifications: (enabled) => set({ notificationsEnabled: enabled }),
    }),
    {
      name: 'budgetbuddy-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);