import AsyncStorage from '@react-native-async-storage/async-storage';
import { ConversationData, AnalysisResult } from '../types';

export class StorageService {
  private static readonly CONVERSATIONS_KEY = '@conversations';
  private static readonly SETTINGS_KEY = '@settings';
  private static readonly CACHE_KEY = '@cache';

  /**
   * Save conversation data to local storage
   */
  static async saveConversation(conversation: ConversationData): Promise<void> {
    try {
      const existingConversations = await this.getAllConversations();
      const updatedConversations = [conversation, ...existingConversations];
      
      // Keep only the last 50 conversations to manage storage
      const limitedConversations = updatedConversations.slice(0, 50);
      
      await AsyncStorage.setItem(
        this.CONVERSATIONS_KEY,
        JSON.stringify(limitedConversations)
      );
    } catch (error) {
      console.error('Failed to save conversation:', error);
      throw new Error('Failed to save conversation data');
    }
  }

  /**
   * Get all saved conversations
   */
  static async getAllConversations(): Promise<ConversationData[]> {
    try {
      const conversationsJson = await AsyncStorage.getItem(this.CONVERSATIONS_KEY);
      if (!conversationsJson) return [];
      
      const conversations = JSON.parse(conversationsJson);
      
      // Convert timestamp strings back to Date objects
      return conversations.map((conv: any) => ({
        ...conv,
        timestamp: new Date(conv.timestamp),
        messages: conv.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      }));
    } catch (error) {
      console.error('Failed to load conversations:', error);
      return [];
    }
  }

  /**
   * Get conversation by ID
   */
  static async getConversationById(id: string): Promise<ConversationData | null> {
    try {
      const conversations = await this.getAllConversations();
      return conversations.find(conv => conv.id === id) || null;
    } catch (error) {
      console.error('Failed to get conversation by ID:', error);
      return null;
    }
  }

  /**
   * Delete conversation by ID
   */
  static async deleteConversation(id: string): Promise<void> {
    try {
      const conversations = await this.getAllConversations();
      const filteredConversations = conversations.filter(conv => conv.id !== id);
      
      await AsyncStorage.setItem(
        this.CONVERSATIONS_KEY,
        JSON.stringify(filteredConversations)
      );
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      throw new Error('Failed to delete conversation');
    }
  }

  /**
   * Clear all conversations
   */
  static async clearAllConversations(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.CONVERSATIONS_KEY);
    } catch (error) {
      console.error('Failed to clear conversations:', error);
      throw new Error('Failed to clear conversation data');
    }
  }

  /**
   * Save app settings
   */
  static async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw new Error('Failed to save settings');
    }
  }

  /**
   * Get app settings
   */
  static async getSettings(): Promise<AppSettings> {
    try {
      const settingsJson = await AsyncStorage.getItem(this.SETTINGS_KEY);
      if (!settingsJson) return this.getDefaultSettings();
      
      return { ...this.getDefaultSettings(), ...JSON.parse(settingsJson) };
    } catch (error) {
      console.error('Failed to load settings:', error);
      return this.getDefaultSettings();
    }
  }

  /**
   * Cache analysis results to avoid repeated API calls
   */
  static async cacheAnalysisResult(
    conversationId: string,
    analysisResult: AnalysisResult
  ): Promise<void> {
    try {
      const cacheKey = `${this.CACHE_KEY}_${conversationId}`;
      const cacheData = {
        ...analysisResult,
        cachedAt: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to cache analysis result:', error);
    }
  }

  /**
   * Get cached analysis result
   */
  static async getCachedAnalysisResult(
    conversationId: string
  ): Promise<AnalysisResult | null> {
    try {
      const cacheKey = `${this.CACHE_KEY}_${conversationId}`;
      const cachedJson = await AsyncStorage.getItem(cacheKey);
      
      if (!cachedJson) return null;
      
      const cachedData = JSON.parse(cachedJson);
      const cachedAt = new Date(cachedData.cachedAt);
      const now = new Date();
      
      // Cache expires after 1 hour
      const oneHour = 60 * 60 * 1000;
      if (now.getTime() - cachedAt.getTime() > oneHour) {
        await AsyncStorage.removeItem(cacheKey);
        return null;
      }
      
      // Remove cache metadata before returning
      const { cachedAt: _, ...analysisResult } = cachedData;
      return analysisResult;
    } catch (error) {
      console.error('Failed to get cached analysis result:', error);
      return null;
    }
  }

  /**
   * Get storage usage statistics
   */
  static async getStorageStats(): Promise<StorageStats> {
    try {
      const conversations = await this.getAllConversations();
      const allKeys = await AsyncStorage.getAllKeys();
      const conversationKeys = allKeys.filter(key => key.startsWith(this.CONVERSATIONS_KEY));
      const cacheKeys = allKeys.filter(key => key.startsWith(this.CACHE_KEY));
      
      return {
        totalConversations: conversations.length,
        totalCachedAnalyses: cacheKeys.length,
        oldestConversation: conversations.length > 0 
          ? conversations[conversations.length - 1].timestamp 
          : null,
        newestConversation: conversations.length > 0 
          ? conversations[0].timestamp 
          : null,
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return {
        totalConversations: 0,
        totalCachedAnalyses: 0,
        oldestConversation: null,
        newestConversation: null,
      };
    }
  }

  /**
   * Clear expired cache entries
   */
  static async clearExpiredCache(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => key.startsWith(this.CACHE_KEY));
      
      const expiredKeys: string[] = [];
      const oneHour = 60 * 60 * 1000;
      const now = new Date();
      
      for (const key of cacheKeys) {
        try {
          const cachedJson = await AsyncStorage.getItem(key);
          if (cachedJson) {
            const cached = JSON.parse(cachedJson);
            const cachedAt = new Date(cached.cachedAt);
            
            if (now.getTime() - cachedAt.getTime() > oneHour) {
              expiredKeys.push(key);
            }
          }
        } catch (error) {
          // If we can't parse the cached data, consider it expired
          expiredKeys.push(key);
        }
      }
      
      if (expiredKeys.length > 0) {
        await AsyncStorage.multiRemove(expiredKeys);
      }
    } catch (error) {
      console.error('Failed to clear expired cache:', error);
    }
  }

  /**
   * Get default app settings
   */
  private static getDefaultSettings(): AppSettings {
    return {
      apiKey: '',
      autoSaveConversations: true,
      analysisType: 'full',
      notificationsEnabled: true,
      theme: 'light',
      maxStoredConversations: 50,
    };
  }
}

// Types for settings and storage stats
export interface AppSettings {
  apiKey: string;
  autoSaveConversations: boolean;
  analysisType: 'full' | 'quick' | 'suggestions';
  notificationsEnabled: boolean;
  theme: 'light' | 'dark';
  maxStoredConversations: number;
}

export interface StorageStats {
  totalConversations: number;
  totalCachedAnalyses: number;
  oldestConversation: Date | null;
  newestConversation: Date | null;
} 