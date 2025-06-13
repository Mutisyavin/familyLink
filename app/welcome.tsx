import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen() {
  const [selectedOption, setSelectedOption] = useState<'create' | 'join' | null>(null);

  const handleCreateTree = () => {
    setSelectedOption('create');
    // Navigate to authentication with create tree context
    router.push('/auth?mode=create');
  };

  const handleJoinTree = () => {
    setSelectedOption('join');
    Alert.alert(
      'Join Family Tree',
      'You can join a family tree by:\n\n• Receiving an invitation link\n• Scanning a QR code\n• Entering an invite code',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => router.push('/auth?mode=join') }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="git-network" size={48} color="#D2691E" />
          <Text style={styles.logoText}>LegacyLink</Text>
        </View>
        <Text style={styles.tagline}>Connect Your Family Heritage</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            Preserve Your Family Story
          </Text>
          <Text style={styles.heroSubtitle}>
            Create beautiful family trees, share memories, and connect generations with photos, stories, and heritage.
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity 
            style={[
              styles.optionCard,
              selectedOption === 'create' && styles.selectedCard
            ]}
            onPress={handleCreateTree}
          >
            <View style={styles.optionIcon}>
              <Ionicons name="add-circle" size={32} color="#D2691E" />
            </View>
            <Text style={styles.optionTitle}>Start New Tree</Text>
            <Text style={styles.optionDescription}>
              Begin your family's digital legacy by creating a new family tree
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.optionCard,
              selectedOption === 'join' && styles.selectedCard
            ]}
            onPress={handleJoinTree}
          >
            <View style={styles.optionIcon}>
              <Ionicons name="people" size={32} color="#8B4513" />
            </View>
            <Text style={styles.optionTitle}>Join Family Tree</Text>
            <Text style={styles.optionDescription}>
              Connect to an existing family tree with an invitation or code
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Ionicons name="camera" size={20} color="#D2691E" />
            <Text style={styles.featureText}>Photo-first design</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="shield-checkmark" size={20} color="#D2691E" />
            <Text style={styles.featureText}>Private & secure</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="people-circle" size={20} color="#D2691E" />
            <Text style={styles.featureText}>Family collaboration</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
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
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoText: {
    fontSize: 32,
    fontFamily: 'Playfair-Bold',
    color: '#8B4513',
    marginLeft: 12,
  },
  tagline: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  heroSection: {
    alignItems: 'center',
    marginVertical: 32,
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: 'Playfair-Bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  optionsContainer: {
    marginVertical: 24,
  },
  optionCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  selectedCard: {
    borderColor: '#D2691E',
    backgroundColor: '#FFF8F0',
  },
  optionIcon: {
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#333333',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 32,
    paddingHorizontal: 16,
  },
  feature: {
    alignItems: 'center',
    flex: 1,
  },
  featureText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666666',
    marginTop: 8,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#999999',
    textAlign: 'center',
    lineHeight: 16,
  },
}); 