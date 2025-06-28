import { ImageProcessingResult } from '../types';

// Mock TextRecognition result interface
interface MockTextRecognitionResult {
  text: string;
  blocks: Array<{ confidence: number }>;
}

export class OCRService {
  /**
   * Mock implementation - Extract text from image using ML Kit text recognition
   */
  static async extractTextFromImage(imageUri: string): Promise<ImageProcessingResult> {
    try {
      // Mock delay to simulate processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = this.getMockTextRecognitionResult();
      
      return {
        extractedText: result.text,
        confidence: this.calculateOverallConfidence(result.blocks),
        originalImage: imageUri,
      };
    } catch (error) {
      console.error('OCR extraction failed:', error);
      throw new Error('Failed to extract text from image');
    }
  }

  /**
   * Mock implementation - Enhanced text extraction specifically for conversation screenshots
   */
  static async extractConversationFromImage(imageUri: string): Promise<ImageProcessingResult> {
    try {
      // Mock delay to simulate processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const result = this.getMockConversationResult();
      
      // Enhanced processing for conversation screenshots
      const processedText = this.processConversationText(result.text);
      const confidence = this.calculateOverallConfidence(result.blocks);
      
      return {
        extractedText: processedText,
        confidence,
        originalImage: imageUri,
      };
    } catch (error) {
      console.error('Conversation OCR extraction failed:', error);
      throw new Error('Failed to extract conversation from image');
    }
  }

  /**
   * Mock text recognition result for demo
   */
  private static getMockTextRecognitionResult(): MockTextRecognitionResult {
    return {
      text: `Demo extracted text from image.
This is a sample conversation:
John: Hey, how are you doing?
Sarah: I'm good, thanks! How about you?
John: Pretty busy with work lately.
Sarah: I understand. Take care of yourself!`,
      blocks: [
        { confidence: 0.95 },
        { confidence: 0.92 },
        { confidence: 0.88 },
        { confidence: 0.94 },
      ]
    };
  }

  /**
   * Mock conversation result for demo
   */
  private static getMockConversationResult(): MockTextRecognitionResult {
    const conversations = [
      `Alex: I can't believe you said that in front of everyone!
Sam: I didn't mean to embarrass you, I was just being honest.
Alex: Honest? That felt more like an attack.
Sam: I'm sorry if it came across that way.
Alex: It really hurt my feelings.
Sam: I understand, and I apologize. Can we talk about this?`,
      
      `Jordan: You never listen to what I'm saying.
Taylor: That's not true, I do listen.
Jordan: Then why do you always interrupt me?
Taylor: I don't always interrupt... okay, maybe sometimes.
Jordan: It makes me feel like my thoughts don't matter.
Taylor: Your thoughts do matter to me. I'll try to be more patient.`,
      
      `Casey: I feel like we're growing apart.
Morgan: What makes you say that?
Casey: We barely talk anymore, and when we do, it's just small talk.
Morgan: I've been stressed with work, but you're right.
Casey: I miss how we used to share everything.
Morgan: I miss that too. Let's make more time for each other.`,
    ];
    
    const randomConversation = conversations[Math.floor(Math.random() * conversations.length)];
    
    return {
      text: randomConversation,
      blocks: [
        { confidence: 0.91 },
        { confidence: 0.89 },
        { confidence: 0.93 },
        { confidence: 0.87 },
        { confidence: 0.95 },
      ]
    };
  }

  /**
   * Process raw OCR text to better format conversation content
   */
  private static processConversationText(rawText: string): string {
    if (!rawText || rawText.trim().length === 0) {
      return '';
    }

    // Clean up common OCR artifacts
    let processedText = rawText
      // Remove multiple spaces
      .replace(/\s+/g, ' ')
      // Remove common OCR artifacts
      .replace(/[|]/g, ' ')
      // Fix common character misrecognitions
      .replace(/0/g, 'O') // Context-dependent, might need refinement
      .replace(/1/g, 'I') // Context-dependent, might need refinement
      .trim();

    // Split into lines and clean each line
    const lines = processedText.split('\n');
    const cleanedLines = lines
      .map(line => line.trim())
      .filter(line => line.length > 0)
      // Remove very short lines that are likely artifacts
      .filter(line => line.length > 2);

    // Try to identify conversation structure
    const conversationLines = this.identifyConversationStructure(cleanedLines);
    
    return conversationLines.join('\n');
  }

