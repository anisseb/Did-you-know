import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

type AuthContextType = {
  user: string | null; // ou un objet utilisateur si tu as plus d'infos
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (username: string, password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Charger l'utilisateur depuis le stockage local
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUser(storedUser);
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const signIn = async (username: string, password: string) => {
    // Simuler une authentification
    // Remplace par un appel à une API dans ton app
    if (username && password) {
      setUser(username);
      await AsyncStorage.setItem('user', username);
    }
  };

  const signOut = async () => {
    setUser(null);
    await AsyncStorage.removeItem('user');
  };

  const signUp = async (username: string, password: string) => {
    // Simuler une inscription
    setUser(username);
    await AsyncStorage.setItem('user', username);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, signUp }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
