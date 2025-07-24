import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import i18n from '../i18n';

interface Settings {
  language: 'fr' | 'en';
  isDarkMode: boolean;
  themeColor: string;
}

interface SettingsContextType {
  settings: Settings;
  updateLanguage: (language: 'fr' | 'en') => Promise<void>;
  updateDarkMode: (isDarkMode: boolean) => Promise<void>;
  updateThemeColor: (themeColor: string) => Promise<void>;
  isLoading: boolean;
}

const defaultSettings: Settings = {
  language: 'fr',
  isDarkMode: false,
  themeColor: '#FF6B81',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  const loadSettings = async () => {
    try {
      // Charger d'abord depuis AsyncStorage
      const savedLanguage = await AsyncStorage.getItem('userLanguage');
      if (savedLanguage) {
        const language = savedLanguage as 'fr' | 'en';
        setSettings(prev => ({ ...prev, language }));
        i18n.changeLanguage(language);
      }

      // Puis charger depuis Firebase si l'utilisateur est connecté
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().settings) {
          const firebaseSettings = userDoc.data().settings;
          setSettings(prev => ({
            ...prev,
            ...firebaseSettings,
            language: firebaseSettings.language || prev.language
          }));
          i18n.changeLanguage(firebaseSettings.language || 'fr');
        }
      }
    } catch (error) {
      console.log('Erreur lors du chargement des paramètres:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: Settings) => {
    try {
      // Sauvegarder dans AsyncStorage
      await AsyncStorage.setItem('userLanguage', newSettings.language);
      
      // Sauvegarder dans Firebase si l'utilisateur est connecté
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, "users", user.uid), {
          settings: newSettings
        });
      }
    } catch (error) {
      console.log('Erreur lors de la sauvegarde des paramètres:', error);
    }
  };

  const updateLanguage = async (language: 'fr' | 'en') => {
    const newSettings = { ...settings, language };
    setSettings(newSettings);
    i18n.changeLanguage(language);
    await saveSettings(newSettings);
  };

  const updateDarkMode = async (isDarkMode: boolean) => {
    const newSettings = { ...settings, isDarkMode };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const updateThemeColor = async (themeColor: string) => {
    const newSettings = { ...settings, themeColor };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        loadSettings();
      } else {
        // Charger seulement depuis AsyncStorage si pas d'utilisateur
        loadSettings();
      }
    });
    return unsubscribe;
  }, []);

  const value: SettingsContextType = { 
    settings, 
    updateLanguage, 
    updateDarkMode, 
    updateThemeColor, 
    isLoading 
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}; 