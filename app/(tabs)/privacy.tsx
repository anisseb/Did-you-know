import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../hooks/useTheme";

export default function Privacy() {
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
        <Text style={[styles.title, { color: colors.text }]}>{t("privacy_title")}</Text>
        
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t("privacy_data_collection")}</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            {t("privacy_data_collection_text")}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t("privacy_data_usage")}</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            {t("privacy_data_usage_text")}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t("privacy_data_protection")}</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            {t("privacy_data_protection_text")}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t("privacy_user_rights")}</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            {t("privacy_user_rights_text")}
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
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 22,
  },
}); 