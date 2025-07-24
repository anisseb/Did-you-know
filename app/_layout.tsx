import { router, Slot, usePathname } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import mobileAds from 'react-native-google-mobile-ads';
import { SettingsProvider } from "../contexts/SettingsContext";
import { auth } from "../firebase";
import i18n from "../i18n";

export default function RootLayout() {
  const [authChecked, setAuthChecked] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Initialiser Google AdMob
    mobileAds()
      .initialize()
      .then(adapterStatuses => {
        console.log('AdMob initialisé avec succès');
      })
      .catch(error => {
        console.error('Erreur lors de l\'initialisation d\'AdMob:', error);
      });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user && !pathname.startsWith("/auth")) {
        router.replace("/auth");
      }
      setAuthChecked(true);
    });
    return unsubscribe;
  }, [pathname]);

  if (!authChecked) return null;

  return (
    <I18nextProvider i18n={i18n}>
      <SettingsProvider>
        <Slot />
      </SettingsProvider>
    </I18nextProvider>
  );
} 