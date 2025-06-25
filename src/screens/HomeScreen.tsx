import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { ImagePickerService } from '../services/ImagePickerService';
import { OCRService } from '../services/OCRService';
import { AIService } from '../services/AIService';
import { StorageService } from '../services/StorageService';
import { ConversationData, AnalysisResult } from '../types';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [recentConversations, setRecentConversations] = useState<ConversationData[]>([]);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    loadRecentConversations();
    checkApiKey();
  }, []);

  const loadRecentConversations = async () => {
    try {
      const conversations = await StorageService.getAllConversations();
      setRecentConversations(conversations.slice(0, 3)); // Show only 3 most recent
    } catch (error) {
      console.error('Failed to load recent conversations:', error);
    }
  };

  const checkApiKey = async () => {
    try {
      const settings = await StorageService.getSettings();
      setHasApiKey(!!settings.apiKey);
    } catch (error) {
      console.error('Failed to check API key:', error);
    }
  };

  const handleImagePick = async () => {
    if (!hasApiKey) {
      Alert.alert(
        'API Key Required',
        'Please configure your OpenAI API key in settings before analyzing conversations.',
        [{ text: 'Go to Settings', onPress: () => navigation.navigate('Settings') }]
      );
      return;
    }

    setIsLoading(true);
    try {
      const imageResult = await ImagePickerService.pickImage();
      if (!imageResult) {
        setIsLoading(false);
        return;
      }

      const validation = ImagePickerService.validateImageForOCR(imageResult);
      if (!validation.isValid) {
        Alert.alert('Image Validation Failed', validation.message);
        setIsLoading(false);
        return;
      }

      // Extract text from image
      const ocrResult = await OCRService.extractTextFromImage(imageResult.uri);
      if (ocrResult.text.length < 10) {
        Alert.alert(
          'Low Text Content',
          'Very little text was detected in this image. Please try a clearer screenshot.'
        );
        setIsLoading(false);
        return;
      }

      // Process conversation data
      const conversationData = await OCRService.processConversationFromOCR(
        imageResult.uri,
        ocrResult
      );

      // Navigate to analysis screen
      navigation.navigate('Analysis', { 
        conversationData,
        imageMetadata: ImagePickerService.getImageMetadata(imageResult)
      });

    } catch (error) {
      console.error('Image processing failed:', error);
      Alert.alert('Processing Failed', 'Failed to process the image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToConversation = (conversation: ConversationData) => {
    navigation.navigate('Analysis', { conversationData: conversation });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Processing image...</Text>
        <Text style={styles.loadingSubtext}>Extracting and analyzing conversation text</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Communication Assistant</Text>
        <Text style={styles.subtitle}>
          Analyze conversations and improve communication
        </Text>
      </View>

      <View style={styles.mainActions}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleImagePick}>
          <Text style={styles.primaryButtonText}>📱 Analyze Conversation</Text>
          <Text style={styles.buttonSubtext}>
            Upload a screenshot to get insights and suggestions
          </Text>
        </TouchableOpacity>

        <View style={styles.secondaryActions}>
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('History')}
          >
            <Text style={styles.secondaryButtonText}>📚 Conversation History</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.secondaryButtonText}>⚙️ Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      {!hasApiKey && (
        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>⚠️ Setup Required</Text>
          <Text style={styles.warningText}>
            Add your OpenAI API key in settings to enable conversation analysis.
          </Text>
          <TouchableOpacity 
            style={styles.warningButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.warningButtonText}>Configure Now</Text>
          </TouchableOpacity>
        </View>
      )}

      {recentConversations.length > 0 && (
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Conversations</Text>
          {recentConversations.map((conversation) => (
            <TouchableOpacity
              key={conversation.id}
              style={styles.conversationCard}
              onPress={() => navigateToConversation(conversation)}
            >
              <View style={styles.conversationHeader}>
                <Text style={styles.conversationDate}>
                  {formatDate(conversation.timestamp)}
                </Text>
                <Text style={styles.conversationTone}>
                  {conversation.conversationTone.overallTone}
                </Text>
              </View>
              <Text style={styles.conversationPreview} numberOfLines={2}>
                {conversation.extractedText.slice(0, 100)}...
              </Text>
              <Text style={styles.participantCount}>
                {conversation.participants.length} participants
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.helpSection}>
        <Text style={styles.helpTitle}>How it works</Text>
        <Text style={styles.helpText}>
          1. Take a screenshot or select an image of your conversation{'\n'}
          2. Our AI analyzes the communication patterns and tone{'\n'}
          3. Get constructive suggestions for better communication{'\n'}
          4. Review insights to improve future conversations
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    color: '#333',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  mainActions: {
    padding: 20,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 4,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryButton: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    flex: 0.48,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  warningCard: {
    margin: 20,
    padding: 16,
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    borderLeft: 4,
    borderLeftColor: '#ffc107',
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 12,
  },
  warningButton: {
    backgroundColor: '#ffc107',
    padding: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  warningButtonText: {
    color: '#856404',
    fontWeight: '600',
    fontSize: 12,
  },
  recentSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  conversationCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  conversationDate: {
    fontSize: 12,
    color: '#666',
  },
  conversationTone: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  conversationPreview: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  participantCount: {
    fontSize: 12,
    color: '#999',
  },
  helpSection: {
    padding: 20,
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
}); 