import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  UserProfile,
  Conversation,
  OnboardingData,
  AppState,
  STORAGE_KEYS,
  DEFAULT_AVATARS,
  CommunicationMode,
} from '../types';

class StorageService {
  // User Profile Management
  async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving user profile:', error);
      throw error;
    }
  }

  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (data) {
        const profile = JSON.parse(data);
        // Convert date strings back to Date objects
        profile.createdAt = new Date(profile.createdAt);
        profile.updatedAt = new Date(profile.updatedAt);
        if (profile.styleData?.lastUpdated) {
          profile.styleData.lastUpdated = new Date(profile.styleData.lastUpdated);
        }
        return profile;
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  async createDefaultUserProfile(): Promise<UserProfile> {
    const randomAvatar = DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];
    const profile: UserProfile = {
      id: `user_${Date.now()}`,
      avatar: randomAvatar,
      preferredMode: 'healthy_communication',
      hasCompletedOnboarding: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await this.saveUserProfile(profile);
    return profile;
  }

  // Conversation Management
  async saveConversations(conversations: Conversation[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    } catch (error) {
      console.error('Error saving conversations:', error);
      throw error;
    }
  }

  async getConversations(): Promise<Conversation[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      if (data) {
        const conversations = JSON.parse(data);
        // Convert date strings back to Date objects
        return conversations.map((conv: any) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting conversations:', error);
      return [];
    }
  }

  async saveConversation(conversation: Conversation): Promise<void> {
    try {
      const conversations = await this.getConversations();
      const existingIndex = conversations.findIndex(c => c.id === conversation.id);
      
      if (existingIndex >= 0) {
        conversations[existingIndex] = conversation;
      } else {
        conversations.push(conversation);
      }
      
      await this.saveConversations(conversations);
    } catch (error) {
      console.error('Error saving conversation:', error);
      throw error;
    }
  }

  async deleteConversation(conversationId: string): Promise<void> {
    try {
      const conversations = await this.getConversations();
      const filteredConversations = conversations.filter(c => c.id !== conversationId);
      await this.saveConversations(filteredConversations);
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }

  // Current Conversation Management
  async saveCurrentConversation(conversation: Conversation | null): Promise<void> {
    try {
      if (conversation) {
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_CONVERSATION, JSON.stringify(conversation));
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_CONVERSATION);
      }
    } catch (error) {
      console.error('Error saving current conversation:', error);
      throw error;
    }
  }

  async getCurrentConversation(): Promise<Conversation | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_CONVERSATION);
      if (data) {
        const conversation = JSON.parse(data);
        // Convert date strings back to Date objects
        conversation.createdAt = new Date(conversation.createdAt);
        conversation.updatedAt = new Date(conversation.updatedAt);
        conversation.messages = conversation.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        return conversation;
      }
      return null;
    } catch (error) {
      console.error('Error getting current conversation:', error);
      return null;
    }
  }

  // Onboarding Management
  async saveOnboardingData(data: OnboardingData): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_STATUS, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      throw error;
    }
  }

  async getOnboardingData(): Promise<OnboardingData | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_STATUS);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting onboarding data:', error);
      return null;
    }
  }

  async completeOnboarding(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.ONBOARDING_STATUS);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  }

  // App State Management
  async saveAppState(state: AppState): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.APP_STATE, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving app state:', error);
      throw error;
    }
  }

  async getAppState(): Promise<AppState | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.APP_STATE);
      if (data) {
        const state = JSON.parse(data);
        // Convert date strings back to Date objects for nested objects
        if (state.currentUser) {
          state.currentUser.createdAt = new Date(state.currentUser.createdAt);
          state.currentUser.updatedAt = new Date(state.currentUser.updatedAt);
          if (state.currentUser.styleData?.lastUpdated) {
            state.currentUser.styleData.lastUpdated = new Date(state.currentUser.styleData.lastUpdated);
          }
        }
        if (state.currentConversation) {
          state.currentConversation.createdAt = new Date(state.currentConversation.createdAt);
          state.currentConversation.updatedAt = new Date(state.currentConversation.updatedAt);
          state.currentConversation.messages = state.currentConversation.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }));
        }
        if (state.conversations) {
          state.conversations = state.conversations.map((conv: any) => ({
            ...conv,
            createdAt: new Date(conv.createdAt),
            updatedAt: new Date(conv.updatedAt),
            messages: conv.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            })),
          }));
        }
        return state;
      }
      return null;
    } catch (error) {
      console.error('Error getting app state:', error);
      return null;
    }
  }

  // Utility Methods
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_PROFILE,
        STORAGE_KEYS.CONVERSATIONS,
        STORAGE_KEYS.CURRENT_CONVERSATION,
        STORAGE_KEYS.ONBOARDING_STATUS,
        STORAGE_KEYS.APP_STATE,
      ]);
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }

  async exportData(): Promise<string> {
    try {
      const allKeys = Object.values(STORAGE_KEYS);
      const data = await AsyncStorage.multiGet(allKeys);
      const exportData: Record<string, any> = {};
      
      data.forEach(([key, value]) => {
        if (value) {
          exportData[key] = JSON.parse(value);
        }
      });
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);
      const storageData: [string, string][] = [];
      
      Object.entries(data).forEach(([key, value]) => {
        if (Object.values(STORAGE_KEYS).includes(key as any)) {
          storageData.push([key, JSON.stringify(value)]);
        }
      });
      
      await AsyncStorage.multiSet(storageData);
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }
}

export default new StorageService(); 