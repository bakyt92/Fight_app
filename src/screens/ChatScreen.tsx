import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AIService } from '../services/AIService';
import { ImagePickerService } from '../services/ImagePickerService';
import { OCRService } from '../services/OCRService';
import StorageService from '../services/StorageService';
import { 
  Conversation, 
  Message, 
  CommunicationMode, 
  UserProfile,
  AIRequest,
} from '../types';

const { width } = Dimensions.get('window');

const ChatScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { conversationId, initialText, mode } = route.params as any;
  
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    initializeChat();
  }, []);

  const processUploadedImage = async (conversation: Conversation, imageUri: string) => {
    try {
      setIsLoading(true);

      // Extract text from image using OCR
      const ocrResult = await OCRService.extractConversationFromImage(imageUri);
      const textValidation = OCRService.validateConversationText(ocrResult.extractedText);
      
      if (!textValidation.isValid) {
        Alert.alert('Invalid Text', textValidation.message);
        return;
      }

      // Create image message with extracted text
      const imageMessage: Message = {
        id: `msg_${Date.now()}_img`,
        content: `📷 Uploaded conversation:\n\n${ocrResult.extractedText}`,
        type: 'user',
        timestamp: new Date(),
        inputMethod: 'image',
        originalImage: imageUri,
        ocrExtractedText: ocrResult.extractedText,
        mode: conversation.mode,
      };

      conversation.messages = [imageMessage];
      conversation.title = `${conversation.mode === 'hard_fight' ? '🥊' : '💚'} Image Analysis`;

      // Generate AI response with multiple options
      await generateAIResponseWithOptions(conversation, ocrResult.extractedText);
    } catch (error) {
      console.error('Error processing uploaded image:', error);
      Alert.alert('Error', 'Failed to process the uploaded image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const initializeChat = async () => {
    try {
      // Load user profile
      const profile = await StorageService.getUserProfile();
      setUserProfile(profile);

      if (conversationId) {
        // Load existing conversation
        const conversations = await StorageService.getConversations();
        const existingConversation = conversations.find(c => c.id === conversationId);
        if (existingConversation) {
          setConversation(existingConversation);
        }
      } else {
        // Create new conversation
        const newConversation: Conversation = {
          id: `conv_${Date.now()}`,
          title: 'New Conversation',
          messages: [],
          mode: mode || 'healthy_communication',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Check if an image was passed for processing
        const { imageUri } = route.params as any;
        if (imageUri) {
          await processUploadedImage(newConversation, imageUri);
        } else if (initialText) {
          // Add initial text message if provided
          const initialMessage: Message = {
            id: `msg_${Date.now()}`,
            content: initialText,
            type: 'user',
            timestamp: new Date(),
            inputMethod: 'text',
            mode: newConversation.mode,
          };
          newConversation.messages = [initialMessage];
          
          // Get AI response to initial message
          await generateAIResponse(newConversation, initialMessage.content);
        }

        setConversation(newConversation);
        await StorageService.saveConversation(newConversation);
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
      Alert.alert('Error', 'Failed to initialize chat. Please try again.');
    }
  };

  const generateAIResponse = async (conv: Conversation, inputText: string) => {
    if (!userProfile) return;

    setIsTyping(true);
    
    try {
      // Prepare AI request
      const aiRequest: AIRequest = {
        inputText,
        mode: conv.mode,
        conversationContext: await AIService.generateConversationSummary(conv.messages),
        userStyleData: userProfile.styleData,
        previousMessages: conv.messages.slice(-5), // Last 5 messages for context
      };

      const aiResponse = await AIService.generateResponse(aiRequest);
      
      // Create AI message
      const aiMessage: Message = {
        id: `msg_${Date.now()}_ai`,
        content: aiResponse.response,
        type: 'ai',
        timestamp: new Date(),
        inputMethod: 'text',
        mode: conv.mode,
      };

      // Update conversation
      const updatedConversation = {
        ...conv,
        messages: [...conv.messages, aiMessage],
        updatedAt: new Date(),
      };

      setConversation(updatedConversation);
      await StorageService.saveConversation(updatedConversation);
      
      // Show suggestions if available
      if (aiResponse.suggestions && aiResponse.suggestions.length > 0) {
        // You could show suggestions in a separate UI component
        console.log('AI Suggestions:', aiResponse.suggestions);
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      Alert.alert('Error', 'Failed to generate AI response. Please check your internet connection and try again.');
    } finally {
      setIsTyping(false);
    }
  };

  const sendMessage = async () => {
    if (!currentInput.trim() || !conversation) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      content: currentInput.trim(),
      type: 'user',
      timestamp: new Date(),
      inputMethod: 'text',
      mode: conversation.mode,
    };

    // Update conversation with user message
    const updatedConversation = {
      ...conversation,
      messages: [...conversation.messages, userMessage],
      updatedAt: new Date(),
    };

    setConversation(updatedConversation);
    await StorageService.saveConversation(updatedConversation);
    
    const messageText = currentInput.trim();
    setCurrentInput('');

    // Generate AI response
    await generateAIResponse(updatedConversation, messageText);
  };

  const addImageMessage = async () => {
    if (!conversation) return;

    try {
      const imageResult = await ImagePickerService.pickImage();
      if (!imageResult) return;

      // Validate and extract text from image
      const validation = ImagePickerService.validateImageForOCR(imageResult);
      if (!validation.isValid) {
        Alert.alert('Invalid Image', validation.message);
        return;
      }

      setIsLoading(true);

      // Extract text from image
      const ocrResult = await OCRService.extractConversationFromImage(imageResult.uri);
      const textValidation = OCRService.validateConversationText(ocrResult.extractedText);
      
      if (!textValidation.isValid) {
        Alert.alert('Invalid Text', textValidation.message);
        setIsLoading(false);
        return;
      }

      // Create image message
      const imageMessage: Message = {
        id: `msg_${Date.now()}_img`,
        content: ocrResult.extractedText,
        type: 'user',
        timestamp: new Date(),
        inputMethod: 'image',
        originalImage: imageResult.uri,
        ocrExtractedText: ocrResult.extractedText,
        mode: conversation.mode,
      };

      // Update conversation
      const updatedConversation = {
        ...conversation,
        messages: [...conversation.messages, imageMessage],
        updatedAt: new Date(),
      };

      setConversation(updatedConversation);
      await StorageService.saveConversation(updatedConversation);

      // Generate AI response
      await generateAIResponse(updatedConversation, ocrResult.extractedText);
    } catch (error) {
      console.error('Error processing image:', error);
      Alert.alert('Error', 'Failed to process image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getModeColor = () => {
    return conversation?.mode === 'hard_fight' ? '#ff4444' : '#28a745';
  };

  const getModeIcon = () => {
    return conversation?.mode === 'hard_fight' ? '🥊' : '💚';
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isUser = item.type === 'user';
    const isImage = item.inputMethod === 'image';

    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessage : styles.aiMessage]}>
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
          {isImage && (
            <View style={styles.imageIndicator}>
              <Text style={styles.imageIndicatorText}>📷 From Image</Text>
            </View>
          )}
          <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
            {item.content}
          </Text>
          <Text style={styles.messageTime}>
            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => (
    <View style={[styles.messageContainer, styles.aiMessage]}>
      <View style={[styles.messageBubble, styles.aiBubble]}>
        <View style={styles.typingContainer}>
          <Text style={styles.typingText}>AI is typing</Text>
          <ActivityIndicator size="small" color="#6c757d" style={{ marginLeft: 8 }} />
        </View>
      </View>
    </View>
  );

  if (!conversation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading conversation...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{conversation.title}</Text>
          <Text style={[styles.headerMode, { color: getModeColor() }]}>
            {getModeIcon()} {conversation.mode === 'hard_fight' ? 'Strategic Mode' : 'Healthy Mode'}
          </Text>
        </View>

        <View style={styles.headerActions}>
          <Text style={styles.avatarEmoji}>{userProfile?.avatar.emoji || '🐱'}</Text>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={conversation.messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={isTyping ? renderTypingIndicator : null}
        />

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TouchableOpacity 
            style={styles.imageButton}
            onPress={addImageMessage}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#007bff" />
            ) : (
              <Text style={styles.imageButtonText}>📷</Text>
            )}
          </TouchableOpacity>

          <TextInput
            style={styles.textInput}
            placeholder="Type your message..."
            value={currentInput}
            onChangeText={setCurrentInput}
            multiline
            maxLength={1000}
            editable={!isLoading && !isTyping}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              (!currentInput.trim() || isLoading || isTyping) && styles.sendButtonDisabled,
              { backgroundColor: getModeColor() },
            ]}
            onPress={sendMessage}
            disabled={!currentInput.trim() || isLoading || isTyping}
          >
            <Text style={styles.sendButtonText}>→</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6c757d',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#007bff',
  },
  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  headerMode: {
    fontSize: 14,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 24,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  messageContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: width * 0.75,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: '#007bff',
  },
  aiBubble: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  imageIndicator: {
    marginBottom: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  imageIndicatorText: {
    fontSize: 12,
    color: '#6c757d',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#ffffff',
  },
  aiText: {
    color: '#212529',
  },
  messageTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  imageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  imageButtonText: {
    fontSize: 18,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 120,
    backgroundColor: '#ffffff',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  sendButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  sendButtonText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default ChatScreen; 