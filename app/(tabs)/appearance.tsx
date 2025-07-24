import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { useSettings } from "../../contexts/SettingsContext";
import { useTheme } from "../../hooks/useTheme";

export default function Appearance() {
  const { t } = useTranslation();
  const { settings, updateLanguage, updateDarkMode, updateThemeColor } = useSettings();
  const { colors } = useTheme();

  const themeColors = [
    { name: t("pink"), color: '#FF6B81' },
    { name: t("green"), color: '#4CAF50' },
    { name: t("blue"), color: '#2196F3' },
    { name: t("purple"), color: '#9C27B0' },
    { name: t("orange"), color: '#FF9800' },
  ];

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
        <Text style={[styles.title, { color: colors.text }]}>{t("appearance")}</Text>
        
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t("language")}</Text>
          <View style={styles.languageOptions}>
            <TouchableOpacity 
              style={[
                styles.languageButton, 
                { borderColor: colors.border },
                settings.language === 'fr' && [styles.languageButtonActive, { backgroundColor: colors.primary, borderColor: colors.primary }]
              ]}
              onPress={() => updateLanguage('fr')}
            >
              <Text style={[
                styles.languageText,
                { color: colors.textSecondary },
                settings.language === 'fr' && [styles.languageTextActive, { color: '#fff' }]
              ]}>
                {t("french")}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.languageButton, 
                { borderColor: colors.border },
                settings.language === 'en' && [styles.languageButtonActive, { backgroundColor: colors.primary, borderColor: colors.primary }]
              ]}
              onPress={() => updateLanguage('en')}
            >
              <Text style={[
                styles.languageText,
                { color: colors.textSecondary },
                settings.language === 'en' && [styles.languageTextActive, { color: '#fff' }]
              ]}>
                {t("english")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t("dark_mode")}</Text>
          <View style={styles.settingRow}>
            <Text style={[styles.settingText, { color: colors.text }]}>{t("enable_dark_mode")}</Text>
            <Switch
              value={settings.isDarkMode}
              onValueChange={updateDarkMode}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.isDarkMode ? '#fff' : '#f4f3f4'}
            />
          </View>
          <Text style={[styles.settingDescription, { color: colors.textMuted }]}>
            {t("dark_mode_description")}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t("animations")}</Text>
          <View style={styles.settingRow}>
            <Text style={[styles.settingText, { color: colors.text }]}>{t("swipe_animations")}</Text>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          </View>
          <View style={styles.settingRow}>
            <Text style={[styles.settingText, { color: colors.text }]}>{t("haptic_feedback")}</Text>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          </View>
          <Text style={[styles.settingDescription, { color: colors.textMuted }]}>
            {t("animations_description")}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t("color_theme")}</Text>
          <View style={styles.colorOptions}>
            {themeColors.map((theme) => (
              <TouchableOpacity
                key={theme.color}
                style={[
                  styles.colorButton,
                  settings.themeColor === theme.color && [styles.colorButtonActive, { borderColor: colors.primary, backgroundColor: colors.background }]
                ]}
                onPress={() => updateThemeColor(theme.color)}
              >
                <View style={[styles.colorPreview, { backgroundColor: theme.color }]} />
                <Text style={[styles.colorText, { color: colors.textSecondary }]}>{theme.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.settingDescription, { color: colors.textMuted }]}>
            {t("color_theme_description")}
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
    marginBottom: 30,
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
    marginBottom: 15,
  },
  languageOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  languageButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  languageButtonActive: {
    // Styles appliqués dynamiquement
  },
  languageText: {
    fontSize: 16,
    fontWeight: '500',
  },
  languageTextActive: {
    // Styles appliqués dynamiquement
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 5,
  },
  colorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 10,
  },
  colorButton: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 60,
  },
  colorButtonActive: {
    // Styles appliqués dynamiquement
  },
  colorPreview: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginBottom: 5,
  },
  colorText: {
    fontSize: 12,
    fontWeight: '500',
  },
}); 