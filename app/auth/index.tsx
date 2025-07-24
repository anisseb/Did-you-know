import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import {
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signInWithEmailAndPassword
} from 'firebase/auth';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { auth, db } from '../../firebase';

const firebaseErrorMessages: Record<string, string> = {
  'auth/invalid-email': "Adresse email invalide",
  'auth/user-disabled': "Ce compte a été désactivé",
  'auth/user-not-found': "Aucun compte associé à cette adresse email",
  'auth/wrong-password': "Mot de passe incorrect",
  'auth/email-already-in-use': "Cette adresse email est déjà utilisée",
  'auth/weak-password': "Le mot de passe est trop faible (8 caractères minimum)",
  'auth/too-many-requests': "Trop de tentatives, réessayez plus tard",
};

export default function AuthScreen() {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('fr');

  // Charger la langue sauvegardée au démarrage
  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('userLanguage');
      if (savedLanguage) {
        setSelectedLanguage(savedLanguage);
        i18n.changeLanguage(savedLanguage);
      }
    } catch (error) {
      console.log('Erreur lors du chargement de la langue:', error);
    }
  };

  const changeLanguage = async (language: 'fr' | 'en') => {
    try {
      setSelectedLanguage(language);
      i18n.changeLanguage(language);
      await AsyncStorage.setItem('userLanguage', language);
    } catch (error) {
      console.log('Erreur lors de la sauvegarde de la langue:', error);
    }
  };

  const saveLanguageToFirebase = async (userId: string) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        settings: {
          language: selectedLanguage,
        }
      });
    } catch (error) {
      console.log('Erreur lors de la sauvegarde des paramètres:', error);
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    setError("");
    if (password !== confirmPassword) {
      setError(t("passwords_dont_match"));
      setLoading(false);
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await auth.currentUser?.getIdToken(true);
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: userCredential.user.email,
        createdAt: new Date().toISOString()
      });
      // Sauvegarder la langue dans Firebase
      await saveLanguageToFirebase(userCredential.user.uid);
      router.replace("/(tabs)");
    } catch (e: any) {
      setError(firebaseErrorMessages[e.code] || e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Sauvegarder la langue dans Firebase
      await saveLanguageToFirebase(userCredential.user.uid);
      router.replace("/(tabs)");
    } catch (e: any) {
      setError(firebaseErrorMessages[e.code] || e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setResetLoading(true);
    setResetMessage("");
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage(t("reset_email_sent"));
    } catch (e: any) {
      setResetMessage(firebaseErrorMessages[e.code] || e.message);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.gradientBg}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        {/* Sélecteur de langue */}
        <View style={styles.languageSelector}>
          <TouchableOpacity
            style={[
              styles.languageButton,
              selectedLanguage === 'fr' && styles.languageButtonActive
            ]}
            onPress={() => changeLanguage('fr')}
          >
            <Text style={[
              styles.languageText,
              selectedLanguage === 'fr' && styles.languageTextActive
            ]}>
              🇫🇷 Français
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.languageButton,
              selectedLanguage === 'en' && styles.languageButtonActive
            ]}
            onPress={() => changeLanguage('en')}
          >
            <Text style={[
              styles.languageText,
              selectedLanguage === 'en' && styles.languageTextActive
            ]}>
              🇬🇧 English
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>{t("welcome")} 👋</Text>
        <Text style={styles.subtitle}>
          {isSignUp ? t("create_account") : t("sign_in_account")}
        </Text>
        <TextInput
          style={styles.input}
          placeholder={t("email")}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor="#aaa"
        />
        <TextInput
          style={styles.input}
          placeholder={t("password")}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#aaa"
        />
        {isSignUp && (
          <TextInput
            style={styles.input}
            placeholder={t("confirm_password")}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholderTextColor="#aaa"
          />
        )}
        {!isSignUp && (
          <TouchableOpacity style={styles.forgotLink} onPress={() => setShowResetModal(true)}>
            <Text style={styles.forgotText}>{t("forgot_password")}</Text>
          </TouchableOpacity>
        )}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity
          style={styles.button}
          onPress={isSignUp ? handleSignUp : handleSignIn}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {isSignUp ? t("sign_up") : t("sign_in")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.switchLink}
          onPress={() => {
            setIsSignUp((prev) => !prev);
            setError("");
            setConfirmPassword("");
          }}
        >
          <Text style={styles.switchText}>
            {isSignUp ? t("already_account") : t("no_account")}
          </Text>
        </TouchableOpacity>
      </View>
      {/* Modal de reset mot de passe */}
      <Modal
        visible={showResetModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowResetModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t("reset_password")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("email")}
              value={resetEmail}
              onChangeText={setResetEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="#aaa"
            />
            {resetMessage ? <Text style={styles.resetMessage}>{resetMessage}</Text> : null}
            <TouchableOpacity
              style={styles.button}
              onPress={handleResetPassword}
              disabled={resetLoading}
            >
              <Text style={styles.buttonText}>{t("validate")}</Text>
            </TouchableOpacity>
            <Pressable style={styles.closeModal} onPress={() => setShowResetModal(false)}>
              <Text style={styles.closeModalText}>{t("close")}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  gradientBg: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#B5FFFC",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 32,
    width: 320,
    alignItems: "center",
    shadowColor: "#FF6B81",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FF6B81",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#888",
    marginBottom: 24,
  },
  input: {
    width: 240,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#B5FFFC",
    backgroundColor: "#F7F7F7",
    paddingHorizontal: 14,
    marginBottom: 14,
    fontSize: 16,
    color: "#222",
  },
  button: {
    backgroundColor: "#FF6B81",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 8,
    marginBottom: 4,
    width: 200,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  switchLink: {
    marginTop: 12,
  },
  switchText: {
    color: "#60a5fa",
    fontSize: 15,
    textAlign: "center",
    textDecorationLine: "underline",
  },
  buttonOutline: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#FF6B81",
  },
  buttonOutlineText: {
    color: "#FF6B81",
  },
  error: {
    color: "#F44336",
    marginBottom: 8,
    textAlign: "center",
    fontSize: 14,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  forgotText: {
    color: '#60a5fa',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: 320,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B81',
    marginBottom: 16,
  },
  resetMessage: {
    color: '#60a5fa',
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 14,
  },
  closeModal: {
    marginTop: 12,
    padding: 8,
  },
  closeModalText: {
    color: '#60a5fa',
    fontSize: 15,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  languageSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  languageButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  languageButtonActive: {
    backgroundColor: '#FF6B81',
    borderColor: '#FF6B81',
  },
  languageText: {
    fontSize: 14,
    color: '#333',
  },
  languageTextActive: {
    color: '#fff',
  },
}); 