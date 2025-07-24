import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../hooks/useTheme";

export default function About() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Bouton retour */}
      <TouchableOpacity 
        style={[styles.backButton, { backgroundColor: colors.primary }]} 
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={28} color="white" />
      </TouchableOpacity>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>{t("about_title")}</Text>
        
        <View style={styles.logoContainer}>
          <Ionicons name="bulb" size={80} color={colors.primary} />
          <Text style={[styles.appName, { color: colors.primary }]}>{t("app_name")}</Text>
          <Text style={[styles.version, { color: colors.textMuted }]}>{t("app_version")}</Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t("about_mission")}</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            {t("about_mission_text")}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t("about_features")}</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            {t("about_features_text")}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t("about_team")}</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            {t("about_team_text")}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t("about_acknowledgments")}</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            {t("about_acknowledgments_text")}
          </Text>
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: { 
    fontSize: 28, 
    marginTop: 50,
    fontWeight: "bold", 
    textAlign: "center",
    marginBottom: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 20,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  version: {
    fontSize: 14,
    marginTop: 5,
  },
  section: {
    padding: 20,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 22,
  },
}); 