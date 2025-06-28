import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { OCRService } from '../services/OCRService';
import { AIService } from '../services/AIService';
import StorageService from '../services/StorageService';
import { CommunicationMode, UserProfile, AIRequest } from '../types';

const { width } = Dimensions.get('window');

interface ResponseOption {
  id: string;
  title: string;
  content: string;
  tone: string;
  rationale: string;
}

const AnalysisScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { imageUri, mode } = route.params as { imageUri: string; mode: CommunicationMode };

  const [isProcessing, setIsProcessing] = useState(true);
  const [extractedText, setExtractedText] = useState('');
  const [responseOptions, setResponseOptions] = useState<ResponseOption[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    processImage();
  }, []);

  const processImage = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      // Load user profile
      const profile = await StorageService.getUserProfile();
      setUserProfile(profile);

      // Extract text from image
      const ocrResult = await OCRService.extractConversationFromImage(imageUri);
      const textValidation = OCRService.validateConversationText(ocrResult.extractedText);
      
      if (!textValidation.isValid) {
        setError(textValidation.message);
        return;
      }

      setExtractedText(ocrResult.extractedText);

      // Generate multiple response options using AI
      await generateResponseOptions(ocrResult.extractedText, mode, profile);

    } catch (error) {
      console.error('Error processing image:', error);
      setError('Failed to process the uploaded image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const generateResponseOptions = async (text: string, communicationMode: CommunicationMode, profile: UserProfile | null) => {
    try {
      // Generate multiple AI responses
      const options: ResponseOption[] = [];

      if (communicationMode === 'hard_fight') {
        // Generate strategic/aggressive response options
        const prompts = [
          'Generate a strategic, assertive response that establishes dominance in this conversation',
          'Create a response that uses psychological pressure to gain advantage', 
          'Provide a clever counterargument that puts the other person on the defensive',
          'Generate a response that redirects blame and maintains your position'
        ];

        for (let i = 0; i < prompts.length; i++) {
          const aiRequest: AIRequest = {
            inputText: `${prompts[i]}:\n\n${text}`,
            mode: communicationMode,
            conversationContext: 'Strategic conversation analysis',
            userStyleData: profile?.styleData,
          };

          const response = await AIService.generateResponse(aiRequest);
          
          options.push({
            id: `strategic_${i}`,
            title: ['Strategic Response', 'Psychological Advantage', 'Counter-Attack', 'Defensive Redirection'][i],
            content: response.response,
            tone: ['Assertive', 'Pressured', 'Aggressive', 'Defensive'][i],
            rationale: `Designed to ${['establish dominance', 'create psychological pressure', 'put them on defense', 'redirect blame'][i]} in the conversation`
          });
        }
      } else {
        // Generate healthy communication response options
        const prompts = [
          'Generate an empathetic response that acknowledges their feelings and builds understanding',
          'Create a response that asks clarifying questions to better understand their perspective',
          'Provide a solution-focused response that moves the conversation forward constructively',
          'Generate a response that validates their concerns while sharing your viewpoint'
        ];

        for (let i = 0; i < prompts.length; i++) {
          const aiRequest: AIRequest = {
            inputText: `${prompts[i]}:\n\n${text}`,
            mode: communicationMode,
            conversationContext: 'Healthy communication analysis',
            userStyleData: profile?.styleData,
          };

          const response = await AIService.generateResponse(aiRequest);
          
          options.push({
            id: `healthy_${i}`,
            title: ['Empathetic Response', 'Clarifying Questions', 'Solution-Focused', 'Validating Response'][i],
            content: response.response,
            tone: ['Empathetic', 'Curious', 'Constructive', 'Validating'][i],
            rationale: `Designed to ${['build empathy', 'gain understanding', 'find solutions', 'validate feelings'][i]} and strengthen the relationship`
          });
        }
      }

      setResponseOptions(options);
    } catch (error) {
      console.error('Error generating response options:', error);
      setError('Failed to generate response options. Please check your internet connection.');
    }
  };

  const selectOption = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const useSelectedResponse = () => {
    if (!selectedOption) {
      Alert.alert('No Selection', 'Please select a response option first.');
      return;
    }

    const option = responseOptions.find(opt => opt.id === selectedOption);
    if (option) {
      // Copy to clipboard or navigate to chat with the selected response
      Alert.alert(
        'Response Selected',
        'Response copied! You can now paste it in your conversation.',
        [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]
      );
    }
  };

  const getModeInfo = () => {
    if (mode === 'hard_fight') {
      return {
        title: '🥊 Strategic Response Analysis',
        subtitle: 'Tactical options to gain conversational advantage',
        color: '#ff4444',
        backgroundColor: '#ffe6e6',
      };
    } else {
      return {
        title: '💚 Healthy Communication Analysis',
        subtitle: 'Constructive responses to build understanding',
        color: '#28a745',
        backgroundColor: '#e6ffe6',
      };
    }
  };

  const modeInfo = getModeInfo();

  if (isProcessing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={modeInfo.color} />
          <Text style={styles.loadingTitle}>Processing Your Image</Text>
          <Text style={styles.loadingSubtitle}>Extracting text and generating response options...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Processing Error</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={processImage}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: modeInfo.backgroundColor }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackButton}>
          <Text style={styles.headerBackText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: modeInfo.color }]}>{modeInfo.title}</Text>
          <Text style={styles.headerSubtitle}>{modeInfo.subtitle}</Text>
        </View>
        <Text style={styles.avatarEmoji}>{userProfile?.avatar.emoji || '🐱'}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Original Image */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📷 Uploaded Image</Text>
          <Image source={{ uri: imageUri }} style={styles.uploadedImage} />
        </View>

        {/* Extracted Text */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Extracted Text</Text>
          <View style={styles.textContainer}>
            <Text style={styles.extractedText}>{extractedText}</Text>
          </View>
        </View>

        {/* Response Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {mode === 'hard_fight' ? '⚔️ Strategic Response Options' : '💚 Healthy Response Options'}
          </Text>
          {responseOptions.map((option, index) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                selectedOption === option.id && { borderColor: modeInfo.color, borderWidth: 2 },
                { backgroundColor: selectedOption === option.id ? modeInfo.backgroundColor : '#ffffff' }
              ]}
              onPress={() => selectOption(option.id)}
            >
              <View style={styles.optionHeader}>
                <Text style={[styles.optionTitle, { color: modeInfo.color }]}>
                  {option.title}
                </Text>
                <Text style={styles.optionTone}>{option.tone}</Text>
              </View>
              <Text style={styles.optionContent}>{option.content}</Text>
              <Text style={styles.optionRationale}>{option.rationale}</Text>
              {selectedOption === option.id && (
                <Text style={[styles.selectedIndicator, { color: modeInfo.color }]}>✓ Selected</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <TouchableOpacity 
          style={[
            styles.useResponseButton,
            { backgroundColor: selectedOption ? modeInfo.color : '#6c757d' }
          ]}
          onPress={useSelectedResponse}
          disabled={!selectedOption}
        >
          <Text style={styles.useResponseButtonText}>
            {selectedOption ? 'Use Selected Response' : 'Select a Response Option'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    paddingHorizontal: 20,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginTop: 20,
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  backButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerBackButton: {
    padding: 8,
  },
  headerBackText: {
    fontSize: 24,
    color: '#007bff',
  },
  headerCenter: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2,
  },
  avatarEmoji: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 12,
  },
  uploadedImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'contain',
  },
  textContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  extractedText: {
    fontSize: 16,
    color: '#495057',
    lineHeight: 24,
  },
  optionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  optionTone: {
    fontSize: 12,
    color: '#6c757d',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  optionContent: {
    fontSize: 15,
    color: '#495057',
    lineHeight: 22,
    marginBottom: 8,
  },
  optionRationale: {
    fontSize: 13,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  selectedIndicator: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'right',
  },
  bottomAction: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  useResponseButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  useResponseButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AnalysisScreen; 