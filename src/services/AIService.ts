import OpenAI from 'openai';
import { 
  ConversationData, 
  AIRequest, 
  AIResponse, 
  ResponseSuggestion, 
  CommunicationInsight 
} from '../types';

export class AIService {
  private static openai: OpenAI;
  
  /**
   * Initialize OpenAI client with API key
   */
  static initialize(apiKey: string) {
    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  /**
   * Analyze conversation and provide constructive insights
   */
  static async analyzeConversation(
    conversationData: ConversationData,
    analysisType: 'full' | 'quick' | 'suggestions' = 'full'
  ): Promise<AIResponse> {
    if (!this.openai) {
      throw new Error('AI Service not initialized. Call initialize() with your API key first.');
    }

    const prompt = this.buildAnalysisPrompt(conversationData, analysisType);
    
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: this.getSystemPrompt() },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      const responseContent = completion.choices[0]?.message?.content || '';
      return this.parseAIResponse(responseContent);
    } catch (error) {
      console.error('AI analysis failed:', error);
      throw new Error('Failed to analyze conversation');
    }
  }

  /**
   * Generate response suggestions for specific message
   */
  static async generateResponseSuggestions(
    conversationContext: string,
    targetMessage: string
  ): Promise<ResponseSuggestion[]> {
    if (!this.openai) {
      throw new Error('AI Service not initialized');
    }

    const prompt = `
Conversation Context:
${conversationContext}

Target Message: "${targetMessage}"

Please suggest 3-5 constructive response options that would help improve communication and understanding. Each suggestion should be:
- Respectful and empathetic
- Clear and direct
- Aimed at resolving misunderstandings
- Appropriate for the conversation tone

Format your response as JSON with this structure:
{
  "suggestions": [
    {
      "type": "empathy|clarification|solution|acknowledgment",
      "content": "suggested response text",
      "rationale": "why this response would be helpful",
      "tone": "supportive|neutral|assertive"
    }
  ]
}
    `;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: this.getSystemPrompt() },
          { role: 'user', content: prompt }
        ],
        temperature: 0.6,
        max_tokens: 800,
      });

      const responseContent = completion.choices[0]?.message?.content || '';
      const parsed = JSON.parse(responseContent);
      
      return parsed.suggestions.map((s: any, index: number) => ({
        id: `suggestion_${index}`,
        type: s.type,
        content: s.content,
        rationale: s.rationale,
        tone: s.tone,
      }));
    } catch (error) {
      console.error('Response generation failed:', error);
      return this.getFallbackSuggestions();
    }
  }

  /**
   * Get system prompt for AI interactions
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
   * Build analysis prompt based on conversation data
   */
  private static buildAnalysisPrompt(
    conversationData: ConversationData,
    analysisType: string
  ): string {
    const basePrompt = `
Please analyze this conversation and provide constructive insights:

Conversation Text:
${conversationData.extractedText}

Participants: ${conversationData.participants.join(', ')}
Overall Tone: ${conversationData.conversationTone.overallTone}
Emotional Intensity: ${conversationData.conversationTone.emotionalIntensity}/10

Please provide your analysis in the following JSON format:
{
  "analysis": "overall analysis of the conversation",
  "suggestions": [
    {
      "type": "empathy|clarification|solution|acknowledgment",
      "content": "specific suggestion text",
      "rationale": "explanation of why this would help",
      "tone": "supportive|neutral|assertive"
    }
  ],
  "insights": [
    {
      "category": "pattern|emotion|topic|opportunity",
      "title": "insight title",
      "description": "detailed description",
      "importance": "low|medium|high"
    }
  ],
  "confidence": 0.8
}
    `;

    if (analysisType === 'quick') {
      return basePrompt + '\nProvide a brief analysis focusing on the most important points.';
    } else if (analysisType === 'suggestions') {
      return basePrompt + '\nFocus primarily on actionable response suggestions.';
    }

    return basePrompt + '\nProvide a comprehensive analysis including all aspects.';
  }

  /**
   * Parse AI response into structured format
   */
  private static parseAIResponse(responseContent: string): AIResponse {
    try {
      const parsed = JSON.parse(responseContent);
      return {
        analysis: parsed.analysis || 'Analysis completed',
        suggestions: parsed.suggestions || [],
        insights: parsed.insights || [],
        confidence: parsed.confidence || 0.7,
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return this.getFallbackResponse();
    }
  }

  /**
   * Provide fallback response when AI fails
   */
  private static getFallbackResponse(): AIResponse {
    return {
      analysis: 'Unable to complete full analysis. Please try again.',
      suggestions: this.getFallbackSuggestions(),
      insights: [
        {
          category: 'opportunity',
          title: 'Communication Analysis',
          description: 'Consider reviewing the conversation for opportunities to improve understanding.',
          importance: 'medium',
        }
      ],
      confidence: 0.5,
    };
  }

  /**
   * Provide fallback suggestions when AI fails
   */
  private static getFallbackSuggestions(): ResponseSuggestion[] {
    return [
      {
        id: 'fallback_1',
        type: 'clarification',
        content: 'I want to make sure I understand your perspective correctly...',
        rationale: 'Seeking clarification shows respect and prevents misunderstandings',
        tone: 'supportive',
      },
      {
        id: 'fallback_2',
        type: 'empathy',
        content: 'I can see this is important to you...',
        rationale: 'Acknowledging the other person\'s feelings helps build connection',
        tone: 'supportive',
      },
      {
        id: 'fallback_3',
        type: 'solution',
        content: 'How can we work together to resolve this?',
        rationale: 'Focusing on collaboration encourages problem-solving',
        tone: 'neutral',
      },
    ];
  }
} 