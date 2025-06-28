import { 
  ConversationData, 
  AIRequest, 
  AIResponse, 
  ResponseSuggestion, 
  CommunicationInsight,
  CommunicationMode,
  UserStyleData,
  Message,
} from '../types';

export class AIService {
  private static initialized = false;
  
  /**
   * Mock initialization - no actual API key needed for demo
   */
  static initialize(apiKey: string) {
    console.log('Mock AI Service initialized');
    this.initialized = true;
  }

  /**
   * Mock analyze conversation and provide constructive insights
   */
  static async analyzeConversation(
    conversationData: ConversationData,
    analysisType: 'full' | 'quick' | 'suggestions' = 'full'
  ): Promise<AIResponse> {
    if (!this.initialized) {
      throw new Error('AI Service not initialized. Call initialize() with your API key first.');
    }

    // Mock delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return this.getMockAnalysisResponse(conversationData, analysisType);
  }

  /**
   * Mock generate response suggestions for specific message
   */
  static async generateResponseSuggestions(
    conversationContext: string,
    targetMessage: string
  ): Promise<ResponseSuggestion[]> {
    if (!this.initialized) {
      throw new Error('AI Service not initialized');
    }

    // Mock delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    return this.getMockResponseSuggestions(targetMessage);
  }

  /**
   * Get mock analysis response based on conversation data
   */
  private static getMockAnalysisResponse(
    conversationData: ConversationData, 
    analysisType: string
  ): AIResponse {
    const mockResponses = {
      full: {
        analysis: "This conversation shows signs of emotional tension and miscommunication. Both parties seem to care about each other but are struggling to express their feelings effectively. There's an opportunity to rebuild understanding through empathetic listening and clear communication.",
        suggestions: [
          {
            id: "sug_1",
            type: "empathy" as const,
            content: "I can see that you're feeling hurt, and I want to understand your perspective better. Can you help me understand what I did that made you feel this way?",
            rationale: "This acknowledges the other person's emotions and shows willingness to understand their viewpoint",
            tone: "supportive" as const,
          },
          {
            id: "sug_2", 
            type: "clarification" as const,
            content: "I think we might be misunderstanding each other. Let me share what I heard, and you can tell me if I got it right.",
            rationale: "This helps prevent further miscommunication by ensuring both parties are on the same page",
            tone: "neutral" as const,
          },
          {
            id: "sug_3",
            type: "solution" as const,
            content: "I care about our relationship and want to work through this together. What can we do to move forward in a way that works for both of us?",
            rationale: "This focuses on collaborative problem-solving and reinforces the relationship's importance",
            tone: "supportive" as const,
          }
        ],
        insights: [
          {
            id: "insight_1",
            category: "emotion" as const,
            title: "Emotional Overwhelm",
            description: "One or both parties appear to be experiencing strong emotions that may be affecting clear communication",
            importance: "high" as const,
          },
          {
            id: "insight_2",
            category: "pattern" as const,
            title: "Communication Pattern",
            description: "There's a pattern of defensive responses that could be escalating the conflict",
            importance: "medium" as const,
          },
          {
            id: "insight_3",
            category: "opportunity" as const,
            title: "Resolution Opportunity",
            description: "Both parties show signs of caring, which creates a foundation for resolution",
            importance: "high" as const,
          }
        ],
        confidence: 0.85,
      },
      quick: {
        analysis: "Quick analysis: This conversation shows tension but also underlying care between participants. Focus on empathetic listening and clear communication.",
        suggestions: [
          {
            id: "quick_sug_1",
            type: "empathy" as const,
            content: "I hear that you're upset, and I want to understand why.",
            rationale: "Shows willingness to listen and understand",
            tone: "supportive" as const,
          }
        ],
        insights: [
          {
            id: "quick_insight_1",
            category: "emotion" as const,
            title: "Emotional Tension",
            description: "Strong emotions are present and need to be addressed",
            importance: "high" as const,
          }
        ],
        confidence: 0.75,
      },
      suggestions: {
        analysis: "Focus on constructive responses that acknowledge feelings and promote understanding.",
        suggestions: [
          {
            id: "focus_sug_1",
            type: "acknowledgment" as const,
            content: "I can see this is really important to you.",
            rationale: "Validates the other person's feelings and concerns",
            tone: "supportive" as const,
          },
          {
            id: "focus_sug_2",
            type: "clarification" as const,
            content: "Help me understand what you need from me right now.",
            rationale: "Invites clear communication about needs and expectations",
            tone: "neutral" as const,
          }
        ],
        insights: [],
        confidence: 0.80,
      }
    };

    return mockResponses[analysisType as keyof typeof mockResponses] || mockResponses.full;
  }

