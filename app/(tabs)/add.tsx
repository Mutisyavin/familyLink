import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Save, ArrowLeft } from 'lucide-react-native';
import PhotoUpload from '@/components/PhotoUpload';
import SocialMediaInput from '@/components/SocialMediaInput';
import VoiceRecorder from '@/components/VoiceRecorder';
import { FamilyMember, SocialMediaProfiles } from '@/types/FamilyMember';
import { StorageService, getCurrentTree, storeFamilyTree } from '@/utils/storage';
import { suggestRelationships } from '@/utils/kinshipMapping';

export default function AddMemberScreen() {
  const [formData, setFormData] = useState<Partial<FamilyMember>>({
    name: '',
    gender: 'male',
    dateOfBirth: '',
    birthPlace: '',
    occupation: '',
    biography: '',
    socialMedia: {},
    relationships: {
      parents: [],
      siblings: [],
      spouses: [],
      children: [],
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingMembers, setExistingMembers] = useState<FamilyMember[]>([]);

  useEffect(() => {
    loadExistingMembers();
  }, []);

  const loadExistingMembers = async () => {
    try {
      const currentTree = await getCurrentTree();
      if (currentTree) {
        setExistingMembers(currentTree.members);
      }
    } catch (error) {
      console.error('Error loading existing members:', error);
    }
  };

  const updateField = (field: keyof FamilyMember, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateSocialMedia = (socialMedia: SocialMediaProfiles) => {
    setFormData(prev => ({ ...prev, socialMedia }));
  };

  const handleSubmit = async () => {
    if (!formData.name?.trim()) {
      Alert.alert('Required Field', 'Please enter a name for this family member.');
      return;
    }

    try {
      setIsSubmitting(true);

      const newMember: FamilyMember = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        gender: formData.gender as 'male' | 'female' | 'other',
        photoUri: formData.photoUri,
        dateOfBirth: formData.dateOfBirth,
        birthPlace: formData.birthPlace,
        occupation: formData.occupation,
        biography: formData.biography,
        socialMedia: formData.socialMedia || {},
        relationships: formData.relationships || {
          parents: [],
          siblings: [],
          spouses: [],
          children: [],
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Update the current tree with the new member
      const currentTree = await getCurrentTree();
      if (currentTree) {
        const updatedTree = {
          ...currentTree,
          members: [...currentTree.members, newMember],
          updatedAt: new Date().toISOString(),
        };
        await storeFamilyTree(updatedTree);
      } else {
        // Fallback to old storage method
        await StorageService.addFamilyMember(newMember);
      }

      Alert.alert(
        'Success!',
        `${newMember.name} has been added to your family tree.`,
        [
          {
            text: 'Add Another',
            onPress: () => {
              setFormData({
                name: '',
                gender: 'male',
                dateOfBirth: '',
                birthPlace: '',
                occupation: '',
                biography: '',
                socialMedia: {},
                relationships: {
                  parents: [],
                  siblings: [],
                  spouses: [],
                  children: [],
                },
              });
            },
          },
          {
            text: 'View Tree',
            onPress: () => router.push('/'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save family member. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#92400E" />
          </TouchableOpacity>
          <Text style={styles.title}>Add Family Member</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Family Photo</Text>
            <PhotoUpload
              onPhotoSelected={(uri) => updateField('photoUri', uri)}
              currentPhoto={formData.photoUri}
              onPhotoRemoved={() => updateField('photoUri', undefined)}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter full name"
                placeholderTextColor="#A16207"
                value={formData.name}
                onChangeText={(text) => updateField('name', text)}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Gender *</Text>
              <View style={styles.genderContainer}>
                {(['male', 'female', 'other'] as const).map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.genderOption,
                      formData.gender === option && styles.selectedGenderOption,
                    ]}
                    onPress={() => updateField('gender', option)}
                  >
                    <Text
                      style={[
                        styles.genderText,
                        formData.gender === option && styles.selectedGenderText,
                      ]}
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Date of Birth</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#A16207"
                value={formData.dateOfBirth}
                onChangeText={(text) => updateField('dateOfBirth', text)}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Place of Birth</Text>
              <TextInput
                style={styles.input}
                placeholder="City, Country"
                placeholderTextColor="#A16207"
                value={formData.birthPlace}
                onChangeText={(text) => updateField('birthPlace', text)}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Occupation</Text>
              <TextInput
                style={styles.input}
                placeholder="Profession or occupation"
                placeholderTextColor="#A16207"
                value={formData.occupation}
                onChangeText={(text) => updateField('occupation', text)}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Biography</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Share their story, achievements, memories..."
                placeholderTextColor="#A16207"
                value={formData.biography}
                onChangeText={(text) => updateField('biography', text)}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          <SocialMediaInput
            socialMedia={formData.socialMedia || {}}
            onUpdate={updateSocialMedia}
          />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Voice Note</Text>
            <VoiceRecorder
              existingVoiceUri={formData.voiceNoteUri}
              onVoiceRecorded={(uri) => updateField('voiceNoteUri', uri)}
              onVoiceRemoved={() => updateField('voiceNoteUri', undefined)}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Save size={20} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Saving...' : 'Add to Family Tree'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBEB',
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#FEF3C7',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#92400E',
    fontFamily: 'Inter-SemiBold',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 16,
    fontFamily: 'Inter-Bold',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#92400E',
    marginBottom: 8,
    fontFamily: 'Inter-Medium',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#92400E',
    fontFamily: 'Inter-Regular',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  selectedGenderOption: {
    borderColor: '#92400E',
    backgroundColor: '#FEF3C7',
  },
  genderText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#A16207',
  },
  selectedGenderText: {
    color: '#92400E',
  },
  buttonContainer: {
    paddingVertical: 32,
  },
  submitButton: {
    backgroundColor: '#92400E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
});