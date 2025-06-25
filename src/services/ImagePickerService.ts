import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';
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
   * Request necessary permissions for camera and photo library
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      const cameraPermission = Platform.OS === 'ios' 
        ? PERMISSIONS.IOS.CAMERA 
        : PERMISSIONS.ANDROID.CAMERA;
      
      const libraryPermission = Platform.OS === 'ios'
        ? PERMISSIONS.IOS.PHOTO_LIBRARY
        : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;

      const cameraResult = await request(cameraPermission);
      const libraryResult = await request(libraryPermission);

      return cameraResult === RESULTS.GRANTED && libraryResult === RESULTS.GRANTED;
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  /**
   * Show action sheet to choose between camera and photo library
   */
  static async pickImage(): Promise<ImagePickerResult | null> {
    return new Promise((resolve) => {
      Alert.alert(
        'Select Image',
        'Choose how you want to select your conversation screenshot',
        [
          { text: 'Camera', onPress: () => this.openCamera().then(resolve) },
          { text: 'Photo Library', onPress: () => this.openPhotoLibrary().then(resolve) },
          { text: 'Cancel', onPress: () => resolve(null), style: 'cancel' },
        ]
      );
    });
  }

  /**
   * Open camera to take a new photo
   */
  static async openCamera(): Promise<ImagePickerResult | null> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Camera and photo library permissions are required to use this feature.');
      return null;
    }

    return new Promise((resolve) => {
      launchCamera(
        {
          mediaType: 'photo' as MediaType,
          quality: 0.8,
          maxWidth: 2000,
          maxHeight: 2000,
          includeBase64: false,
        },
        (response: ImagePickerResponse) => {
          if (response.didCancel || response.errorMessage) {
            resolve(null);
            return;
          }

          const asset = response.assets?.[0];
          if (asset && asset.uri) {
            resolve({
              uri: asset.uri,
              fileName: asset.fileName || 'camera_image.jpg',
              fileSize: asset.fileSize || 0,
              width: asset.width || 0,
              height: asset.height || 0,
            });
          } else {
            resolve(null);
          }
        }
      );
    });
  }

  /**
   * Open photo library to select existing photo
   */
  static async openPhotoLibrary(): Promise<ImagePickerResult | null> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Photo library permission is required to select images.');
      return null;
    }

    return new Promise((resolve) => {
      launchImageLibrary(
        {
          mediaType: 'photo' as MediaType,
          quality: 0.8,
          maxWidth: 2000,
          maxHeight: 2000,
          includeBase64: false,
          selectionLimit: 1,
        },
        (response: ImagePickerResponse) => {
          if (response.didCancel || response.errorMessage) {
            resolve(null);
            return;
          }

          const asset = response.assets?.[0];
          if (asset && asset.uri) {
            resolve({
              uri: asset.uri,
              fileName: asset.fileName || 'selected_image.jpg',
              fileSize: asset.fileSize || 0,
              width: asset.width || 0,
              height: asset.height || 0,
            });
          } else {
            resolve(null);
          }
        }
      );
    });
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