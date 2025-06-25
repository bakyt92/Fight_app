import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';

interface AnalysisResult {
  extractedText: string;
  suggestions: string[];
  tone: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

const FightScreen: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleImageUpload = () => {
    // Simulate image picker for demo
    Alert.alert(
      'Upload Screenshot',
      'Choose image source',
      [
        { text: 'Camera', onPress: () => simulateImagePick('camera') },
        { text: 'Photo Library', onPress: () => simulateImagePick('library') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const simulateImagePick = (source: string) => {
    // Demo: Set a placeholder image
    setSelectedImage('https://via.placeholder.com/300x200/e3f2fd/1976d2?text=Screenshot+Preview');
    
    // Simulate analysis
    setIsAnalyzing(true);
    setTimeout(() => {
      setAnalysisResult({
        extractedText: "Hey, are we still meeting tomorrow at 3pm? I wanted to confirm because I have another appointment that might conflict.",
        suggestions: [
          "Yes, confirmed for 3pm tomorrow! Looking forward to it.",
          "I can do 3pm, but would 2:30pm work better for you?",
          "Let me check my calendar and get back to you in a few minutes.",
          "Tomorrow at 3pm works perfectly. See you there!"
        ],
        tone: "Casual and friendly",
        sentiment: "neutral"
      });
      setIsAnalyzing(false);
    }, 2000);
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    setIsAnalyzing(false);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* Upload Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🥊 Fight Mode</Text>
        <Text style={styles.sectionSubtitle}>Upload screenshots to get winning response strategies</Text>
        
        {!selectedImage ? (
          <TouchableOpacity style={styles.uploadButton} onPress={handleImageUpload}>
            <Text style={styles.uploadIcon}>📷</Text>
            <Text style={styles.uploadText}>Tap to upload conversation screenshot</Text>
            <Text style={styles.uploadSubtext}>Camera or Photo Library</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.imageContainer}>
            <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            <TouchableOpacity style={styles.changeImageButton} onPress={handleImageUpload}>
              <Text style={styles.changeImageText}>Change Image</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Analysis Loading */}
      {isAnalyzing && (
        <View style={styles.section}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ff4444" />
            <Text style={styles.loadingText}>Analyzing conversation...</Text>
            <Text style={styles.loadingSubtext}>Generating winning strategies</Text>
          </View>
        </View>
      )}

      {/* Analysis Results */}
      {analysisResult && !isAnalyzing && (
        <>
          {/* Extracted Text */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Extracted Text</Text>
            <View style={styles.extractedTextContainer}>
              <Text style={styles.extractedText}>{analysisResult.extractedText}</Text>
            </View>
            <View style={styles.metadataContainer}>
              <Text style={styles.metadata}>Tone: {analysisResult.tone}</Text>
              <View style={[styles.sentimentBadge, styles[`sentiment${analysisResult.sentiment}`]]}>
                <Text style={styles.sentimentText}>{analysisResult.sentiment}</Text>
              </View>
            </View>
          </View>

          {/* AI Suggestions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 Winning Responses</Text>
            {analysisResult.suggestions.map((suggestion, index) => (
              <TouchableOpacity key={index} style={styles.suggestionCard}>
                <View style={styles.suggestionHeader}>
                  <Text style={styles.suggestionNumber}>#{index + 1}</Text>
                  <Text style={styles.suggestionLabel}>Strategic Response</Text>
                </View>
                <Text style={styles.suggestionText}>{suggestion}</Text>
                <Text style={styles.copyHint}>Tap to copy and dominate</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Reset Button */}
          <TouchableOpacity style={styles.resetButton} onPress={resetAnalysis}>
            <Text style={styles.resetButtonText}>🔄 New Fight</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Feature Info */}
      {!selectedImage && !isAnalyzing && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ How to Win</Text>
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>1. Upload a conversation screenshot</Text>
            <Text style={styles.featureItem}>2. AI analyzes weaknesses and opportunities</Text>
            <Text style={styles.featureItem}>3. Get strategic response suggestions</Text>
            <Text style={styles.featureItem}>4. Copy and send your winning response</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 16,
  },
  uploadButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ff4444',
    borderStyle: 'dashed',
    paddingVertical: 40,
    alignItems: 'center',
    marginBottom: 10,
  },
  uploadIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#495057',
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: 14,
    color: '#6c757d',
  },
  imageContainer: {
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  changeImageButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  changeImageText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#495057',
    marginTop: 12,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 4,
  },
  extractedTextContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  extractedText: {
    fontSize: 16,
    color: '#495057',
    lineHeight: 24,
  },
  metadataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metadata: {
    fontSize: 14,
    color: '#6c757d',
  },
  sentimentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sentimentpositive: {
    backgroundColor: '#d4edda',
  },
  sentimentnegative: {
    backgroundColor: '#f8d7da',
  },
  sentimentneutral: {
    backgroundColor: '#e2e3e5',
  },
  sentimentText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  suggestionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff4444',
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  suggestionNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ff4444',
    marginRight: 8,
  },
  suggestionLabel: {
    fontSize: 12,
    color: '#6c757d',
    textTransform: 'uppercase',
  },
  suggestionText: {
    fontSize: 16,
    color: '#495057',
    lineHeight: 22,
    marginBottom: 8,
  },
  copyHint: {
    fontSize: 12,
    color: '#ff4444',
    fontStyle: 'italic',
  },
  resetButton: {
    backgroundColor: '#ff4444',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginVertical: 20,
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  featureList: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
  },
  featureItem: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 8,
    paddingLeft: 8,
  },
});

export default FightScreen; 