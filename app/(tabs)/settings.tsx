import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Purchases, { PurchasesOffering } from 'react-native-purchases';
import { auth, db } from "../../firebase";
import { useTheme } from "../../hooks/useTheme";

export default function Settings() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [isPremium, setIsPremium] = useState(false);
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initialiser RevenueCat
    const apiKey = Platform.OS === 'ios' 
      ? process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS
      : process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID;

    if (!apiKey) {
      console.error('RevenueCat API key not found');
      return;
    }

    Purchases.configure({
      apiKey: apiKey, // À remplacer par vos vraies clés
    });

    // Vérifier le statut premium
    checkPremiumStatus();
    // Charger les offres
    loadOfferings();
  }, []);

  const checkPremiumStatus = async () => {
    try {
      // Vérifier le statut Firestore si l'utilisateur est connecté
      if (auth.currentUser) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const isUserPremium = userData.abonnement?.premium === "active";
          setIsPremium(isUserPremium);
        } else {
          setIsPremium(false);
        }
      } else {
        setIsPremium(false);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du statut premium:', error);
      setIsPremium(false);
    }
  };

  const loadOfferings = async () => {
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current) {
        setOffering(offerings.current);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des offres:', error);
    }
  };

  const handlePurchasePremium = async () => {
    if (!offering?.availablePackages[0]) {
      Alert.alert(t("error"), t("premium_not_available"));
      return;
    }

    setIsLoading(true);
    try {
      const { customerInfo } = await Purchases.purchasePackage(offering.availablePackages[0]);
      
      if (customerInfo.entitlements.active['premium']) {
        setIsPremium(true);
        
        // Mettre à jour le document utilisateur avec l'objet abonnement
        if (auth.currentUser) {
          const userRef = doc(db, "users", auth.currentUser.uid);
          await updateDoc(userRef, {
            abonnement: {
              premium: "active",
              dateActivation: new Date().toISOString(),
              type: "lifetime"
            }
          });
        }
        
        Alert.alert(t("success"), t("premium_purchase_success"));
      }
    } catch (error: any) {
      if (!error.userCancelled) {
        Alert.alert(t("error"), t("premium_purchase_error"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/auth");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Bouton retour */}
      <TouchableOpacity 
        style={[styles.backButton, { backgroundColor: colors.primary }]} 
        onPress={() => router.push("/(tabs)")}
      >
        <Ionicons name="arrow-back" size={28} color="white" />
      </TouchableOpacity>
      
      <Text style={[styles.title, { color: colors.text }]}>{t("Settings")}</Text>
      
      {/* Boutons de paramètres */}
      <View style={styles.settingsList}>
        <TouchableOpacity 
          style={[styles.settingButton, { backgroundColor: colors.surface }]} 
          onPress={() => router.push("/(tabs)/propose-anecdote")}
        >
          <Ionicons name="add-circle" size={24} color={colors.primary} />
          <Text style={[styles.settingText, { color: colors.text }]}>{t("propose_anecdote")}</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Bouton Premium */}
        {!isPremium ? (
          <TouchableOpacity 
            style={[styles.premiumButton, { backgroundColor: colors.primary }]} 
            onPress={handlePurchasePremium}
            disabled={isLoading}
          >
            <Ionicons name="diamond" size={24} color="#fff" />
            <Text style={styles.premiumButtonText}>
              {isLoading ? t("processing") : t("upgrade_to_premium")}
            </Text>
            <Text style={styles.premiumPriceText}>€9.99</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.premiumActiveButton, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
            <Text style={[styles.premiumActiveText, { color: colors.primary }]}>
              {t("premium_active")}
            </Text>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.settingButton, { backgroundColor: colors.surface }]} 
          onPress={() => router.push("/(tabs)/privacy")}
        >
          <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
          <Text style={[styles.settingText, { color: colors.text }]}>{t("privacy")}</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.settingButton, { backgroundColor: colors.surface }]} 
          onPress={() => router.push("/(tabs)/help")}
        >
          <Ionicons name="help-circle" size={24} color={colors.primary} />
          <Text style={[styles.settingText, { color: colors.text }]}>{t("help")}</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.settingButton, { backgroundColor: colors.surface }]} 
          onPress={() => router.push("/(tabs)/about")}
        >
          <Ionicons name="information-circle" size={24} color={colors.primary} />
          <Text style={[styles.settingText, { color: colors.text }]}>{t("about")}</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.settingButton, { backgroundColor: colors.surface }]} 
          onPress={() => router.push("/(tabs)/appearance")}
        >
          <Ionicons name="color-palette" size={24} color={colors.primary} />
          <Text style={[styles.settingText, { color: colors.text }]}>{t("appearance")}</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Bouton de déconnexion */}
      <TouchableOpacity 
        style={[styles.logoutButton, { backgroundColor: colors.primary }]} 
        onPress={handleLogout}
      >
        <Ionicons name="log-out" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.logoutText}>{t("logout")}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingTop: 60,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 24,
    zIndex: 10,
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: { 
    fontSize: 28, 
    marginTop: 30,
    fontWeight: "bold", 
    textAlign: "center",
    marginBottom: 40,
  },
  settingsList: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginHorizontal: 20,
    shadowColor: '#FF6B81',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  premiumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  premiumButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 10,
  },
  premiumPriceText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 10,
  },
  premiumActiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  premiumActiveText: {
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 10,
  },
}); 