import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ImagePickerService } from '../services/ImagePickerService';
import { OCRService } from '../services/OCRService';
import StorageService from '../services/StorageService';
import { CommunicationMode, UserProfile, DEFAULT_AVATARS } from '../types';

const { width, height } = Dimensions.get('window');

const MainScreen: React.FC = () => {
  const navigation = useNavigation();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentMode, setCurrentMode] = useState<CommunicationMode>('healthy_communication');
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    loadUserProfile();
    startPulseAnimation();
  }, []);

  const loadUserProfile = async () => {
    try {
      let profile = await StorageService.getUserProfile();
      if (!profile) {
        profile = await StorageService.createDefaultUserProfile();
      }
      setUserProfile(profile);
      setCurrentMode(profile.preferredMode);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const toggleCommunicationMode = async () => {
    const newMode: CommunicationMode = currentMode === 'hard_fight' ? 'healthy_communication' : 'hard_fight';
    setCurrentMode(newMode);
    
    if (userProfile) {
      const updatedProfile = { ...userProfile, preferredMode: newMode, updatedAt: new Date() };
      await StorageService.saveUserProfile(updatedProfile);
      setUserProfile(updatedProfile);
    }
  };

  const handleImageUpload = async () => {
    try {
      const imageResult = await ImagePickerService.pickImage();
      if (!imageResult) return;

      // Validate image for OCR
      const validation = ImagePickerService.validateImageForOCR(imageResult);
      if (!validation.isValid) {
        Alert.alert('Invalid Image', validation.message);
        return;
      }

      // Navigate to processing screen with image data
      (navigation as any).navigate('ProcessingScreen', {
        imageUri: imageResult.uri,
        mode: currentMode,
      });
    } catch (error) {
      console.error('Image upload error:', error);
      Alert.alert('Error', 'Failed to process image. Please try again.');
    }
  };

  const handleTextInput = () => {
    (navigation as any).navigate('TextInputScreen', {
      mode: currentMode,
    });
  };

  const getModeDisplayInfo = () => {
    if (currentMode === 'hard_fight') {
      return {
        title: '🥊 Hard Fight Mode',
        subtitle: 'Get strategic advantage in conversations',
        color: '#ff4444',
        backgroundColor: '#ffe6e6',
      };
    } else {
      return {
        title: '💚 Healthy Communication',
        subtitle: 'Build better relationships through understanding',
        color: '#28a745',
        backgroundColor: '#e6ffe6',
      };
    }
  };

  const modeInfo = getModeDisplayInfo();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header with User Profile and Mode Toggle */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarEmoji}>
              {userProfile?.avatar.emoji || '🐱'}
            </Text>
          </View>
          <Text style={styles.userName}>
            {userProfile?.name || `${userProfile?.avatar.name || 'User'}`}
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.modeToggle, { backgroundColor: modeInfo.backgroundColor }]}
          onPress={toggleCommunicationMode}
        >
          <Text style={[styles.modeText, { color: modeInfo.color }]}>
            {modeInfo.title}
          </Text>
          <Text style={styles.modeSubtext}>
            Tap to switch
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <Text style={styles.welcomeTitle}>Communication Assistant</Text>
        <Text style={[styles.modeDescription, { color: modeInfo.color }]}>
          {modeInfo.subtitle}
        </Text>

        {/* Fullscreen Upload Button */}
        <Animated.View style={[styles.uploadButtonContainer, { transform: [{ scale: pulseAnim }] }]}>
          <TouchableOpacity 
            style={[styles.uploadButton, { borderColor: modeInfo.color }]}
            onPress={handleImageUpload}
            activeOpacity={0.8}
          >
            <View style={styles.uploadIconContainer}>
              <Text style={styles.uploadIcon}>📷</Text>
              <Text style={[styles.uploadTitle, { color: modeInfo.color }]}>
                Upload Screenshot
              </Text>
              <Text style={styles.uploadSubtitle}>
                Tap to select conversation screenshot
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Alternative Text Input */}
        <TouchableOpacity 
          style={styles.textInputOption}
          onPress={handleTextInput}
        >
          <Text style={styles.textInputIcon}>✏️</Text>
          <Text style={styles.textInputText}>Or type your message directly</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Info */}
      <View style={styles.bottomInfo}>
        <Text style={styles.infoText}>
          {currentMode === 'hard_fight' 
            ? 'Get strategic responses to win conversations'
            : 'Improve communication and build better relationships'
          }
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarEmoji: {
    fontSize: 20,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  modeToggle: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  modeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modeSubtext: {
    fontSize: 10,
    color: '#6c757d',
    marginTop: 2,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212529',
    textAlign: 'center',
    marginBottom: 8,
  },
  modeDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 50,
    paddingHorizontal: 20,
  },
  uploadButtonContainer: {
    width: width * 0.8,
    height: height * 0.35,
    marginBottom: 40,
  },
  uploadButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 3,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  uploadIconContainer: {
    alignItems: 'center',
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  textInputOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  textInputIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  textInputText: {
    fontSize: 16,
    color: '#495057',
    fontWeight: '500',
  },
  bottomInfo: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default MainScreen; 