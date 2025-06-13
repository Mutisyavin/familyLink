import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { socialAuthService } from '@/utils/socialAuthService';

export default function SocialAuthDemo() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const socialProviders = [
    {
      id: 'google',
      name: 'Google',
      icon: 'logo-google',
      color: '#DB4437',
      description: 'Sign in with your Google account',
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: 'logo-facebook',
      color: '#4267B2',
      description: 'Connect with Facebook',
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: 'logo-instagram',
      color: '#E4405F',
      description: 'Link your Instagram profile',
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: 'musical-notes',
      color: '#000000',
      description: 'Connect with TikTok',
    },
  ];

  const handleSocialAuth = async (provider: 'google' | 'facebook' | 'instagram' | 'tiktok') => {
    setLoadingProvider(provider);
    setIsLoading(true);

    try {
      const result = await socialAuthService.signInWithProvider(provider);
      
      if (result.success && result.user) {
        Alert.alert(
          'Authentication Successful!',
          `Welcome ${result.user.name}!\n\nProvider: ${result.user.provider}\nEmail: ${result.user.email || 'Not provided'}\nID: ${result.user.id}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Authentication Failed', result.error || 'Unknown error occurred');
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  const getRedirectUri = () => {
    const uri = socialAuthService.getRedirectUri();
    Alert.alert(
      'Redirect URI',
      `The configured redirect URI is:\n\n${uri}\n\nUse this URI when setting up your OAuth providers.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="shield-checkmark" size={48} color="#D2691E" />
        <Text style={styles.title}>Social Authentication Demo</Text>
        <Text style={styles.subtitle}>
          Test the social media login integration
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Providers</Text>
        <Text style={styles.sectionDescription}>
          Click on any provider to test the authentication flow
        </Text>

        {socialProviders.map((provider) => (
          <TouchableOpacity
            key={provider.id}
            style={[styles.providerCard, { borderColor: provider.color }]}
            onPress={() => handleSocialAuth(provider.id as any)}
            disabled={isLoading}
          >
            <View style={styles.providerHeader}>
              <Ionicons name={provider.icon as any} size={24} color={provider.color} />
              <Text style={styles.providerName}>{provider.name}</Text>
              {loadingProvider === provider.id && (
                <Text style={styles.loadingText}>Loading...</Text>
              )}
            </View>
            <Text style={styles.providerDescription}>{provider.description}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configuration</Text>
        <TouchableOpacity style={styles.configButton} onPress={getRedirectUri}>
          <Ionicons name="settings" size={20} color="#8B4513" />
          <Text style={styles.configButtonText}>View Redirect URI</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Demo Mode</Text>
        <Text style={styles.infoText}>
          This is a demo implementation. In production, you'll need to:
        </Text>
        <View style={styles.infoList}>
          <Text style={styles.infoItem}>• Set up OAuth apps with each provider</Text>
          <Text style={styles.infoItem}>• Configure environment variables</Text>
          <Text style={styles.infoItem}>• Add proper redirect URI handling</Text>
          <Text style={styles.infoItem}>• Implement real token exchange</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBEB',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FEF3C7',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Playfair-Bold',
    color: '#8B4513',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#92400E',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#333333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginBottom: 16,
  },
  providerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  providerName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333333',
    marginLeft: 12,
    flex: 1,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#D2691E',
  },
  providerDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginLeft: 36,
  },
  configButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  configButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#8B4513',
  },
  infoSection: {
    backgroundColor: '#F3F4F6',
    margin: 24,
    padding: 20,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 12,
  },
  infoList: {
    gap: 4,
  },
  infoItem: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
}); 