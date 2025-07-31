export interface Anecdote {
  id: string;
  content: string;
  category: AnecdoteCategory;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum AnecdoteCategory {
  SCIENCE = 'science',
  HISTORY = 'history',
  NATURE = 'nature',
  TECHNOLOGY = 'technology',
  SPORTS = 'sports',
  CULTURE = 'culture',
  GENERAL = 'general'
}

export interface WidgetConfiguration {
  category: AnecdoteCategory;
  scrollInterval: number; // en secondes
  refreshInterval: number; // en minutes
}

export const CATEGORY_LABELS: Record<AnecdoteCategory, { fr: string; en: string }> = {
  [AnecdoteCategory.SCIENCE]: { fr: 'Science', en: 'Science' },
  [AnecdoteCategory.HISTORY]: { fr: 'Histoire', en: 'History' },
  [AnecdoteCategory.NATURE]: { fr: 'Nature', en: 'Nature' },
  [AnecdoteCategory.TECHNOLOGY]: { fr: 'Technologie', en: 'Technology' },
  [AnecdoteCategory.SPORTS]: { fr: 'Sports', en: 'Sports' },
  [AnecdoteCategory.CULTURE]: { fr: 'Culture', en: 'Culture' },
  [AnecdoteCategory.GENERAL]: { fr: 'Général', en: 'General' }
};