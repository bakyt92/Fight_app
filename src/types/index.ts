export interface ConversationData {
  id: string;
  timestamp: Date;
  messages: Message[];
  participants: string[];
  conversationTone: ToneAnalysis;
  extractedText: string;
  imageUri?: string;
}

export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface ToneAnalysis {
  overallTone: 'friendly' | 'neutral' | 'tense' | 'heated';
  emotionalIntensity: number; // 1-10 scale
  keyTopics: string[];
  communicationPatterns: string[];
}

export interface AnalysisResult {
  conversationData: ConversationData;
  suggestions: ResponseSuggestion[];
  insights: CommunicationInsight[];
}

export interface ResponseSuggestion {
  id: string;
  type: 'clarification' | 'empathy' | 'solution' | 'acknowledgment';
  content: string;
  rationale: string;
  tone: 'supportive' | 'neutral' | 'assertive';
}

export interface CommunicationInsight {
  category: 'pattern' | 'emotion' | 'topic' | 'opportunity';
  title: string;
  description: string;
  importance: 'low' | 'medium' | 'high';
}

export interface OCRResult {
  text: string;
  confidence: number;
  blocks: TextBlock[];
}

export interface TextBlock {
  text: string;
  boundingBox: BoundingBox;
  confidence: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AIRequest {
  conversationText: string;
  analysisType: 'full' | 'quick' | 'suggestions';
  context?: string;
}

export interface AIResponse {
  analysis: string;
  suggestions: ResponseSuggestion[];
  insights: CommunicationInsight[];
  confidence: number;
}

// Communication Modes
export type CommunicationMode = 'hard_fight' | 'healthy_communication';

// User Profile and Avatar System
export interface AnimalAvatar {
  id: string;
  name: string;
  emoji: string;
  imageUrl?: string;
}

export interface UserProfile {
  id: string;
  name?: string;
  avatar: AnimalAvatar;
  preferredMode: CommunicationMode;
  styleData?: UserStyleData;
  hasCompletedOnboarding: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// User Style Learning
export interface UserStyleData {
  textSamples: string[];
  analyzedPatterns: {
    tone: string;
    vocabulary: string[];
    sentenceStructure: string;
    communicationPreferences: string[];
  };
  lastUpdated: Date;
}

// Chat and Conversation Management
export interface Message {
  id: string;
  content: string;
  type: 'user' | 'ai';
  timestamp: Date;
  inputMethod: 'text' | 'image';
  originalImage?: string; // base64 or file path
  ocrExtractedText?: string;
  mode: CommunicationMode;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  mode: CommunicationMode;
  createdAt: Date;
  updatedAt: Date;
  context?: string; // Summary of conversation for AI context
}

// AI Service Types
export interface AIRequest {
  inputText: string;
  mode: CommunicationMode;
  conversationContext?: string;
  userStyleData?: UserStyleData;
  previousMessages?: Message[];
}

export interface AIResponse {
  response: string;
  suggestions?: string[];
  confidence: number;
  mode: CommunicationMode;
}

// Input and Processing
export interface ImageProcessingResult {
  extractedText: string;
  confidence: number;
  originalImage: string;
}

export interface TextInput {
  content: string;
  timestamp: Date;
}

// Onboarding Flow
export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface OnboardingData {
  currentStep: number;
  steps: OnboardingStep[];
  textSamples: string[];
  selectedMode: CommunicationMode;
  selectedAvatar?: AnimalAvatar;
}

// App State
export interface AppState {
  currentUser: UserProfile | null;
  currentConversation: Conversation | null;
  conversations: Conversation[];
  isOnboarding: boolean;
  onboardingData: OnboardingData | null;
}

// Storage Keys
export const STORAGE_KEYS = {
  USER_PROFILE: 'user_profile',
  CONVERSATIONS: 'conversations',
  CURRENT_CONVERSATION: 'current_conversation',
  ONBOARDING_STATUS: 'onboarding_status',
  APP_STATE: 'app_state',
} as const;

// Default Animal Avatars
export const DEFAULT_AVATARS: AnimalAvatar[] = [
  { id: 'lion', name: 'Lion', emoji: '🦁' },
  { id: 'tiger', name: 'Tiger', emoji: '🐅' },
  { id: 'wolf', name: 'Wolf', emoji: '🐺' },
  { id: 'bear', name: 'Bear', emoji: '🐻' },
  { id: 'eagle', name: 'Eagle', emoji: '🦅' },
  { id: 'shark', name: 'Shark', emoji: '🦈' },
  { id: 'dragon', name: 'Dragon', emoji: '🐉' },
  { id: 'fox', name: 'Fox', emoji: '🦊' },
  { id: 'panda', name: 'Panda', emoji: '🐼' },
  { id: 'koala', name: 'Koala', emoji: '🐨' },
  { id: 'owl', name: 'Owl', emoji: '🦉' },
  { id: 'cat', name: 'Cat', emoji: '🐱' },
]; 