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