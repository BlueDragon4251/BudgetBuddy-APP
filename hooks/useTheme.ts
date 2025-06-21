import { useColorScheme } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { getTheme } from '@/constants/theme';
import { useSettingsStore } from './useSettingsStore';
import { Platform } from 'react-native';

export const useTheme = () => {
  const systemColorScheme = useColorScheme();
  const { theme: settingsTheme } = useSettingsStore();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Force a re-render when theme changes
  const refreshTheme = useCallback(() => {
    setForceUpdate(prev => prev + 1);
  }, []);

  useEffect(() => {
    console.log("Theme settings changed:", settingsTheme);
    console.log("System color scheme:", systemColorScheme);
    
    let newIsDarkMode = false;
    
    if (settingsTheme === 'system') {
      newIsDarkMode = systemColorScheme === 'dark';
    } else {
      newIsDarkMode = settingsTheme === 'dark';
    }
    
    console.log("Setting isDarkMode to:", newIsDarkMode);
    setIsDarkMode(newIsDarkMode);
    
    // Force a UI refresh
    refreshTheme();
    
    // For iOS, we need an additional refresh after a short delay
    if (Platform.OS === 'ios') {
      setTimeout(() => {
        refreshTheme();
      }, 100);
    }
  }, [systemColorScheme, settingsTheme, refreshTheme]);

  const theme = getTheme(isDarkMode);
  
  console.log("Current theme mode:", isDarkMode ? "dark" : "light");
  console.log("Theme object:", theme);

  return {
    theme,
    isDarkMode,
    setTheme: (mode: 'light' | 'dark' | 'system') => {
      console.log("Setting theme in useTheme:", mode);
      useSettingsStore.getState().setTheme(mode);
    },
    forceUpdate
  };
};