import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  Switch
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { AnecdoteCategory, WidgetConfiguration, CATEGORY_LABELS } from '../../types/anecdotes';
import { AnecdoteService } from '../../services/AnecdoteService';
import { useTranslation } from 'react-i18next';

export default function WidgetConfigScreen() {
  const { t } = useTranslation();
  const [category, setCategory] = useState<AnecdoteCategory>(AnecdoteCategory.GENERAL);
  const [scrollInterval, setScrollInterval] = useState<number>(5);
  const [refreshInterval, setRefreshInterval] = useState<number>(30);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCurrentConfiguration();
  }, []);

  const loadCurrentConfiguration = async () => {
    try {
      const config = await AnecdoteService.getWidgetConfiguration();
      if (config) {
        setCategory(config.category);
        setScrollInterval(config.scrollInterval);
        setRefreshInterval(config.refreshInterval);
      }
    } catch (error) {
      console.error('Error loading widget configuration:', error);
    }
  };

  const saveConfiguration = async () => {
    try {
      setIsLoading(true);
      
      const config: WidgetConfiguration = {
        category,
        scrollInterval,
        refreshInterval
      };

      await AnecdoteService.saveWidgetConfiguration(config);
      
      Alert.alert(
        'Configuration sauvegardée',
        'La configuration du widget a été mise à jour avec succès.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error saving widget configuration:', error);
      Alert.alert(
        'Erreur',
        'Impossible de sauvegarder la configuration du widget.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const scrollIntervals = [3, 5, 10, 15, 30, 60];
  const refreshIntervals = [15, 30, 60, 120, 240];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Configuration du Widget</Text>
        <Text style={styles.subtitle}>
          Personnalisez votre widget d'anecdotes
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Catégorie d'anecdotes</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={category}
            onValueChange={(itemValue) => setCategory(itemValue)}
            style={styles.picker}
          >
            {Object.values(AnecdoteCategory).map((cat) => (
              <Picker.Item
                key={cat}
                label={CATEGORY_LABELS[cat].fr}
                value={cat}
              />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Intervalle de défilement</Text>
        <Text style={styles.sectionDescription}>
          Temps entre chaque changement d'anecdote
        </Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={scrollInterval}
            onValueChange={(itemValue) => setScrollInterval(itemValue)}
            style={styles.picker}
          >
            {scrollIntervals.map((interval) => (
              <Picker.Item
                key={interval}
                label={`${interval} seconde${interval > 1 ? 's' : ''}`}
                value={interval}
              />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Intervalle de rafraîchissement</Text>
        <Text style={styles.sectionDescription}>
          Fréquence de mise à jour des anecdotes
        </Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={refreshInterval}
            onValueChange={(itemValue) => setRefreshInterval(itemValue)}
            style={styles.picker}
          >
            {refreshIntervals.map((interval) => (
              <Picker.Item
                key={interval}
                label={`${interval} minute${interval > 1 ? 's' : ''}`}
                value={interval}
              />
            ))}
          </Picker>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
        onPress={saveConfiguration}
        disabled={isLoading}
      >
        <Text style={styles.saveButtonText}>
          {isLoading ? 'Sauvegarde...' : 'Sauvegarder la configuration'}
        </Text>
      </TouchableOpacity>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Comment ajouter le widget :</Text>
        <Text style={styles.infoText}>
          1. Maintenez appuyé sur l'écran d'accueil{'\n'}
          2. Appuyez sur le bouton "+" en haut à gauche{'\n'}
          3. Recherchez "DidYouKnow"{'\n'}
          4. Sélectionnez la taille souhaitée{'\n'}
          5. Appuyez sur "Ajouter le widget"
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#15061e',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  pickerContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  picker: {
    height: 50,
  },
  saveButton: {
    backgroundColor: '#15061e',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: '#e3f2fd',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
  },
});