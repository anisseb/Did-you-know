import { router, Slot, usePathname } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import { SettingsProvider } from "../contexts/SettingsContext";
import { auth } from "../firebase";
import i18n from "../i18n";

export default function RootLayout() {
  const [authChecked, setAuthChecked] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
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