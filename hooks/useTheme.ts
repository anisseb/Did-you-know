import { useSettings } from '../contexts/SettingsContext';

export const useTheme = () => {
  const { settings } = useSettings();
  
  const themeColors = {
    primary: settings.themeColor,
    secondary: '#f8f9fa',
    background: settings.isDarkMode ? '#1a1a1a' : '#f8f9fa',
    surface: settings.isDarkMode ? '#2d2d2d' : '#ffffff',
    text: settings.isDarkMode ? '#ffffff' : '#333333',
    textSecondary: settings.isDarkMode ? '#cccccc' : '#666666',
    textMuted: settings.isDarkMode ? '#999999' : '#999999',
    border: settings.isDarkMode ? '#404040' : '#e0e0e0',
    shadow: settings.isDarkMode ? '#000000' : '#000000',
    error: '#ff4444',
  };

  return {
    colors: themeColors,
    isDarkMode: settings.isDarkMode,
    themeColor: settings.themeColor,
  };
}; 