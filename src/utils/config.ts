/**
 * App Configuration and Constants
 */

export const CONFIG = {
  // App Information
  APP_NAME: 'Communication Assistant',
  VERSION: '1.0.0',
  
  // API Configuration
  OPENAI: {
    MODEL: 'gpt-4',
    MAX_TOKENS: 1500,
    TEMPERATURE: 0.7,
    DEFAULT_TIMEOUT: 30000, // 30 seconds
  },
  
  // OCR Configuration
  OCR: {
    QUALITY: 0.8,
    MAX_WIDTH: 2000,
    MAX_HEIGHT: 2000,
    MIN_CONFIDENCE: 0.6,
  },
  
  // Storage Configuration
  STORAGE: {
    MAX_CONVERSATIONS: 50,
    CACHE_EXPIRY_HOURS: 1,
    AUTO_CLEANUP_ENABLED: true,
  },
  
  // Image Processing
  IMAGE: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    MIN_DIMENSIONS: { width: 200, height: 200 },
    SUPPORTED_FORMATS: ['jpg', 'jpeg', 'png'],
  },
  
  // UI Configuration
  UI: {
    ANIMATION_DURATION: 300,
    DEBOUNCE_DELAY: 500,
    MAX_TEXT_PREVIEW_LENGTH: 100,
  },
};

/**
 * Validation utilities
 */
export const VALIDATION = {
  isValidApiKey: (apiKey: string): boolean => {
    return apiKey.length > 0 && apiKey.startsWith('sk-');
  },
  
  isValidImageSize: (fileSize: number): boolean => {
    return fileSize > 0 && fileSize <= CONFIG.IMAGE.MAX_FILE_SIZE;
  },
  
  isValidImageDimensions: (width: number, height: number): boolean => {
    return width >= CONFIG.IMAGE.MIN_DIMENSIONS.width && 
           height >= CONFIG.IMAGE.MIN_DIMENSIONS.height;
  },
  
  isValidText: (text: string): boolean => {
    return text.length >= 10; // Minimum text length for analysis
  },
};

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  API_KEY_REQUIRED: 'OpenAI API key is required for analysis',
  API_KEY_INVALID: 'Invalid OpenAI API key format',
  IMAGE_TOO_LARGE: 'Image file is too large (max 10MB)',
  IMAGE_TOO_SMALL: 'Image dimensions are too small for text recognition',
  INSUFFICIENT_TEXT: 'Not enough text detected in the image',
  NETWORK_ERROR: 'Network connection failed. Please check your internet.',
  ANALYSIS_FAILED: 'Failed to analyze conversation. Please try again.',
  STORAGE_FAILED: 'Failed to save data to local storage',
  PERMISSION_DENIED: 'Camera or photo library permission is required',
};

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  ANALYSIS_COMPLETE: 'Conversation analysis completed successfully',
  CONVERSATION_SAVED: 'Conversation saved to history',
  TEXT_COPIED: 'Text copied to clipboard',
  SETTINGS_SAVED: 'Settings saved successfully',
  CACHE_CLEARED: 'Cache cleared successfully',
};

/**
 * Default prompts and responses
 */
export const DEFAULT_CONTENT = {
  WELCOME_MESSAGE: 'Welcome to Communication Assistant! Upload a conversation screenshot to get started.',
  
  LOADING_MESSAGES: [
    'Extracting text from image...',
    'Analyzing conversation tone...',
    'Generating insights...',
    'Preparing suggestions...',
  ],
  
  EMPTY_STATE_MESSAGES: {
    NO_CONVERSATIONS: 'No saved conversations yet. Analyze your first conversation to get started!',
    NO_SUGGESTIONS: 'No specific suggestions available for this conversation.',
    NO_INSIGHTS: 'No additional insights available for this conversation.',
  },
  
  HELP_TIPS: [
    'For best results, use clear, high-resolution screenshots',
    'Ensure text is readable and not too small',
    'The app works best with messaging app screenshots',
    'Your data is stored locally and never shared without your permission',
  ],
};

/**
 * Utility functions
 */
export const UTILS = {
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
  
  formatDate: (date: Date): string => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  },
  
  truncateText: (text: string, maxLength: number = CONFIG.UI.MAX_TEXT_PREVIEW_LENGTH): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  },
  
  generateId: (): string => {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },
  
  delay: (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
};

/**
 * Theme colors
 */
export const COLORS = {
  PRIMARY: '#007AFF',
  SECONDARY: '#5856D6',
  SUCCESS: '#28a745',
  WARNING: '#ffc107',
  DANGER: '#dc3545',
  INFO: '#17a2b8',
  
  // Text colors
  TEXT_PRIMARY: '#1a1a1a',
  TEXT_SECONDARY: '#666',
  TEXT_MUTED: '#999',
  
  // Background colors
  BACKGROUND: '#f8f9fa',
  SURFACE: '#ffffff',
  BORDER: '#e1e5e9',
  
  // Status colors
  TONE_FRIENDLY: '#28a745',
  TONE_NEUTRAL: '#6c757d',
  TONE_TENSE: '#ffc107',
  TONE_HEATED: '#dc3545',
}; 