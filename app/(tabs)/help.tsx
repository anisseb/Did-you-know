import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { addDoc, collection } from "firebase/firestore";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth, db } from "../../firebase";
import { useTheme } from "../../hooks/useTheme";

export default function Help() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showDeleteDataForm, setShowDeleteDataForm] = useState(false);

  const handleSubmitContact = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert(t("error"), t("contact_form_validation"));
      return;
    }

    if (!auth.currentUser) {
      Alert.alert(t("error"), t("contact_form_auth_error"));
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "contact-us"), {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        subject: subject.trim(),
        message: message.trim(),
        createdAt: new Date().toISOString(),
        status: "pending"
      });

      Alert.alert(t("success"), t("contact_form_success"));
      setSubject("");
      setMessage("");
      setShowContactForm(false);
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      Alert.alert(t("error"), t("contact_form_error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDataRequest = async () => {
    if (!auth.currentUser) {
      Alert.alert(t("error"), t("delete_data_auth_error"));
      return;
    }

    Alert.alert(
      t("delete_data_confirm_title"),
      t("delete_data_confirm_message"),
      [
        {
          text: t("cancel"),
          style: "cancel"
        },
        {
          text: t("delete_data_confirm"),
          style: "destructive",
          onPress: async () => {
            if (!auth.currentUser) return;
            setIsSubmitting(true);
            try {
              await addDoc(collection(db, "delete-data-requests"), {
                userId: auth.currentUser.uid,
                userEmail: auth.currentUser.email,
                requestDate: new Date().toISOString(),
                status: "pending",
                type: "data_deletion"
              });

              Alert.alert(t("success"), t("delete_data_success"));
              setShowDeleteDataForm(false);
            } catch (error) {
              console.error("Erreur lors de la demande de suppression:", error);
              Alert.alert(t("error"), t("delete_data_error"));
            } finally {
              setIsSubmitting(false);
            }
          }
        }
      ]
    );
  };

  const handleOpenEmail = () => {
    const email = "contact@academiaforkids.com";
    const subject = encodeURIComponent(t("contact_email_subject"));
    const body = encodeURIComponent(t("contact_email_body"));
    const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;
    
    Linking.canOpenURL(mailtoUrl).then(supported => {
      if (supported) {
        Linking.openURL(mailtoUrl);
      } else {
        Alert.alert(t("error"), t("email_app_not_found"));
      }
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Bouton retour */}
      <TouchableOpacity 
        style={[styles.backButton, { backgroundColor: colors.primary }]} 
        onPress={() => router.push("/(tabs)/settings")}
      >
        <Ionicons name="arrow-back" size={28} color="white" />
      </TouchableOpacity>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>{t("help_title")}</Text>
        
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t("help_usage")}</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            {t("help_usage_text")}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t("help_common_issues")}</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            {t("help_common_issues_text")}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t("help_contact")}</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            {t("help_contact_text")}
          </Text>
          
          <View style={styles.contactButtons}>
            <TouchableOpacity 
              style={[styles.emailButton, { backgroundColor: colors.primary }]}
              onPress={handleOpenEmail}
            >
              <Ionicons name="mail-open" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.emailButtonText}>{t("open_email")}</Text>
            </TouchableOpacity>
            
            {!showContactForm ? (
              <TouchableOpacity 
                style={[styles.contactButton, { backgroundColor: colors.secondary, borderColor: colors.primary }]}
                onPress={() => setShowContactForm(true)}
              >
                <Ionicons name="chatbubble" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={[styles.contactButtonText, { color: colors.primary }]}>{t("contact_form_button")}</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.contactForm}>
                <TextInput
                  style={[styles.input, { 
                    borderColor: colors.border, 
                    backgroundColor: colors.background,
                    color: colors.text 
                  }]}
                  placeholder={t("contact_form_subject_placeholder")}
                  placeholderTextColor={colors.textMuted}
                  value={subject}
                  onChangeText={setSubject}
                  maxLength={100}
                />
                <TextInput
                  style={[styles.textArea, { 
                    borderColor: colors.border, 
                    backgroundColor: colors.background,
                    color: colors.text 
                  }]}
                  placeholder={t("contact_form_message_placeholder")}
                  placeholderTextColor={colors.textMuted}
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                />
                <View style={styles.formButtons}>
                  <TouchableOpacity 
                    style={[styles.cancelButton, { borderColor: colors.border }]}
                    onPress={() => {
                      setShowContactForm(false);
                      setSubject("");
                      setMessage("");
                    }}
                  >
                    <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
                      {t("cancel")}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.submitButton, { backgroundColor: colors.primary }]}
                    onPress={handleSubmitContact}
                    disabled={isSubmitting}
                  >
                    <Text style={styles.submitButtonText}>
                      {isSubmitting ? t("sending") : t("send")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t("help_faq")}</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            {t("help_faq_text")}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t("delete_data_title")}</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            {t("delete_data_description")}
          </Text>
          
          <TouchableOpacity 
            style={[styles.deleteDataButton, { backgroundColor: colors.error }]}
            onPress={handleDeleteDataRequest}
            disabled={isSubmitting}
          >
            <Ionicons name="trash" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.deleteDataButtonText}>
              {isSubmitting ? t("processing") : t("delete_data_button")}
            </Text>
          </TouchableOpacity>
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
  question: {
    fontWeight: 'bold',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactForm: {
    marginTop: 20,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  cancelButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  cancelButtonText: {
    fontSize: 16,
  },
  submitButton: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteDataButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteDataButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactButtons: {
    flexDirection: 'column',
    marginTop: 20,
    gap: 15,
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emailButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 