  /**
   * Identify conversation structure from cleaned lines
   */
  private static identifyConversationStructure(lines: string[]): string[] {
    const structuredLines: string[] = [];
    let currentSpeaker = '';
    let currentMessage = '';

    for (const line of lines) {
      // Check if line contains timestamp patterns
      const timePattern = /\d{1,2}:\d{2}|\d{1,2}\/\d{1,2}|\d{4}-\d{2}-\d{2}/;
      if (timePattern.test(line)) {
        // This might be a timestamp line, skip or process differently
        continue;
      }

      // Check if line starts with a name pattern (common in messaging apps)
      const namePattern = /^([A-Za-z\s]+)[:]/;
      const nameMatch = line.match(namePattern);
      
      if (nameMatch) {
        // Save previous message if exists
        if (currentMessage.trim()) {
          structuredLines.push(currentMessage.trim());
        }
        
        currentSpeaker = nameMatch[1].trim();
        currentMessage = line;
      } else {
        // Continue current message or start new one
        if (currentMessage) {
          currentMessage += ' ' + line;
        } else {
          currentMessage = line;
        }
      }
    }

    // Add the last message
    if (currentMessage.trim()) {
      structuredLines.push(currentMessage.trim());
    }

    return structuredLines.length > 0 ? structuredLines : lines;
  }

  /**
   * Validate extracted text for conversation analysis
   */
  static validateConversationText(extractedText: string): { isValid: boolean; message?: string } {
    if (!extractedText || extractedText.trim().length === 0) {
      return {
        isValid: false,
        message: 'No text could be extracted from the image. Please ensure the image contains readable text.',
      };
    }

    // Check minimum length for meaningful conversation
    if (extractedText.trim().length < 10) {
      return {
        isValid: false,
        message: 'The extracted text is too short. Please provide an image with more conversation content.',
      };
    }

    // Check for common conversation indicators
    const conversationIndicators = [
      /[:]/,  // Colon (speaker indicators)
      /[?]/,  // Questions
      /\b(you|your|me|my|I|we)\b/i,  // Personal pronouns
      /\b(said|says|told|asked)\b/i,  // Communication verbs
    ];

    const hasConversationIndicators = conversationIndicators.some(pattern => 
      pattern.test(extractedText)
    );

    if (!hasConversationIndicators) {
      return {
        isValid: false,
        message: 'The extracted text doesn\'t appear to be a conversation. Please provide a screenshot of a conversation or chat.',
      };
    }

    return { isValid: true };
  }

  /**
   * Extract key phrases from conversation for quick analysis
   */
  static extractKeyPhrases(text: string): string[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);

    // Simple frequency analysis
    const wordFreq: { [key: string]: number } = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    // Return top 10 most frequent words
    return Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  /**
   * Calculate overall confidence from ML Kit blocks
   */
  private static calculateOverallConfidence(blocks: any[]): number {
    if (!blocks || blocks.length === 0) return 0;

    const totalConfidence = blocks.reduce((sum, block) => {
      return sum + (block.confidence || 0.8); // Default confidence if not provided
    }, 0);

    return Math.min(totalConfidence / blocks.length, 1.0);
  }

  /**
   * Get extraction statistics
   */
  static getExtractionStats(extractedText: string): {
    characterCount: number;
    wordCount: number;
    lineCount: number;
    estimatedReadingTime: number;
  } {
    const characterCount = extractedText.length;
    const wordCount = extractedText.split(/\s+/).filter(word => word.length > 0).length;
    const lineCount = extractedText.split('\n').length;
    const estimatedReadingTime = Math.ceil(wordCount / 200); // Assuming 200 words per minute

    return {
      characterCount,
      wordCount,
      lineCount,
      estimatedReadingTime,
    };
  }

  /**
   * Generate unique ID for extraction results
   */
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
} 