import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { router } from "expo-router";
import { getAuth } from "firebase/auth";
import { arrayUnion, collection, doc, DocumentData, getDoc, getDocs, increment, limit, query, QueryDocumentSnapshot, startAfter, updateDoc } from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Modal, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming
} from "react-native-reanimated";
import { db } from "../../firebase";
import { useDevice } from "../../hooks/useDevice";
import { useTheme } from "../../hooks/useTheme";
import i18n from "../../i18n";

const PAGE_SIZE = 50;
const EMOJIS = ["🎉", "😂", "🤩", "😲", "🔥", "😎", "🦄", "🥳", "🤓", "💡", "✨", "🎈", "🍀", "🚀", "🌈"];

// Configuration des publicités
const AD_UNIT_ID = __DEV__ ? 'ca-app-pub-3940256099942544/6300978111' : 'ca-app-pub-3940256099942544/6300978111'; // ID de test pour le moment

function getRandomEmoji() {
  return EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
}

type Anecdote = {
  id: string;
  question: string;
  answer: string;
  likes?: number;
  dislikes?: number;
  language: string;
  category: string;
  category_id: string;
  category_label: string;
  status: string;
  timestamp: any;
  updated_at: any;
};

type Category = {
  id: string;
  created_by: string;
  icon: string;
  label: string;
  language: string;
  timestamp: any;
};

