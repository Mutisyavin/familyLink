import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FamilyMember } from '@/types/FamilyMember';
import { aiService } from '@/utils/aiService';

interface AIBiographyGeneratorProps {
  member: FamilyMember;
  allMembers: FamilyMember[];
  currentBiography?: string;
  onBiographyGenerated: (biography: string) => void;
  style?: any;
}

export default function AIBiographyGenerator({
  member,
  allMembers,
  currentBiography,
  onBiographyGenerated,
  style,
}: AIBiographyGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBiography, setGeneratedBiography] = useState<string>('');
  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState({
    style: 'storytelling' as 'formal' | 'casual' | 'storytelling' | 'historical',
    length: 'medium' as 'short' | 'medium' | 'long',
    includeRelationships: true,
    culturalContext: '',
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const generateBiography = async () => {
    setIsGenerating(true);
    try {
      const biography = await aiService.generateBiography(member, allMembers, options);
      setGeneratedBiography(biography);
      
      // Get suggestions for improvement
      const improvementSuggestions = await aiService.suggestImprovements(biography, member);
      setSuggestions(improvementSuggestions);
    } catch (error) {
      console.error('Error generating biography:', error);
      Alert.alert(
        'Generation Error',
        'Failed to generate biography. Please try again or check your internet connection.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const acceptBiography = () => {
    if (generatedBiography) {
      onBiographyGenerated(generatedBiography);
      setGeneratedBiography('');
      Alert.alert('Success', 'Biography has been applied to the family member!');
    }
  };

  const regenerateBiography = () => {
    Alert.alert(
      'Regenerate Biography',
      'This will create a new biography with the current settings. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Regenerate', onPress: generateBiography },
      ]
    );
  };

  const getStyleDescription = (style: string) => {
    switch (style) {
      case 'formal':
        return 'Professional and respectful tone';
      case 'casual':
        return 'Warm and conversational';
      case 'storytelling':
        return 'Engaging narrative style';
      case 'historical':
        return 'Historical context and significance';
      default:
        return '';
    }
  };

  const getLengthDescription = (length: string) => {
    switch (length) {
      case 'short':
        return '2-3 sentences';
      case 'medium':
        return '1-2 paragraphs';
      case 'long':
        return '3-4 paragraphs';
      default:
        return '';
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="sparkles" size={20} color="#D2691E" />
          <Text style={styles.title}>AI Biography Generator</Text>
        </View>
        
        {aiService.isAvailable() ? (
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>AI Ready</Text>
          </View>
        ) : (
          <View style={[styles.statusBadge, styles.fallbackBadge]}>
            <Text style={styles.statusText}>Template Mode</Text>
          </View>
        )}
      </View>

      <Text style={styles.description}>
        Generate an engaging life story using AI or smart templates based on the family member's information and relationships.
      </Text>

      {/* Generation Options */}
      <TouchableOpacity
        style={styles.optionsToggle}
        onPress={() => setShowOptions(!showOptions)}
      >
        <Text style={styles.optionsToggleText}>
          {showOptions ? 'Hide Options' : 'Customize Generation'}
        </Text>
        <Ionicons 
          name={showOptions ? "chevron-up" : "chevron-down"} 
          size={16} 
          color="#8B4513" 
        />
      </TouchableOpacity>

      {showOptions && (
        <View style={styles.optionsContainer}>
          {/* Style Selection */}
          <View style={styles.optionGroup}>
            <Text style={styles.optionLabel}>Writing Style</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.optionButtons}>
                {(['storytelling', 'casual', 'formal', 'historical'] as const).map((styleOption) => (
                  <TouchableOpacity
                    key={styleOption}
                    style={[
                      styles.optionButton,
                      options.style === styleOption && styles.selectedOptionButton,
                    ]}
                    onPress={() => setOptions({ ...options, style: styleOption })}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        options.style === styleOption && styles.selectedOptionButtonText,
                      ]}
                    >
                      {styleOption.charAt(0).toUpperCase() + styleOption.slice(1)}
                    </Text>
                    <Text style={styles.optionDescription}>
                      {getStyleDescription(styleOption)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Length Selection */}
          <View style={styles.optionGroup}>
            <Text style={styles.optionLabel}>Length</Text>
            <View style={styles.optionButtons}>
              {(['short', 'medium', 'long'] as const).map((lengthOption) => (
                <TouchableOpacity
                  key={lengthOption}
                  style={[
                    styles.optionButton,
                    options.length === lengthOption && styles.selectedOptionButton,
                  ]}
                  onPress={() => setOptions({ ...options, length: lengthOption })}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      options.length === lengthOption && styles.selectedOptionButtonText,
                    ]}
                  >
                    {lengthOption.charAt(0).toUpperCase() + lengthOption.slice(1)}
                  </Text>
                  <Text style={styles.optionDescription}>
                    {getLengthDescription(lengthOption)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Include Relationships Toggle */}
          <View style={styles.optionGroup}>
            <TouchableOpacity
              style={styles.toggleOption}
              onPress={() => setOptions({ ...options, includeRelationships: !options.includeRelationships })}
            >
              <Text style={styles.optionLabel}>Include Family Relationships</Text>
              <View style={[styles.toggle, options.includeRelationships && styles.toggleActive]}>
                <View style={[styles.toggleDot, options.includeRelationships && styles.toggleDotActive]} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Cultural Context */}
          <View style={styles.optionGroup}>
            <Text style={styles.optionLabel}>Cultural Context (Optional)</Text>
            <TextInput
              style={styles.textInput}
              value={options.culturalContext}
              onChangeText={(text) => setOptions({ ...options, culturalContext: text })}
              placeholder="e.g., African heritage, immigrant family, etc."
              placeholderTextColor="#999999"
            />
          </View>
        </View>
      )}

      {/* Generate Button */}
      <TouchableOpacity
        style={[styles.generateButton, isGenerating && styles.disabledButton]}
        onPress={generateBiography}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <Ionicons name="sparkles" size={20} color="#FFFFFF" />
            <Text style={styles.generateButtonText}>Generate Biography</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Generated Biography */}
      {generatedBiography && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Generated Biography</Text>
          <ScrollView style={styles.biographyContainer} nestedScrollEnabled>
            <Text style={styles.biographyText}>{generatedBiography}</Text>
          </ScrollView>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>Suggestions for Enhancement:</Text>
              {suggestions.map((suggestion, index) => (
                <View key={index} style={styles.suggestionItem}>
                  <Ionicons name="bulb-outline" size={14} color="#D2691E" />
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.regenerateButton} onPress={regenerateBiography}>
              <Ionicons name="refresh" size={16} color="#8B4513" />
              <Text style={styles.regenerateButtonText}>Regenerate</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.acceptButton} onPress={acceptBiography}>
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              <Text style={styles.acceptButtonText}>Use This Biography</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#333333',
  },
  statusBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  fallbackBadge: {
    backgroundColor: '#F59E0B',
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginBottom: 16,
    lineHeight: 20,
  },
  optionsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginBottom: 12,
  },
  optionsToggleText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#8B4513',
  },
  optionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  optionGroup: {
    marginBottom: 16,
  },
  optionLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333333',
    marginBottom: 8,
  },
  optionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minWidth: 80,
    alignItems: 'center',
  },
  selectedOptionButton: {
    backgroundColor: '#FFF8F0',
    borderColor: '#D2691E',
  },
  optionButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666666',
  },
  selectedOptionButtonText: {
    color: '#D2691E',
  },
  optionDescription: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#999999',
    textAlign: 'center',
    marginTop: 2,
  },
  toggleOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#D2691E',
  },
  toggleDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
  },
  toggleDotActive: {
    alignSelf: 'flex-end',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    backgroundColor: '#FFFFFF',
  },
  generateButton: {
    backgroundColor: '#D2691E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  resultContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  resultTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333333',
    marginBottom: 8,
  },
  biographyContainer: {
    maxHeight: 150,
    marginBottom: 12,
  },
  biographyText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333333',
    lineHeight: 20,
  },
  suggestionsContainer: {
    backgroundColor: '#FFF8F0',
    borderRadius: 6,
    padding: 8,
    marginBottom: 12,
  },
  suggestionsTitle: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#D2691E',
    marginBottom: 6,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  suggestionText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#8B4513',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  regenerateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#8B4513',
    gap: 4,
  },
  regenerateButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#8B4513',
  },
  acceptButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#10B981',
    gap: 4,
  },
  acceptButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
}); 