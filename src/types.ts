export type Language = 'en' | 'ar' | 'fr' | 'es' | 'de' | 'ja' | 'ko';

export interface Translation {
  word: string;
  meaning: string;
  example: string;
}

export interface VocabularyItem {
  id: string;
  word: string;
  ipa: string;
  meaning: string;
  example: string;
  category: string;
  x: number; // Percentage coordinate (0-100) on interaction panel
  y: number; // Percentage coordinate (0-100) on interaction panel
  translations: Record<Language, Translation>;
  relatedWords?: string[];
  image?: string; // High-resolution real photography URL for explainers
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string; // Lucide icon name
  description: string;
  image?: string; // Scene illustration or background URL
  items: VocabularyItem[];
}

export interface UserProgress {
  xp: number;
  streak: number;
  level: number;
  lastActive: string; // ISO date
  learnedWords: string[]; // List of vocab item IDs
  savedWords: string[]; // List of vocab item IDs
  unlockedAchievements: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpRequired: number;
  category?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}