  /**
   * Get mock response suggestions based on target message
   */
  private static getMockResponseSuggestions(targetMessage: string): ResponseSuggestion[] {
    const suggestions = [
      {
        id: "resp_1",
        type: "empathy" as const,
        content: "I can see that you're feeling frustrated, and I want to understand your perspective better.",
        rationale: "This response acknowledges emotions and shows willingness to understand",
        tone: "supportive" as const,
      },
      {
        id: "resp_2",
        type: "clarification" as const,
        content: "I think I might have misunderstood something. Can you help me understand what you meant?",
        rationale: "This prevents escalation by seeking clarity rather than making assumptions",
        tone: "neutral" as const,
      },
      {
        id: "resp_3",
        type: "solution" as const,
        content: "Let's take a step back and figure out how we can work through this together.",
        rationale: "This focuses on collaborative problem-solving rather than blame",
        tone: "supportive" as const,
      },
      {
        id: "resp_4",
        type: "acknowledgment" as const,
        content: "You're right, and I appreciate you bringing this to my attention.",
        rationale: "This validates their concern and shows openness to feedback",
        tone: "neutral" as const,
      }
    ];

    // Return a subset based on the message content
    const isApology = targetMessage.toLowerCase().includes('sorry');
    const isQuestion = targetMessage.includes('?');
    const isEmotional = /angry|upset|hurt|sad|frustrated/.test(targetMessage.toLowerCase());

    if (isApology) {
      return suggestions.filter(s => s.type === 'acknowledgment' || s.type === 'empathy');
    } else if (isQuestion) {
      return suggestions.filter(s => s.type === 'clarification' || s.type === 'solution');
    } else if (isEmotional) {
      return suggestions.filter(s => s.type === 'empathy' || s.type === 'acknowledgment');
    }

    return suggestions.slice(0, 3);
  }

  /**
   * Get system prompt for AI interactions (mock)
   */
  private static getSystemPrompt(): string {
    return `You are a communication expert and relationship counselor. Your role is to analyze conversations and provide constructive advice that helps people communicate more effectively and build better relationships.

Your responses should always be:
- Empathetic and understanding
- Focused on improving communication
- Respectful of all parties involved
- Aimed at conflict resolution and mutual understanding
- Supportive of healthy relationship dynamics

Never suggest manipulative tactics, aggressive responses, or strategies that could harm relationships. Always prioritize mutual respect, emotional safety, and constructive dialogue.`;
  }

  /**
   * Get fallback response when parsing fails
   */
  private static getFallbackResponse(): AIResponse {
    return {
      analysis: "I've analyzed your conversation and can see there's room for improved communication. Focus on expressing your feelings clearly while also trying to understand the other person's perspective.",
      suggestions: [
        {
          id: "fallback_1",
          type: "empathy",
          content: "I understand this is important to you.",
          rationale: "Acknowledges the other person's feelings",
          tone: "supportive",
        }
      ],
      insights: [
        {
          id: "fallback_insight",
          category: "opportunity",
          title: "Communication Opportunity",
          description: "There's an opportunity to improve understanding between both parties",
          importance: "medium",
        }
      ],
      confidence: 0.6,
    };
  }

  /**
   * Get fallback suggestions when generation fails
   */
  private static getFallbackSuggestions(): ResponseSuggestion[] {
    return [
      {
        id: "fallback_suggestion",
        type: "empathy",
        content: "I can see this is important to you, and I'd like to understand better.",
        rationale: "Shows empathy and willingness to understand",
        tone: "supportive",
      }
    ];
  }

  /**
   * Mock generate response based on request
   */
  static async generateResponse(request: AIRequest): Promise<AIResponse> {
    // Mock delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      analysis: "Based on your communication style and the context, here's a constructive approach to this situation.",
      suggestions: this.getMockResponseSuggestions(request.conversationContext),
      insights: [
        {
          id: "context_insight",
          category: "pattern",
          title: "Communication Style",
          description: "Your communication style shows good awareness of emotional dynamics",
          importance: "medium",
        }
      ],
      confidence: 0.78,
    };
  }

  /**
   * Mock analyze user communication style
   */
  static async analyzeUserStyle(textSamples: string[]): Promise<UserStyleData> {
    // Mock delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      primaryTone: "supportive",
      emotionalIntelligence: 0.75,
      directness: 0.6,
      empathy: 0.8,
      assertiveness: 0.5,
      adaptability: 0.7,
      preferredApproach: "collaborative",
      communicationStrengths: [
        "Shows empathy and understanding",
        "Uses clear and direct language",
        "Seeks to understand others' perspectives"
      ],
      areasForImprovement: [
        "Could be more assertive when needed",
        "Sometimes overthinks responses"
      ],
    };
  }

  /**
   * Mock generate conversation summary
   */
  static async generateConversationSummary(messages: Message[]): Promise<string> {
    // Mock delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const messageCount = messages.length;
    const participants = [...new Set(messages.map(m => m.sender))];
    
    return `This conversation involved ${participants.length} participant(s) with ${messageCount} messages. The discussion covered important topics with opportunities for improved understanding and communication.`;
  }
} 