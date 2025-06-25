import OpenAI from 'openai';
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

  /**
   * Generate AI response based on communication mode and user style
   */
  static async generateResponse(request: AIRequest): Promise<AIResponse> {
    if (!this.openai) {
      throw new Error('AI Service not initialized. Call initialize() with your API key first.');
    }

    const systemPrompt = this.getSystemPrompt(request.mode);
    const userPrompt = this.buildUserPrompt(request);
    
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: request.mode === 'hard_fight' ? 0.8 : 0.7,
        max_tokens: 1500,
      });

      const responseContent = completion.choices[0]?.message?.content || '';
      return this.parseAIResponse(responseContent, request.mode);
    } catch (error) {
      console.error('AI response generation failed:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  /**
   * Analyze user's writing style from text samples
   */
  static async analyzeUserStyle(textSamples: string[]): Promise<UserStyleData> {
    if (!this.openai) {
      throw new Error('AI Service not initialized');
    }

    const prompt = `Analyze the following text samples and identify the user's communication style:

${textSamples.map((sample, index) => `Sample ${index + 1}: "${sample}"`).join('\n\n')}

Please analyze and return JSON with this structure:
{
  "tone": "professional|casual|formal|friendly|direct|etc",
  "vocabulary": ["commonly used words or phrases"],
  "sentenceStructure": "short and direct|elaborate and detailed|conversational|etc",
  "communicationPreferences": ["preference patterns like asking questions, using humor, etc"]
}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { 
            role: 'system', 
            content: 'You are a communication style analyst. Analyze text samples to identify writing patterns, tone, and communication preferences.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 800,
      });

      const responseContent = completion.choices[0]?.message?.content || '';
      const analyzed = JSON.parse(responseContent);
      
      return {
        textSamples,
        analyzedPatterns: analyzed,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('Style analysis failed:', error);
      return {
        textSamples,
        analyzedPatterns: {
          tone: 'casual',
          vocabulary: [],
          sentenceStructure: 'conversational',
          communicationPreferences: [],
        },
        lastUpdated: new Date(),
      };
    }
  }

  /**
   * Get system prompt based on communication mode
   */
  private static getSystemPrompt(mode: CommunicationMode): string {
    if (mode === 'hard_fight') {
      return `You are a strategic communication expert focused on helping users gain advantage in conversations and arguments. Your role is to analyze conversations and provide tactical advice for:

1. Logical superiority - Finding flaws in opponent's reasoning
2. Strategic positioning - Maintaining conversational dominance  
3. Psychological advantage - Understanding power dynamics
4. Tactical responses - Crafting responses that put the user in control

Provide specific, actionable strategies that help the user maintain the upper hand while appearing reasonable. Focus on winning through superior communication tactics.

Your responses should be:
- Strategically focused on gaining advantage
- Psychologically informed about power dynamics
- Tactically sound for conversational dominance
- Designed to help the user "win" the interaction

Always maintain plausible deniability and help the user appear reasonable while gaining strategic advantage.`;
    } else {
      return `You are a communication expert and relationship counselor. Your role is to analyze conversations and provide constructive advice that helps people communicate more effectively and build better relationships.

Your responses should always be:
- Empathetic and understanding
- Focused on improving communication
- Respectful of all parties involved
- Aimed at conflict resolution and mutual understanding
- Supportive of healthy relationship dynamics

Never suggest manipulative tactics, aggressive responses, or strategies that could harm relationships. Always prioritize mutual respect, emotional safety, and constructive dialogue.`;
    }
  }

  /**
   * Build user prompt with context and style adaptation
   */
  private static buildUserPrompt(request: AIRequest): string {
    let prompt = `Input Message/Text: "${request.inputText}"`;

    if (request.conversationContext) {
      prompt += `\n\nConversation Context:\n${request.conversationContext}`;
    }

    if (request.previousMessages && request.previousMessages.length > 0) {
      prompt += `\n\nPrevious Messages:\n`;
      request.previousMessages.slice(-5).forEach((msg, index) => {
        prompt += `${msg.type === 'user' ? 'User' : 'Other'}: "${msg.content}"\n`;
      });
    }

    if (request.userStyleData) {
      prompt += `\n\nUser's Communication Style:
- Tone: ${request.userStyleData.analyzedPatterns.tone}
- Typical vocabulary: ${request.userStyleData.analyzedPatterns.vocabulary.join(', ')}
- Sentence structure: ${request.userStyleData.analyzedPatterns.sentenceStructure}
- Communication preferences: ${request.userStyleData.analyzedPatterns.communicationPreferences.join(', ')}

Please adapt your suggestions to match this user's natural communication style.`;
    }

    if (request.mode === 'hard_fight') {
      prompt += `\n\nPlease provide strategic response options that will help me gain advantage in this conversation. Include tactical analysis and power positioning strategies.`;
    } else {
      prompt += `\n\nPlease provide constructive response options that will improve communication and understanding in this situation.`;
    }

    prompt += `\n\nReturn your response in JSON format:
{
  "response": "main analysis or suggested response",
  "suggestions": ["alternative response 1", "alternative response 2", "alternative response 3"],
  "confidence": 0.8
}`;

    return prompt;
  }

  /**
   * Generate conversation summary for context management
   */
  static async generateConversationSummary(messages: Message[]): Promise<string> {
    if (!this.openai || messages.length === 0) {
      return '';
    }

    const conversationText = messages
      .map(msg => `${msg.type}: ${msg.content}`)
      .join('\n');

    const prompt = `Summarize this conversation in 2-3 sentences, focusing on the main topics and communication dynamics:

${conversationText}

Provide a concise summary that captures the key points and emotional tone.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a conversation analyst. Provide concise, accurate summaries.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 200,
      });

      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Summary generation failed:', error);
      return `Conversation with ${messages.length} messages about various topics.`;
    }
  }
} 