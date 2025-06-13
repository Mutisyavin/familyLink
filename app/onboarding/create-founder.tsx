import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import PhotoUpload from '@/components/PhotoUpload';
import VoiceRecorder from '@/components/VoiceRecorder';
import { FamilyMember, FamilyTree, UserAccount } from '@/types/FamilyMember';
import { getUserData, storeFamilyTree, setCurrentTree } from '@/utils/storage';

export default function CreateFounderScreen() {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [occupation, setOccupation] = useState('');
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [voiceNoteUri, setVoiceNoteUri] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const handleCreateFounder = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setLoading(true);
    try {
      const userData = await getUserData();
      if (!userData) {
        Alert.alert('Error', 'User data not found. Please sign in again.');
        router.replace('/auth');
        return;
      }

      // Create the founder member
      const founderId = Date.now().toString();
      const founder: FamilyMember = {
        id: founderId,
        name: name.trim(),
        gender,
        photoUri,
        dateOfBirth: dateOfBirth || undefined,
        birthPlace: birthPlace || undefined,
        occupation: occupation || undefined,
        biography: `Founder of the ${name.split(' ')[0]} family tree on LegacyLink.`,
        socialMedia: {},
        relationships: {
          parents: [],
          siblings: [],
          spouses: [],
          children: [],
        },
        voiceNoteUri,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Create the family tree
      const treeId = `tree_${Date.now()}`;
      const familyTree: FamilyTree = {
        id: treeId,
        ownerId: userData.id,
        title: `${name.split(' ')[0]} Family Tree`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        members: [founder],
        invitedEmails: [],
        collaborators: [{
          userId: userData.id,
          role: 'admin',
          joinedAt: new Date().toISOString(),
        }],
      };

      // Store the tree and set as current
      await storeFamilyTree(familyTree);
      await setCurrentTree(familyTree);

      // Navigate to main app
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error creating founder:', error);
      Alert.alert('Error', 'Failed to create your family tree. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Your Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>You're the founder!</Text>
          <Text style={styles.sectionSubtitle}>
            Add your information to start your family tree. You can always edit this later.
          </Text>
        </View>

        <View style={styles.photoSection}>
          <PhotoUpload
            currentPhotoUri={photoUri}
            onPhotoSelected={setPhotoUri}
            style={styles.photoUpload}
          />
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Gender *</Text>
            <View style={styles.genderContainer}>
              {(['male', 'female', 'other'] as const).map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.genderOption,
                    gender === option && styles.selectedGenderOption,
                  ]}
                  onPress={() => setGender(option)}
                >
                  <Text
                    style={[
                      styles.genderText,
                      gender === option && styles.selectedGenderText,
                    ]}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Date of Birth</Text>
            <TextInput
              style={styles.input}
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              placeholder="MM/DD/YYYY"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Place of Birth</Text>
            <TextInput
              style={styles.input}
              value={birthPlace}
              onChangeText={setBirthPlace}
              placeholder="City, Country"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Occupation</Text>
            <TextInput
              style={styles.input}
              value={occupation}
              onChangeText={setOccupation}
              placeholder="Your profession or job title"
              autoCapitalize="words"
            />
                      </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Voice Note (Optional)</Text>
              <VoiceRecorder
                existingVoiceUri={voiceNoteUri}
                onVoiceRecorded={setVoiceNoteUri}
                onVoiceRemoved={() => setVoiceNoteUri(undefined)}
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.createButton, loading && styles.disabledButton]}
          onPress={handleCreateFounder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.createButtonText}>Create My Tree</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333333',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'Playfair-Bold',
    color: '#8B4513',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  photoUpload: {
    marginBottom: 16,
  },
  form: {
    paddingBottom: 100,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    backgroundColor: '#FAFAFA',
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
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
  },
  selectedGenderOption: {
    borderColor: '#D2691E',
    backgroundColor: '#FFF8F0',
  },
  genderText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666666',
  },
  selectedGenderText: {
    color: '#D2691E',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  createButton: {
    backgroundColor: '#D2691E',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
}); 