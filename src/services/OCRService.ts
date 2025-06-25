import TextRecognition from '@react-native-ml-kit/text-recognition';
import { OCRResult, ConversationData, Message, ToneAnalysis } from '../types';

export class OCRService {
  /**
   * Extract text from image using ML Kit text recognition
   */
  static async extractTextFromImage(imageUri: string): Promise<OCRResult> {
    try {
      const result = await TextRecognition.recognize(imageUri);
      
      return {
        text: result.text,
        confidence: this.calculateOverallConfidence(result.blocks),
        blocks: result.blocks.map(block => ({
          text: block.text,
          boundingBox: {
            x: block.frame.x,
            y: block.frame.y,
            width: block.frame.width,
            height: block.frame.height,
          },
          confidence: block.confidence || 0.8,
        })),
      };
    } catch (error) {
      console.error('OCR extraction failed:', error);
      throw new Error('Failed to extract text from image');
    }
  }

  /**
   * Process OCR result and convert to conversation data
   */
  static async processConversationFromOCR(
    imageUri: string, 
    ocrResult: OCRResult
  ): Promise<ConversationData> {
    const messages = this.parseMessagesFromText(ocrResult.text);
    const participants = this.identifyParticipants(messages);
    const toneAnalysis = this.analyzeTone(ocrResult.text);

    return {
      id: this.generateId(),
      timestamp: new Date(),
      messages,
      participants,
      conversationTone: toneAnalysis,
      extractedText: ocrResult.text,
      imageUri,
    };
  }

  /**
   * Parse individual messages from extracted text
   */
  private static parseMessagesFromText(text: string): Message[] {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const messages: Message[] = [];
    
    // Basic parsing - can be enhanced with more sophisticated patterns
    lines.forEach((line, index) => {
      // Look for common messaging patterns: "Name: message" or timestamps
      const messagePatterns = [
        /^([A-Za-z\s]+):\s*(.+)$/,  // "Name: message"
        /^(.+?)\s+(\d{1,2}:\d{2})\s*(.+)$/,  // "message time content"
      ];

      let sender = 'Unknown';
      let content = line.trim();

      for (const pattern of messagePatterns) {
        const match = line.match(pattern);
        if (match) {
          sender = match[1].trim();
          content = match[2].trim();
          break;
        }
      }

      if (content.length > 0) {
        messages.push({
          id: `msg_${index}`,
          sender,
          content,
          timestamp: new Date(),
          sentiment: this.analyzeSentiment(content),
        });
      }
    });

    return messages;
  }

  /**
   * Identify unique participants in the conversation
   */
  private static identifyParticipants(messages: Message[]): string[] {
    const participants = new Set<string>();
    messages.forEach(msg => {
      if (msg.sender !== 'Unknown') {
        participants.add(msg.sender);
      }
    });
    return Array.from(participants);
  }

  /**
   * Basic tone analysis of conversation text
   */
  private static analyzeTone(text: string): ToneAnalysis {
    const lowerText = text.toLowerCase();
    
    // Simple pattern-based tone analysis
    const positiveWords = ['love', 'happy', 'great', 'good', 'wonderful', 'amazing'];
    const negativeWords = ['hate', 'angry', 'bad', 'terrible', 'awful', 'stupid'];
    const tensionWords = ['but', 'however', 'wrong', 'never', 'always'];

    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    const tensionCount = tensionWords.filter(word => lowerText.includes(word)).length;

    let overallTone: 'friendly' | 'neutral' | 'tense' | 'heated' = 'neutral';
    let emotionalIntensity = 5;

    if (negativeCount > positiveCount + 2) {
      overallTone = 'heated';
      emotionalIntensity = 8;
    } else if (tensionCount > 2 || negativeCount > positiveCount) {
      overallTone = 'tense';
      emotionalIntensity = 6;
    } else if (positiveCount > negativeCount + 1) {
      overallTone = 'friendly';
      emotionalIntensity = 3;
    }

    return {
      overallTone,
      emotionalIntensity,
      keyTopics: this.extractKeyTopics(text),
      communicationPatterns: this.identifyPatterns(text),
    };
  }

  /**
   * Basic sentiment analysis for individual messages
   */
  private static analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const lowerText = text.toLowerCase();
    const positiveWords = ['love', 'happy', 'great', 'good', 'wonderful', 'thanks'];
    const negativeWords = ['hate', 'angry', 'bad', 'terrible', 'no', 'never'];

    const positiveScore = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeScore = negativeWords.filter(word => lowerText.includes(word)).length;

    if (positiveScore > negativeScore) return 'positive';
    if (negativeScore > positiveScore) return 'negative';
    return 'neutral';
  }

  /**
   * Extract key topics from conversation
   */
  private static extractKeyTopics(text: string): string[] {
    // Simple keyword extraction - can be enhanced with NLP
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    const wordFreq: { [key: string]: number } = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    return Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
  }

  /**
   * Identify communication patterns
   */
  private static identifyPatterns(text: string): string[] {
    const patterns: string[] = [];
    const lowerText = text.toLowerCase();

    if (lowerText.includes('?')) patterns.push('Questions present');
    if (lowerText.includes('!')) patterns.push('Emotional expressions');
    if (lowerText.includes('sorry') || lowerText.includes('apologize')) {
      patterns.push('Apologies detected');
    }
    if (lowerText.includes('but') || lowerText.includes('however')) {
      patterns.push('Contradictions present');
    }

    return patterns;
  }

  /**
   * Calculate overall confidence from text blocks
   */
  private static calculateOverallConfidence(blocks: any[]): number {
    if (blocks.length === 0) return 0;
    
    const totalConfidence = blocks.reduce((sum, block) => 
      sum + (block.confidence || 0.8), 0
    );
    
    return totalConfidence / blocks.length;
  }

  /**
   * Generate unique ID
   */
  private static generateId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
} 