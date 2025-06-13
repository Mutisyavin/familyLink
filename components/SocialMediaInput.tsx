import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
} from 'react-native';
import { SocialMediaProfiles } from '@/types/FamilyMember';
import { Instagram, Facebook, Linkedin, Twitter } from 'lucide-react-native';

interface SocialMediaInputProps {
  socialMedia: SocialMediaProfiles;
  onUpdate: (socialMedia: SocialMediaProfiles) => void;
}

export default function SocialMediaInput({
  socialMedia,
  onUpdate,
}: SocialMediaInputProps) {
  const updateField = (field: keyof SocialMediaProfiles, value: string) => {
    onUpdate({
      ...socialMedia,
      [field]: value,
    });
  };

  const socialPlatforms = [
    {
      key: 'instagram' as keyof SocialMediaProfiles,
      label: 'Instagram',
      icon: Instagram,
      placeholder: '@username',
    },
    {
      key: 'facebook' as keyof SocialMediaProfiles,
      label: 'Facebook',
      icon: Facebook,
      placeholder: 'facebook.com/username',
    },
    {
      key: 'linkedin' as keyof SocialMediaProfiles,
      label: 'LinkedIn',
      icon: Linkedin,
      placeholder: 'linkedin.com/in/username',
    },
    {
      key: 'twitter' as keyof SocialMediaProfiles,
      label: 'Twitter',
      icon: Twitter,
      placeholder: '@username',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Social Media Profiles</Text>
      <Text style={styles.sectionSubtitle}>
        Connect family members' social media profiles (optional)
      </Text>

      {socialPlatforms.map((platform) => {
        const IconComponent = platform.icon;
        return (
          <View key={platform.key} style={styles.inputContainer}>
            <View style={styles.inputHeader}>
              <IconComponent size={20} color="#92400E" />
              <Text style={styles.inputLabel}>{platform.label}</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder={platform.placeholder}
              placeholderTextColor="#A16207"
              value={socialMedia[platform.key] || ''}
              onChangeText={(text) => updateField(platform.key, text)}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#A16207',
    marginBottom: 16,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#92400E',
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
  },
});