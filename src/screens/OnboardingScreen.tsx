import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AIService } from '../services/AIService';
import StorageService from '../services/StorageService';
import { 
  OnboardingData, 
  OnboardingStep, 
  CommunicationMode, 
  AnimalAvatar, 
  DEFAULT_AVATARS,
  UserProfile,
} from '../types';

const { width } = Dimensions.get('window');

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation();
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    currentStep: 0,
    steps: [
      {
        id: 'welcome',
        title: 'Welcome!',
        description: 'Let\'s personalize your communication assistant',
        completed: false,
      },
      {
        id: 'avatar',
        title: 'Choose Your Avatar',
        description: 'Pick an animal that represents you',
        completed: false,
      },
      {
        id: 'mode',
        title: 'Communication Style',
        description: 'How do you prefer to handle conversations?',
        completed: false,
      },
      {
        id: 'samples',
        title: 'Writing Samples',
        description: 'Help us learn your communication style',
        completed: false,
      },
      {
        id: 'analysis',
        title: 'Style Analysis',
        description: 'We\'re analyzing your communication patterns',
        completed: false,
      },
    ],
    textSamples: [],
    selectedMode: 'healthy_communication',
  });

  const [selectedAvatar, setSelectedAvatar] = useState<AnimalAvatar>(DEFAULT_AVATARS[0]);
  const [currentTextSample, setCurrentTextSample] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progressAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    animateProgress();
  }, [onboardingData.currentStep]);

  const animateProgress = () => {
    const progress = (onboardingData.currentStep + 1) / onboardingData.steps.length;
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  const goToNextStep = () => {
    if (onboardingData.currentStep < onboardingData.steps.length - 1) {
      const updatedSteps = [...onboardingData.steps];
      updatedSteps[onboardingData.currentStep].completed = true;
      
      setOnboardingData({
        ...onboardingData,
        currentStep: onboardingData.currentStep + 1,
        steps: updatedSteps,
      });
    }
  };

  const goToPreviousStep = () => {
    if (onboardingData.currentStep > 0) {
      setOnboardingData({
        ...onboardingData,
        currentStep: onboardingData.currentStep - 1,
      });
    }
  };

  const addTextSample = () => {
    if (currentTextSample.trim().length < 20) {
      Alert.alert('Too Short', 'Please provide a text sample with at least 20 characters to better understand your style.');
      return;
    }

    const updatedSamples = [...onboardingData.textSamples, currentTextSample.trim()];
    setOnboardingData({
      ...onboardingData,
      textSamples: updatedSamples,
    });
    setCurrentTextSample('');
  };

  const removeTextSample = (index: number) => {
    const updatedSamples = onboardingData.textSamples.filter((_, i) => i !== index);
    setOnboardingData({
      ...onboardingData,
      textSamples: updatedSamples,
    });
  };

  const completeOnboarding = async () => {
    setIsAnalyzing(true);
    
    try {
      // Analyze user's writing style
      const styleData = await AIService.analyzeUserStyle(onboardingData.textSamples);
      
      // Create user profile
      const userProfile: UserProfile = {
        id: `user_${Date.now()}`,
        avatar: selectedAvatar,
        preferredMode: onboardingData.selectedMode,
        styleData,
        hasCompletedOnboarding: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await StorageService.saveUserProfile(userProfile);
      await StorageService.completeOnboarding();

      // Navigate to main app
      (navigation as any).reset({
        index: 0,
        routes: [{ name: 'MainScreen' }],
      });
    } catch (error) {
      console.error('Onboarding completion error:', error);
      Alert.alert('Error', 'Failed to complete setup. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderCurrentStep = () => {
    const currentStepData = onboardingData.steps[onboardingData.currentStep];

    switch (currentStepData.id) {
      case 'welcome':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepIcon}>👋</Text>
            <Text style={styles.stepTitle}>{currentStepData.title}</Text>
            <Text style={styles.stepDescription}>
              We'll help you set up a personalized communication assistant that learns your unique style and preferences.
            </Text>
            <Text style={styles.stepSubtext}>
              This will take about 3-5 minutes and will greatly improve your experience.
            </Text>
          </View>
        );

      case 'avatar':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepIcon}>🎭</Text>
            <Text style={styles.stepTitle}>{currentStepData.title}</Text>
            <Text style={styles.stepDescription}>{currentStepData.description}</Text>
            
            <View style={styles.avatarGrid}>
              {DEFAULT_AVATARS.map((avatar) => (
                <TouchableOpacity
                  key={avatar.id}
                  style={[
                    styles.avatarOption,
                    selectedAvatar.id === avatar.id && styles.avatarSelected,
                  ]}
                  onPress={() => setSelectedAvatar(avatar)}
                >
                  <Text style={styles.avatarEmoji}>{avatar.emoji}</Text>
                  <Text style={styles.avatarName}>{avatar.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'mode':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepIcon}>⚡</Text>
            <Text style={styles.stepTitle}>{currentStepData.title}</Text>
            <Text style={styles.stepDescription}>{currentStepData.description}</Text>

            <View style={styles.modeOptions}>
              <TouchableOpacity
                style={[
                  styles.modeOption,
                  onboardingData.selectedMode === 'healthy_communication' && styles.modeSelected,
                  { borderColor: '#28a745' },
                ]}
                onPress={() => setOnboardingData({ ...onboardingData, selectedMode: 'healthy_communication' })}
              >
                <Text style={styles.modeIcon}>💚</Text>
                <Text style={styles.modeTitle}>Healthy Communication</Text>
                <Text style={styles.modeDescription}>
                  Focus on building understanding, empathy, and stronger relationships
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modeOption,
                  onboardingData.selectedMode === 'hard_fight' && styles.modeSelected,
                  { borderColor: '#ff4444' },
                ]}
                onPress={() => setOnboardingData({ ...onboardingData, selectedMode: 'hard_fight' })}
              >
                <Text style={styles.modeIcon}>🥊</Text>
                <Text style={styles.modeTitle}>Strategic Advantage</Text>
                <Text style={styles.modeDescription}>
                  Get tactical responses to gain advantage in conversations and arguments
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'samples':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepIcon}>✍️</Text>
            <Text style={styles.stepTitle}>{currentStepData.title}</Text>
            <Text style={styles.stepDescription}>
              Provide 3-5 examples of how you typically write messages. This helps us match your communication style.
            </Text>

            <View style={styles.sampleInput}>
              <TextInput
                style={styles.textInput}
                placeholder="Type a message you would typically send to someone..."
                value={currentTextSample}
                onChangeText={setCurrentTextSample}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={[
                  styles.addSampleButton,
                  currentTextSample.trim().length < 20 && styles.addSampleButtonDisabled,
                ]}
                onPress={addTextSample}
                disabled={currentTextSample.trim().length < 20}
              >
                <Text style={styles.addSampleButtonText}>Add Sample</Text>
              </TouchableOpacity>
            </View>

            {/* Display collected samples */}
            <ScrollView style={styles.samplesContainer} showsVerticalScrollIndicator={false}>
              {onboardingData.textSamples.map((sample, index) => (
                <View key={index} style={styles.sampleItem}>
                  <Text style={styles.sampleText}>{sample}</Text>
                  <TouchableOpacity
                    style={styles.removeSampleButton}
                    onPress={() => removeTextSample(index)}
                  >
                    <Text style={styles.removeSampleText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <Text style={styles.samplesCount}>
              {onboardingData.textSamples.length}/5 samples (minimum 3 required)
            </Text>
          </View>
        );

      case 'analysis':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepIcon}>🧠</Text>
            <Text style={styles.stepTitle}>{currentStepData.title}</Text>
            <Text style={styles.stepDescription}>
              We're analyzing your communication patterns to personalize your experience.
            </Text>
            
            {isAnalyzing && (
              <View style={styles.analysisContainer}>
                <Animated.View style={styles.analysisSpinner} />
                <Text style={styles.analysisText}>Analyzing your writing style...</Text>
              </View>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    const currentStepData = onboardingData.steps[onboardingData.currentStep];
    
    switch (currentStepData.id) {
      case 'welcome':
      case 'avatar':
      case 'mode':
        return true;
      case 'samples':
        return onboardingData.textSamples.length >= 3;
      case 'analysis':
        return !isAnalyzing;
      default:
        return false;
    }
  };

  const getButtonText = () => {
    const currentStepData = onboardingData.steps[onboardingData.currentStep];
    
    if (currentStepData.id === 'analysis') {
      return 'Complete Setup';
    }
    
    return 'Continue';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          Step {onboardingData.currentStep + 1} of {onboardingData.steps.length}
        </Text>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderCurrentStep()}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigation}>
        {onboardingData.currentStep > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={goToPreviousStep}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[
            styles.nextButton,
            !canProceed() && styles.nextButtonDisabled,
            onboardingData.currentStep === 0 && styles.nextButtonFull,
          ]}
          onPress={
            onboardingData.currentStep === onboardingData.steps.length - 1
              ? completeOnboarding
              : goToNextStep
          }
          disabled={!canProceed()}
        >
          <Text style={styles.nextButtonText}>{getButtonText()}</Text>
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
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e9ecef',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007bff',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContent: {
    paddingTop: 40,
    alignItems: 'center',
  },
  stepIcon: {
    fontSize: 48,
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 12,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    color: '#495057',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 12,
  },
  stepSubtext: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
    width: '100%',
  },
  avatarOption: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    padding: 8,
  },
  avatarSelected: {
    borderColor: '#007bff',
    backgroundColor: '#e3f2fd',
  },
  avatarEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  avatarName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#495057',
    textAlign: 'center',
  },
  modeOptions: {
    width: '100%',
    marginTop: 20,
  },
  modeOption: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  modeSelected: {
    backgroundColor: '#f0f8ff',
  },
  modeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
    textAlign: 'center',
  },
  modeDescription: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
  },
  sampleInput: {
    width: '100%',
    marginTop: 20,
    marginBottom: 20,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ced4da',
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    marginBottom: 12,
  },
  addSampleButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: 'flex-end',
  },
  addSampleButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  addSampleButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  samplesContainer: {
    width: '100%',
    maxHeight: 200,
  },
  sampleItem: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  sampleText: {
    flex: 1,
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
  },
  removeSampleButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#dc3545',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  removeSampleText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  samplesCount: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 12,
  },
  analysisContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  analysisSpinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007bff',
    marginBottom: 16,
  },
  analysisText: {
    fontSize: 16,
    color: '#495057',
  },
  navigation: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  backButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#6c757d',
    marginRight: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    flex: 2,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#007bff',
    alignItems: 'center',
  },
  nextButtonFull: {
    flex: 1,
    marginLeft: 0,
  },
  nextButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OnboardingScreen; 