export default function Home() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { isTablet, width: SCREEN_WIDTH, height: SCREEN_HEIGHT, fontSize, spacing, iconSize } = useDevice();
  
  const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
  
  // Forcer la langue française si elle n'est pas définie
  useEffect(() => {
    if (!i18n.language || i18n.language === 'undefined') {
      i18n.changeLanguage('fr');
    }
  }, []);
  
  const [anecdotes, setAnecdotes] = useState<Anecdote[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [endReached, setEndReached] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const auth = getAuth();

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  
  // Animation pour la carte suivante
  const nextCardTranslateX = useSharedValue(0);
  const nextCardScale = useSharedValue(0.9);
  const nextCardOpacity = useSharedValue(0.5);
  
  // Animations pour la modal de réponse
  const modalScale = useSharedValue(0);
  const modalOpacity = useSharedValue(0);
  const modalTranslateY = useSharedValue(50);

  // Créer les styles dynamiquement
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      zIndex: 1,
    },
    banner: {
      marginTop: isTablet ? 80 : 60,
      alignItems: 'center',
      marginBottom: isTablet ? 12 : 8,
    },
    bannerText: {
      fontSize: isTablet ? 36 : 28,
      fontWeight: 'bold',
      fontFamily: 'System',
      letterSpacing: 1,
      textShadowColor: 'rgba(255, 255, 255, 0.5)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    cardContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: isTablet ? 30 : 20,
      zIndex: 1,
    },
    card: {
      width: isTablet ? SCREEN_WIDTH * 0.8 : SCREEN_WIDTH - 40,
      height: isTablet ? SCREEN_HEIGHT * 0.6 : SCREEN_HEIGHT * 0.5,
      borderRadius: isTablet ? 25 : 20,
      padding: isTablet ? 15 : 10,
      shadowOpacity: 0.2,
      shadowRadius: 15,
      elevation: 8,
      zIndex: 1,
    },
    nextCard: {
      position: 'absolute',
      zIndex: 0,
    },
    cardContent: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: isTablet ? 25 : 20,
    },
    closeButton: {
      position: 'absolute',
      top: -10,
      right: -10,
    },
    showAnswerButton: {
      borderRadius: isTablet ? 30 : 25,
      paddingVertical: isTablet ? 16 : 12,
      paddingHorizontal: isTablet ? 30 : 24,
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: isTablet ? 20 : 15,
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    showAnswerText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: isTablet ? 20 : 16,
      marginRight: 8,
      textAlign: 'center',
      justifyContent: 'center',
    },
    emoji: {
      fontSize: isTablet ? 64 : 48,
      marginBottom: isTablet ? 25 : 20,
    },
    question: {
      fontWeight: 'bold',
      fontSize: isTablet ? 26 : 20,
      marginBottom: isTablet ? 20 : 15,
      textAlign: 'center',
      lineHeight: isTablet ? 36 : 28,
      flexShrink: 1,
      flexWrap: 'wrap',
      paddingHorizontal: isTablet ? 15 : 10,
    },
    answerBubble: {
      backgroundColor: '#B5FFFC',
      borderRadius: 16,
      padding: 20,
      alignSelf: 'stretch',
      flexShrink: 1,
      height: 'auto',
      marginVertical: 10,
      flex: 1,
    },
    answer: {
      fontSize: 16,
      color: '#333',
      textAlign: 'center',
      lineHeight: 24,
      flexShrink: 1,
    },
    likeLabel: {
      position: 'absolute',
      top: '35%',
      right: 40,
      transform: [{ rotate: '15deg' }],
      zIndex: 1,
    },
    likeText: {
      fontSize: isTablet ? 42 : 32,
      fontWeight: 'bold',
      color: '#4CAF50',
      textShadowColor: '#fff',
      textShadowOffset: { width: 2, height: 2 },
      textShadowRadius: 4,
    },
    dislikeLabel: {
      position: 'absolute',
      top: '35%',
      left: 40,
      transform: [{ rotate: '-15deg' }],
      zIndex: 1,
    },
    dislikeText: {
      fontSize: isTablet ? 42 : 32,
      fontWeight: 'bold',
      color: '#F44336',
      textShadowColor: '#fff',
      textShadowOffset: { width: 2, height: 2 },
      textShadowRadius: 4,
    },
    noMoreText: {
      fontSize: isTablet ? 26 : 20,
      textAlign: 'center',
      marginBottom: 20,
    },
    settingsButtonContainer: {
      position: 'absolute',
      top: isTablet ? 60 : 50,
      right: isTablet ? 30 : 24,
      zIndex: 10,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: 20,
      padding: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    categorySelector: {
      paddingHorizontal: isTablet ? 30 : 20,
      paddingVertical: isTablet ? 20 : 15,
    },
    categoryButton: {
      backgroundColor: '#fff',
      borderRadius: isTablet ? 30 : 25,
      paddingVertical: isTablet ? 16 : 12,
      paddingHorizontal: isTablet ? 25 : 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    categoryButtonText: {
      fontSize: isTablet ? 20 : 16,
      fontWeight: '600',
      color: '#333',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: isTablet ? 40 : 20,
    },
    modalContent: {
      backgroundColor: '#fff',
      borderRadius: isTablet ? 25 : 20,
      padding: isTablet ? 30 : 24,
      width: '100%',
      maxWidth: isTablet ? 500 : 400,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: isTablet ? 25 : 20,
    },
    modalTitle: {
      fontSize: isTablet ? 24 : 20,
      fontWeight: 'bold',
      color: '#333',
    },
    categoryOption: {
      paddingVertical: isTablet ? 18 : 15,
      paddingHorizontal: isTablet ? 20 : 16,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    categoryOptionText: {
      fontSize: isTablet ? 18 : 16,
      color: '#333',
    },
    categoryBadge: {
      position: 'absolute',
      top: isTablet ? 20 : 15,
      right: isTablet ? 20 : 15,
      paddingHorizontal: isTablet ? 12 : 8,
      paddingVertical: isTablet ? 6 : 4,
      borderRadius: isTablet ? 15 : 12,
    },
    categoryBadgeText: {
      fontSize: isTablet ? 14 : 12,
      fontWeight: '600',
      color: '#FF6B81',
    },
    likesRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: isTablet ? 20 : 15,
    },
    likesCount: {
      fontSize: isTablet ? 20 : 16,
      fontWeight: '600',
      color: '#4CAF50',
    },
    dislikesCount: {
      fontSize: isTablet ? 20 : 16,
      fontWeight: '600',
      color: '#F44336',
    },
    backToAllButton: {
      backgroundColor: '#FF6B81',
      paddingHorizontal: isTablet ? 25 : 20,
      paddingVertical: isTablet ? 12 : 10,
      borderRadius: isTablet ? 25 : 20,
      marginTop: isTablet ? 15 : 10,
    },
    backToAllText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: isTablet ? 16 : 14,
    },
    answerModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: isTablet ? 30 : 20,
    },
    answerModalContent: {
      width: '100%',
      maxWidth: isTablet ? 500 : 400,
      borderRadius: isTablet ? 25 : 20,
      padding: isTablet ? 30 : 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
    answerModalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: isTablet ? 25 : 20,
    },
    answerModalTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    answerModalTitle: {
      fontSize: isTablet ? 24 : 20,
      fontWeight: 'bold',
    },
    answerModalBody: {
      marginBottom: isTablet ? 30 : 24,
      alignItems: 'center',
    },
    answerModalIconContainer: {
      width: isTablet ? 80 : 60,
      height: isTablet ? 80 : 60,
      borderRadius: isTablet ? 40 : 30,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: isTablet ? 20 : 16,
    },
    answerModalText: {
      fontSize: isTablet ? 18 : 16,
      lineHeight: isTablet ? 28 : 24,
      textAlign: 'center',
    },
    answerModalButton: {
      borderRadius: isTablet ? 15 : 12,
      paddingVertical: isTablet ? 18 : 14,
      paddingHorizontal: isTablet ? 30 : 24,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    answerModalButtonText: {
      color: '#fff',
      fontSize: isTablet ? 18 : 16,
      fontWeight: 'bold',
    },
    bottomAdContainer: {
      width: SCREEN_WIDTH,
      alignItems: 'center',
    },
    adText: {
      fontSize: isTablet ? 14 : 12,
      marginTop: 5,
      fontStyle: 'italic',
    },
  });

  const fetchCategories = useCallback(async () => {
    try {
      const currentLanguage = i18n.language || 'fr';
      const snapshot = await getDocs(collection(db, "categories"));
      let categoriesData: Category[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      // Filtrer les catégories par langue
      categoriesData = categoriesData.filter(category => category.language === currentLanguage);
      
      setCategories(categoriesData);
    } catch (e) {
      console.error("Erreur récupération catégories :", e);
    }
  }, []);

  const fetchAnecdotes = useCallback(async (loadMore = false) => {
    if (loadMore && (loadingMore || endReached)) return;
    if (!loadMore) setLoading(true);
    else setLoadingMore(true);
    
    const currentLanguage = i18n.language || 'fr';
    
    try {
      let q = query(
        collection(db, "anecdotes"),
        limit(PAGE_SIZE)
      );
      
      if (loadMore && lastDoc) {
        q = query(
          collection(db, "anecdotes"),
          startAfter(lastDoc),
          limit(PAGE_SIZE)
        );
      }
      
      const snapshot = await getDocs(q);
      let newAnecdotes: Anecdote[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Anecdote));
      
      // Filtrer par langue
      newAnecdotes = newAnecdotes.filter(anecdote => anecdote.language === currentLanguage);
      
      // Filtrer par status (seulement les anecdotes actives)
      newAnecdotes = newAnecdotes.filter(anecdote => anecdote.status === 'active');
      
      // Filtrer par catégorie si une catégorie est sélectionnée
      if (selectedCategory !== 'all') {

        newAnecdotes = newAnecdotes.filter(anecdote => 
          anecdote.category_id && anecdote.category_id === selectedCategory
        );
        
      }
      
      if (loadMore) {
        setAnecdotes(prev => [...prev, ...newAnecdotes]);
      } else {
        setAnecdotes(newAnecdotes);
      }
      
      if (snapshot.docs.length < PAGE_SIZE) {
        setEndReached(true);
      } else {
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      }
      
    } catch (error) {
      console.error("Erreur lors du chargement des anecdotes:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedCategory, lastDoc, loadingMore, endReached]);

  // Charger les anecdotes au montage et quand la catégorie change
  useEffect(() => {
    setLastDoc(null);
    setEndReached(false);
    setCurrentIndex(0);
    setShowAnswer(false);
    fetchAnecdotes();
    
    // Réinitialiser les animations de la carte suivante
    nextCardTranslateX.value = 0;
    nextCardScale.value = 0.9;
    nextCardOpacity.value = 0.5;
  }, [selectedCategory]);

  // S'assurer que l'index est valide quand les anecdotes changent
  useEffect(() => {
    if (anecdotes.length > 0 && currentIndex >= anecdotes.length) {
      setCurrentIndex(0);
    }
  }, [anecdotes, currentIndex]);

  // Charger les catégories au montage
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Vérifier le statut premium depuis Firestore
  useEffect(() => {
    const checkPremiumStatus = async () => {
      try {
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
    checkPremiumStatus();
  }, []);

  const updateUserLikes = async (anecdoteId: string, type: 'like' | 'dislike') => {
    if (!auth.currentUser) return;
    
    try {
      const userDoc = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userDoc, {
        [`${type}d_anecdotes`]: arrayUnion(anecdoteId)
      });
    } catch (error) {
      console.error(`Erreur lors de la mise à jour des ${type}s utilisateur:`, error);
    }
  };

  const updateAnecdoteCounter = async (anecdoteId: string, type: 'like' | 'dislike') => {
    try {
      const anecdoteDoc = doc(db, 'anecdotes', anecdoteId);
      await updateDoc(anecdoteDoc, {
        [`${type}s`]: increment(1)
      });
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du compteur ${type}:`, error);
    }
  };

  const openAnswerModal = () => {
    setShowAnswerModal(true);
    modalScale.value = withSequence(
      withTiming(1.1, { duration: 200 }),
      withSpring(1, { damping: 15, stiffness: 150 })
    );
    modalOpacity.value = withTiming(1, { duration: 300 });
    modalTranslateY.value = withSpring(0, { damping: 15, stiffness: 150 });
  };

  const closeAnswerModal = () => {
    modalScale.value = withTiming(0, { duration: 200 });
    modalOpacity.value = withTiming(0, { duration: 200 });
    modalTranslateY.value = withTiming(50, { duration: 200 });
    setTimeout(() => setShowAnswerModal(false), 200);
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'right') {
      // Like
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (currentAnecdote) {
        updateUserLikes(currentAnecdote.id, 'like');
        updateAnecdoteCounter(currentAnecdote.id, 'like');
      }
    } else {
      // Dislike
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (currentAnecdote) {
        updateUserLikes(currentAnecdote.id, 'dislike');
        updateAnecdoteCounter(currentAnecdote.id, 'dislike');
      }
    }
    
    // Animation de sortie de la carte actuelle
    translateX.value = withTiming(direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH, { duration: 300 });
    opacity.value = withTiming(0, { duration: 300 });
    
    // Animation d'entrée de la carte suivante
    const nextDirection = direction === 'right' ? -SCREEN_WIDTH : SCREEN_WIDTH;
    nextCardTranslateX.value = nextDirection;
    nextCardScale.value = 0.9;
    nextCardOpacity.value = 0.5;
    
    setTimeout(() => {
      // Passer à l'anecdote suivante
      if (currentIndex < anecdotes.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowAnswer(false);
      } else {
        // Si c'est la dernière anecdote, remettre à zéro
        setCurrentIndex(0);
        setShowAnswer(false);
      }
      
      // Animation d'entrée de la nouvelle carte
      nextCardTranslateX.value = withSpring(0, { damping: 15, stiffness: 150 });
      nextCardScale.value = withSpring(1, { damping: 15, stiffness: 150 });
      nextCardOpacity.value = withSpring(1, { damping: 15, stiffness: 150 });
      
      // Réinitialiser les animations de la carte actuelle
      translateX.value = 0;
      translateY.value = 0;
      scale.value = 1;
      opacity.value = 1;
    }, 300);
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      
      const scaleValue = interpolate(
        Math.abs(event.translationX),
        [0, SCREEN_WIDTH / 2],
        [1, 0.9],
        Extrapolation.CLAMP
      );
      scale.value = scaleValue;
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        const direction = event.translationX > 0 ? 'right' : 'left';
        runOnJS(handleSwipe)(direction);
        
        translateX.value = withTiming(event.translationX > 0 ? SCREEN_WIDTH : -SCREEN_WIDTH);
        opacity.value = withTiming(0);
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        scale.value = withSpring(1);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  const nextCardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: nextCardTranslateX.value },
        { scale: nextCardScale.value },
      ],
      opacity: nextCardOpacity.value,
    };
  });

  const likeOpacity = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SCREEN_WIDTH / 4],
      [0, 1],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  const dislikeOpacity = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 4, 0],
      [1, 0],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  if (loading) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          {/* Bouton settings en haut à droite */}
          <View style={styles.settingsButtonContainer}>
            <TouchableOpacity onPress={() => router.push("/(tabs)/settings")}> 
              <Ionicons name="settings-outline" size={28} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <SafeAreaView style={{ flex: 1 }}>
            <StatusBar barStyle="light-content" />
            <View style={styles.banner}>
              <Text style={[styles.bannerText, { color: colors.primary }]}>{t("Did You Know?")}</Text>
            </View>
            
            {/* Sélecteur de catégories */}
            {categories.length > 0 && (
              <View style={styles.categorySelector}>
                <TouchableOpacity 
                  style={styles.categoryButton}
                  onPress={() => setShowCategoryModal(true)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {selectedCategory !== 'all' && (() => {
                      const selectedCat = categories.find(cat => cat.id === selectedCategory);
                      if (selectedCat?.icon) {
                        return <Ionicons name={selectedCat.icon as any} size={18} color={colors.primary} style={{ marginRight: 8 }} />;
                      }
                      return null;
                    })()}
                    <Text style={styles.categoryButtonText}>
                      {selectedCategory === 'all' 
                        ? t("all_categories")
                        : categories.find(cat => cat.id === selectedCategory)?.label || t("select_category")
                      }
                    </Text>
                  </View>
                  <Ionicons name="chevron-down" size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
            )}

            <View style={[styles.cardContainer, { justifyContent: 'center', alignItems: 'center' }]}>
              <Text style={[styles.noMoreText, { color: colors.primary }]}>
                {selectedCategory === 'all' 
                  ? t("no_more_anecdotes")
                  : t("no_anecdotes_category")
                }
              </Text>
              {selectedCategory !== 'all' && (
                <TouchableOpacity 
                  style={styles.backToAllButton}
                  onPress={() => setSelectedCategory('all')}
                >
                  <Text style={styles.backToAllText}>{t("see_all_categories")}</Text>
                </TouchableOpacity>
              )}
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
            </View>
          </SafeAreaView>
        </View>
      </GestureHandlerRootView>
    );
  }

  const currentAnecdote = anecdotes[currentIndex];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Bouton settings en haut à droite */}
        <View style={styles.settingsButtonContainer}>
          <TouchableOpacity onPress={() => router.push("/(tabs)/settings")}> 
            <Ionicons name="settings-outline" size={28} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <SafeAreaView style={{ flex: 1 }}>
          <StatusBar barStyle="light-content" />
          <View style={styles.banner}>
            <Text style={[styles.bannerText, { color: colors.primary }]}>{t("Did You Know?")}</Text>
          </View>
          
          {/* Sélecteur de catégories */}
          {categories.length > 0 && (
            <View style={styles.categorySelector}>
              <TouchableOpacity 
                style={styles.categoryButton}
                onPress={() => setShowCategoryModal(true)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {selectedCategory !== 'all' && (() => {
                    const selectedCat = categories.find(cat => cat.id === selectedCategory);
                    if (selectedCat?.icon) {
                      return <Ionicons name={selectedCat.icon as any} size={18} color={colors.primary} style={{ marginRight: 8 }} />;
                    }
                    return null;
                  })()}
                  <Text style={styles.categoryButtonText}>
                    {selectedCategory === 'all' 
                      ? t("all_categories") 
                      : categories.find(cat => cat.id === selectedCategory)?.label || t("select_category")
                    }
                  </Text>
                </View>
                <Ionicons name="chevron-down" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          )}

          {/* Modal de sélection de catégorie */}
          <Modal
            visible={showCategoryModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowCategoryModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{t("select_category")}</Text>
                  <TouchableOpacity onPress={() => setShowCategoryModal(false)} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color={colors.primary} />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity 
                  style={styles.categoryOption}
                  onPress={() => {
                    setSelectedCategory('all');
                    setShowCategoryModal(false);
                  }}
                >
                  <Text style={styles.categoryOptionText}>{t("all_categories")}</Text>
                </TouchableOpacity>
                {categories.map((category) => (
                  <TouchableOpacity 
                    key={category.id}
                    style={styles.categoryOption}
                    onPress={() => {
                      setSelectedCategory(category.id);
                      setShowCategoryModal(false);
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {category.icon && (
                        <Ionicons name={category.icon as any} size={18} color={colors.primary} style={{ marginRight: 8 }} />
                      )}
                      <Text style={styles.categoryOptionText}>{category.label}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Modal>

          {/* Modal de réponse */}
          <Modal
            visible={showAnswerModal}
            transparent={true}
            animationType="none"
            onRequestClose={closeAnswerModal}
          >
            <Animated.View style={[styles.answerModalOverlay, { opacity: modalOpacity }]}>
              <Animated.View 
                style={[
                  styles.answerModalContent, 
                  { 
                    backgroundColor: colors.surface,
                    transform: [
                      { scale: modalScale },
                      { translateY: modalTranslateY }
                    ]
                  }
                ]}
              >
                <View style={styles.answerModalHeader}>
                  <View style={styles.answerModalTitleContainer}>
                    <Ionicons name="bulb" size={24} color={colors.primary} style={{ marginRight: 8 }} />
                    <Text style={[styles.answerModalTitle, { color: colors.text }]}>
                      {t("answer")}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    onPress={closeAnswerModal} 
                    style={{ backgroundColor: colors.background }}
                  >
                    <Ionicons name="close" size={20} color={colors.primary} style={styles.closeButton} />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.answerModalBody}>
                  <View style={[styles.answerModalIconContainer, { backgroundColor: colors.primary + '20' }]}>
                    <Ionicons name="chatbubble-ellipses" size={32} color={colors.primary} />
                  </View>
                  <Text style={[styles.answerModalText, { color: colors.textSecondary }]}>
                    {currentAnecdote?.answer}
                  </Text>
                </View>
                
                <TouchableOpacity 
                  style={[styles.answerModalButton, { backgroundColor: colors.primary }]}
                  onPress={closeAnswerModal}
                >
                  <Ionicons name="checkmark" size={24} color="#fff" />
                  <Text style={styles.answerModalButtonText}>{t("got_it")}</Text>
                </TouchableOpacity>
              </Animated.View>
            </Animated.View>
          </Modal>

          <View style={styles.cardContainer}>
            {anecdotes.length > 0 && currentAnecdote ? (
              <>
                {/* Carte suivante en arrière-plan */}
                {anecdotes.length > 1 && (
                  <Animated.View style={[styles.card, styles.nextCard, { backgroundColor: colors.surface, shadowColor: colors.primary }, nextCardAnimatedStyle]}>
                    <View style={styles.cardContent}>
                      {/* <Text style={styles.emoji}>{getRandomEmoji()}</Text> */}
                      
                      {/* Badge de catégorie pour la carte suivante */}
                      {/* {(() => {
                        const nextIndex = currentIndex < anecdotes.length - 1 ? currentIndex + 1 : 0;
                        const nextAnecdote = anecdotes[nextIndex];
                        return nextAnecdote?.category_label && (
                          <View style={[styles.categoryBadge, { backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center' }]}> 
                            {(() => {
                              const cat = categories.find(cat => cat.id === nextAnecdote.category_id);
                              if (cat?.icon) {
                                return <Ionicons name={cat.icon as any} size={16} color="#fff" style={{ marginRight: 6 }} />;
                              }
                              return null;
                            })()}
                            <Text style={[styles.categoryBadgeText, { color: '#fff' }]}> 
                              {nextAnecdote.category_label || categories.find(cat => cat.id === nextAnecdote.category_id)?.label || nextAnecdote.category_id}
                            </Text>
                          </View>
                        );
                      })()} */}
                      
                      <Text style={[styles.question, { color: colors.text }]} numberOfLines={0}>
                        {(() => {
                          const nextIndex = currentIndex < anecdotes.length - 1 ? currentIndex + 1 : 0;
                          return anecdotes[nextIndex]?.question;
                        })()}
                      </Text>
                    </View>
                  </Animated.View>
                )}
                
                {/* Carte actuelle */}
                <GestureDetector gesture={panGesture}>
                  <Animated.View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.primary }, animatedStyle]}>
                    <View style={styles.cardContent}>
                      {/* <Text style={styles.emoji}>{getRandomEmoji()}</Text> */}
                      
                      {/* Badge de catégorie */}
                      {/* {currentAnecdote?.category_label && (
                        <View style={[styles.categoryBadge, { backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center' }]}> 
                          {(() => {
                            const cat = categories.find(cat => cat.id === currentAnecdote.category_id);
                            if (cat?.icon) {
                              return <Ionicons name={cat.icon as any} size={16} color="#fff" style={{ marginRight: 6 }} />;
                            }
                            return null;
                          })()}
                          <Text style={[styles.categoryBadgeText, { color: '#fff' }]}> 
                            {currentAnecdote.category_label || categories.find(cat => cat.id === currentAnecdote.category_id)?.label || currentAnecdote.category_id}
                          </Text>
                        </View>
                      )} */}
                      
                      <Text style={[styles.question, { color: colors.text }]} numberOfLines={0}>
                        {currentAnecdote?.question}
                      </Text>
                      
                      <TouchableOpacity 
                        style={[styles.showAnswerButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]} 
                        onPress={openAnswerModal}
                      >
                        <Text style={styles.showAnswerText}>{t("show_answer")}</Text>
                        <Ionicons name="chevron-down" size={20} color="#fff" />
                      </TouchableOpacity>
                      
                      {/* Affichage des likes/dislikes */}
                      <View style={styles.likesRow}>
                        <Ionicons name="thumbs-up" size={22} color="#4CAF50" style={{ marginRight: 4 }} />
                        <Text style={styles.likesCount}>{currentAnecdote?.likes || 0}</Text>
                        <Ionicons name="thumbs-down" size={22} color="#F44336" style={{ marginLeft: 16, marginRight: 4 }} />
                        <Text style={styles.dislikesCount}>{currentAnecdote?.dislikes || 0}</Text>
                      </View>
                    </View>
                  </Animated.View>
                </GestureDetector>
                <Animated.View style={[styles.likeLabel, likeOpacity]}>
                  <Text style={styles.likeText}>{t("like")}</Text>
                </Animated.View>
                <Animated.View style={[styles.dislikeLabel, dislikeOpacity]}>
                  <Text style={styles.dislikeText}>{t("dislike")}</Text>
                </Animated.View>
              </>
            ) : (
              <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Text style={[styles.noMoreText, { color: colors.primary }]}>
                  {selectedCategory === 'all' 
                    ? t("no_more_anecdotes")
                    : t("no_anecdotes_category")
                  }
                </Text>
                {selectedCategory !== 'all' && (
                  <TouchableOpacity 
                    style={styles.backToAllButton}
                    onPress={() => setSelectedCategory('all')}
                  >
                    <Text style={styles.backToAllText}>{t("see_all_categories")}</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          {/* Bannière publicitaire en bas de page */}
          {!isPremium && (
            <View style={styles.bottomAdContainer}>
              <BannerAd
                unitId={AD_UNIT_ID}
                size={isTablet ? BannerAdSize.ANCHORED_ADAPTIVE_BANNER : BannerAdSize.BANNER}
                requestOptions={{
                  requestNonPersonalizedAdsOnly: true,
                }}
              />
            </View>
          )}
        </SafeAreaView>
      </View>
    </GestureHandlerRootView>
  );
}