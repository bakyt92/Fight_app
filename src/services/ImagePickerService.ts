import { Platform, Alert } from 'react-native';

export interface ImagePickerResult {
  uri: string;
  fileName: string;
  fileSize: number;
  width: number;
  height: number;
}

export class ImagePickerService {
  /**
   * Mock implementation - Request necessary permissions for camera and photo library
   */
  static async requestPermissions(): Promise<boolean> {
    // Mock implementation - always return true for demo
    console.log('Mock: Requesting permissions...');
    return true;
  }

  /**
   * Mock implementation - Show action sheet to choose between camera and photo library
   */
  static async pickImage(): Promise<ImagePickerResult | null> {
    return new Promise((resolve) => {
      Alert.alert(
        'Demo Mode',
        'This is a demo version. In the full app, you would be able to select images from your camera or photo library.',
        [
          { 
            text: 'Use Demo Image', 
            onPress: () => resolve({
              uri: 'https://via.placeholder.com/400x600/f0f0f0/666666?text=Demo+Conversation+Screenshot',
              fileName: 'demo_conversation.jpg',
              fileSize: 125000, // 125KB
              width: 400,
              height: 600,
            })
          },
          { text: 'Cancel', onPress: () => resolve(null), style: 'cancel' },
        ]
      );
    });
  }

  /**
   * Mock implementation - Open camera to take a new photo
   */
  static async openCamera(): Promise<ImagePickerResult | null> {
    console.log('Mock: Opening camera...');
    return {
      uri: 'https://via.placeholder.com/400x600/e3f2fd/1976d2?text=Camera+Photo',
      fileName: 'camera_image.jpg',
      fileSize: 150000,
      width: 400,
      height: 600,
    };
  }

  /**
   * Mock implementation - Open photo library to select existing photo
   */
  static async openPhotoLibrary(): Promise<ImagePickerResult | null> {
    console.log('Mock: Opening photo library...');
    return {
      uri: 'https://via.placeholder.com/400x600/f3e5f5/7b1fa2?text=Library+Photo',
      fileName: 'selected_image.jpg',
      fileSize: 180000,
      width: 400,
      height: 600,
    };
  }

  /**
   * Validate if the selected image is suitable for text extraction
   */
  static validateImageForOCR(imageResult: ImagePickerResult): { isValid: boolean; message?: string } {
    // Check file size (max 10MB)
    if (imageResult.fileSize > 10 * 1024 * 1024) {
      return {
        isValid: false,
        message: 'Image file is too large. Please select an image smaller than 10MB.',
      };
    }

    // Check dimensions (minimum size for readable text)
    if (imageResult.width < 200 || imageResult.height < 200) {
      return {
        isValid: false,
        message: 'Image is too small. Please select a larger image for better text recognition.',
      };
    }

    // Check aspect ratio (extremely wide/tall images might not work well)
    const aspectRatio = imageResult.width / imageResult.height;
    if (aspectRatio > 5 || aspectRatio < 0.2) {
      return {
        isValid: false,
        message: 'Image aspect ratio is unusual. Please select a more standard screenshot format.',
      };
    }

    return { isValid: true };
  }

  /**
   * Get image metadata for analysis
   */
  static getImageMetadata(imageResult: ImagePickerResult) {
    return {
      fileName: imageResult.fileName,
      fileSize: this.formatFileSize(imageResult.fileSize),
      dimensions: `${imageResult.width} × ${imageResult.height}`,
      aspectRatio: (imageResult.width / imageResult.height).toFixed(2),
    };
  }

  /**
   * Format file size in human readable format
   */
  private static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
} 