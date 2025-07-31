import AsyncStorage from '@react-native-async-storage/async-storage';
import { Anecdote, AnecdoteCategory, WidgetConfiguration } from '../types/anecdotes';

const WIDGET_CONFIG_KEY = 'widget_configuration';
const ANECDOTES_CACHE_KEY = 'anecdotes_cache';

export class AnecdoteService {
  
  // Configuration du widget
  static async saveWidgetConfiguration(config: WidgetConfiguration): Promise<void> {
    try {
      await AsyncStorage.setItem(WIDGET_CONFIG_KEY, JSON.stringify(config));
      
      // Sauvegarder également dans UserDefaults pour le partage avec iOS
      try {
        const { NativeModules } = require('react-native');
        if (NativeModules.WidgetDataManager) {
          await NativeModules.WidgetDataManager.updateWidgetConfiguration(JSON.stringify(config));
        }
      } catch (error) {
        console.log('Widget data manager not available:', error);
      }
      
      // Mettre à jour les anecdotes du widget
      await this.updateWidgetAnecdotes(config.category);
    } catch (error) {
      console.error('Error saving widget configuration:', error);
    }
  }

  static async getWidgetConfiguration(): Promise<WidgetConfiguration | null> {
    try {
      const config = await AsyncStorage.getItem(WIDGET_CONFIG_KEY);
      return config ? JSON.parse(config) : null;
    } catch (error) {
      console.error('Error getting widget configuration:', error);
      return null;
    }
  }

  // Gestion des anecdotes
  static async getAnecdotesByCategory(category: AnecdoteCategory, limit: number = 10): Promise<Anecdote[]> {
    // Simulation d'anecdotes - à remplacer par votre API
    const sampleAnecdotes: Anecdote[] = [
      {
        id: '1',
        content: 'Les pieuvres ont trois cœurs et du sang bleu.',
        category: AnecdoteCategory.SCIENCE,
        language: 'fr',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        content: 'La Grande Muraille de Chine n\'est pas visible depuis l\'espace à l\'œil nu.',
        category: AnecdoteCategory.HISTORY,
        language: 'fr',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        content: 'Les bananes sont techniquement des baies, mais les fraises ne le sont pas.',
        category: AnecdoteCategory.NATURE,
        language: 'fr',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '4',
        content: 'Le premier ordinateur bug était littéralement un insecte coincé dans un ordinateur.',
        category: AnecdoteCategory.TECHNOLOGY,
        language: 'fr',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '5',
        content: 'Le basketball a été inventé avec des paniers de pêches.',
        category: AnecdoteCategory.SPORTS,
        language: 'fr',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    return sampleAnecdotes.filter(anecdote => anecdote.category === category).slice(0, limit);
  }

  // Mettre à jour les anecdotes pour le widget
  static async updateWidgetAnecdotes(category: AnecdoteCategory): Promise<void> {
    try {
      const anecdotes = await this.getAnecdotesByCategory(category, 20);
      
      // Sauvegarder dans un format accessible par le widget iOS
      const widgetData = {
        anecdotes: anecdotes.map(a => ({
          id: a.id,
          content: a.content,
          category: a.category
        })),
        lastUpdated: new Date().toISOString()
      };

      await AsyncStorage.setItem(ANECDOTES_CACHE_KEY, JSON.stringify(widgetData));
      
      // Sauvegarder également dans UserDefaults pour le partage avec iOS
      try {
        const { NativeModules } = require('react-native');
        if (NativeModules.WidgetDataManager) {
          await NativeModules.WidgetDataManager.updateWidgetData(JSON.stringify(widgetData));
        }
      } catch (error) {
        console.log('Widget data manager not available:', error);
      }
    } catch (error) {
      console.error('Error updating widget anecdotes:', error);
    }
  }

  // Obtenir les anecdotes en cache pour le widget
  static async getCachedAnecdotes(): Promise<any> {
    try {
      const cache = await AsyncStorage.getItem(ANECDOTES_CACHE_KEY);
      return cache ? JSON.parse(cache) : null;
    } catch (error) {
      console.error('Error getting cached anecdotes:', error);
      return null;
    }
  }
}