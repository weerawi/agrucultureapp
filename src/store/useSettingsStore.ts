import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language } from '../types';
import i18n from '../i18n';

interface SettingsState {
  language: Language;
  detectedRegionId: string | null;
  setLanguage: (lang: Language) => void;
  setDetectedRegionId: (regionId: string | null) => void;
  loadSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  language: 'en',
  detectedRegionId: null,

  setLanguage: async (language: Language) => {
    set({ language });
    i18n.changeLanguage(language);
    try {
      await AsyncStorage.setItem('app_language', language);
    } catch {
      // Silently fail on storage error
    }
  },

  setDetectedRegionId: (detectedRegionId) => set({ detectedRegionId }),

  loadSettings: async () => {
    try {
      const savedLang = await AsyncStorage.getItem('app_language');
      if (savedLang && ['en', 'si', 'ta'].includes(savedLang)) {
        const language = savedLang as Language;
        set({ language });
        i18n.changeLanguage(language);
      }
    } catch {
      // Use defaults
    }
  },
}));
