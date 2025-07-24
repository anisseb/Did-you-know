import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { auth } from "../../firebase";
import { useTheme } from "../../hooks/useTheme";

export default function Settings() {
  const { t } = useTranslation();
  const { colors } = useTheme();

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
}); 