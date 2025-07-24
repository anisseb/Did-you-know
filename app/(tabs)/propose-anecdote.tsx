import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { addDoc, collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth, db } from "../../firebase";
import { useTheme } from "../../hooks/useTheme";
import i18n from "../../i18n";

export default function ProposeAnecdote() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || 'fr');
  const [categories, setCategories] = useState<Array<{id: string, label: string, icon: string}>>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    question: false,
    answer: false,
    category: false
  });

  const fetchCategories = async (language: string) => {
    try {
      const snapshot = await getDocs(collection(db, "categories"));
      let categoriesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      // Filtrer les catégories par langue
      categoriesData = categoriesData.filter((cat: any) => cat.language === language);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error);
    }
  };

  useEffect(() => {
    fetchCategories(selectedLanguage);
  }, [selectedLanguage]);

  const handleLanguageChange = (language: 'fr' | 'en') => {
    setSelectedLanguage(language);
    setCategory(""); // Réinitialiser la catégorie quand la langue change
    setShowLanguageModal(false);
  };

  const handleCategorySelect = (categoryId: string, categoryLabel: string) => {
    setCategory(categoryLabel);
    setValidationErrors(prev => ({ ...prev, category: false }));
    setShowCategoryModal(false);
  };

  const handleSubmit = async () => {
    // Vérifier les champs et définir les erreurs
    const errors = {
      question: !question.trim(),
      answer: !answer.trim(),
      category: !category.trim()
    };
    
    setValidationErrors(errors);
    
    if (errors.question || errors.answer || errors.category) {
      Alert.alert(t("error"), t("propose_anecdote_validation"));
      return;
    }

    if (!auth.currentUser) {
      Alert.alert(t("error"), t("propose_anecdote_auth_error"));
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "anecdotes"), {
        question: question.trim(),
        answer: answer.trim(),
        category: category.trim(),
        category_id: "pending",
        category_label: category.trim(),
        language: selectedLanguage,
        status: "pending",
        created_by: auth.currentUser.uid,
        user_email: auth.currentUser.email,
        likes: 0,
        dislikes: 0,
        timestamp: new Date(),
        updated_at: new Date()
      });

      Alert.alert(t("success"), t("propose_anecdote_success"));
      setQuestion("");
      setAnswer("");
      setCategory("");
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      Alert.alert(t("error"), t("propose_anecdote_error"));
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <Text style={[styles.title, { color: colors.text }]}>{t("propose_anecdote")}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {t("propose_anecdote_description")}
        </Text>

        <View style={[styles.formSection, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            {t("propose_anecdote_language")}
          </Text>
          <TouchableOpacity 
            style={[styles.selectorButton, { 
              borderColor: colors.border, 
              backgroundColor: colors.background 
            }]}
            onPress={() => setShowLanguageModal(true)}
          >
            <Ionicons name="language" size={20} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={[styles.selectorText, { color: colors.text }]}>
              {selectedLanguage === 'fr' ? '🇫🇷 ' + t("french") : '🇬🇧 ' + t("english")}
            </Text>
            <Ionicons name="chevron-down" size={20} color={colors.primary} style={{ marginLeft: 15 }} />
          </TouchableOpacity>
        </View>

        <View style={[styles.formSection, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            {t("propose_anecdote_category")} <Text style={{ color: colors.error }}>*</Text>
          </Text>
          <TouchableOpacity 
            style={[styles.selectorButton, { 
              borderColor: validationErrors.category ? colors.error : colors.border, 
              backgroundColor: colors.background,
            }]}
            onPress={() => setShowCategoryModal(true)}
          >
            <Ionicons name="list" size={20} color={validationErrors.category ? colors.error : colors.primary} style={{ marginRight: 8 }} />
            <Text style={[styles.selectorText, { color: validationErrors.category ? colors.error : colors.text }]}>
              {category || t("propose_anecdote_category_placeholder")}
            </Text>
            <Ionicons name="chevron-down" size={20} color={validationErrors.category ? colors.error : colors.primary} style={{ marginLeft: 15 }} />
          </TouchableOpacity>
        </View>
        
        <View style={[styles.formSection, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            {t("propose_anecdote_question")} <Text style={{ color: colors.error }}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, { 
              borderColor: validationErrors.question ? colors.error : colors.border, 
              backgroundColor: colors.background,
              color: colors.text 
            }]}
            placeholder={t("propose_anecdote_question_placeholder")}
            placeholderTextColor={colors.textMuted}
            value={question}
            onChangeText={(text) => {
              setQuestion(text);
              if (validationErrors.question) {
                setValidationErrors(prev => ({ ...prev, question: false }));
              }
            }}
            multiline
            numberOfLines={3}
            maxLength={200}
          />
        </View>

        <View style={[styles.formSection, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            {t("propose_anecdote_answer")} <Text style={{ color: colors.error }}>*</Text>
          </Text>
          <TextInput
            style={[styles.textArea, { 
              borderColor: validationErrors.answer ? colors.error : colors.border, 
              backgroundColor: colors.background,
              color: colors.text 
            }]}
            placeholder={t("propose_anecdote_answer_placeholder")}
            placeholderTextColor={colors.textMuted}
            value={answer}
            onChangeText={(text) => {
              setAnswer(text);
              if (validationErrors.answer) {
                setValidationErrors(prev => ({ ...prev, answer: false }));
              }
            }}
            multiline
            numberOfLines={4}
            maxLength={500}
          />
        </View>

        {/* Modal de sélection de langue */}
        <Modal
          visible={showLanguageModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowLanguageModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {t("propose_anecdote_language")}
                </Text>
                <TouchableOpacity onPress={() => setShowLanguageModal(false)} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={colors.primary} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity 
                style={styles.modalOption}
                onPress={() => handleLanguageChange('fr')}
              >
                <Text style={{ fontSize: 20, marginRight: 8 }}>🇫🇷</Text>
                <Text style={[styles.modalOptionText, { color: colors.text }]}>{t("french")}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalOption}
                onPress={() => handleLanguageChange('en')}
              >
                <Text style={{ fontSize: 20, marginRight: 8 }}>🇬🇧</Text>
                <Text style={[styles.modalOptionText, { color: colors.text }]}>{t("english")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal de sélection de catégorie */}
        <Modal
          visible={showCategoryModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowCategoryModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {t("propose_anecdote_category")}
                </Text>
                <TouchableOpacity onPress={() => setShowCategoryModal(false)} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={colors.primary} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalScrollView}>
                {categories.map((cat) => (
                  <TouchableOpacity 
                    key={cat.id}
                    style={styles.modalOption}
                    onPress={() => handleCategorySelect(cat.id, cat.label)}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {cat.icon && (
                        <Ionicons name={cat.icon as any} size={20} color={colors.primary} style={{ marginRight: 8 }} />
                      )}
                      <Text style={[styles.modalOptionText, { color: colors.text }]}>{cat.label}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        <TouchableOpacity 
          style={[styles.submitButton, { backgroundColor: colors.primary }]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Ionicons name="send" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.submitButtonText}>
            {isSubmitting ? t("sending") : t("propose_anecdote_submit")}
          </Text>
        </TouchableOpacity>
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
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  formSection: {
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
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
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
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectorButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingRight: 25,
    marginBottom: 15,
  },
  selectorText: {
    fontSize: 16,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalOptionText: {
    fontSize: 18,
    marginLeft: 10,
  },
  modalScrollView: {
    maxHeight: 250, // Adjust as needed for the modal height
  },
}); 