import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import SocialAuthForm from '@/components/SocialAuthForm';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AuthScreen() {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const params = useLocalSearchParams();

  useEffect(() => {
    // Check if user is already authenticated
    checkExistingAuth();
    
    // Set auth mode based on params
    if (params.mode === 'join') {
      setAuthMode('signin');
    }
  }, []);

  const checkExistingAuth = async () => {
    try {
      const isAuthenticated = await AsyncStorage.getItem('isAuthenticated');
      if (isAuthenticated === 'true') {
        // User is already authenticated, redirect to main app
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.log('No existing auth found');
    }
  };

  const handleAuthSuccess = async (user: any) => {
    try {
      // Store user data locally
      await AsyncStorage.setItem('currentUser', JSON.stringify(user));
      await AsyncStorage.setItem('isAuthenticated', 'true');
      
      // Check the mode from params to determine next step
      const mode = params.mode as string;
      
      if (mode === 'create') {
        // Show success message and navigate to create founder
        Alert.alert(
          'Welcome to LegacyLink!',
          `Hello ${user.name}! Let's start by creating your family tree.`,
          [
            {
              text: 'Continue',
              onPress: () => router.replace('/onboarding/create-founder'),
            },
          ]
        );
      } else if (mode === 'join') {
        // Navigate to join tree flow
        Alert.alert(
          'Welcome Back!',
          `Hello ${user.name}! You can now join an existing family tree.`,
          [
            {
              text: 'Continue',
              onPress: () => router.replace('/onboarding/join-tree'),
            },
          ]
        );
      } else {
        // Default navigation to main app
        Alert.alert(
          'Welcome to LegacyLink!',
          `Hello ${user.name}! You're now ready to explore your family tree.`,
          [
            {
              text: 'Continue',
              onPress: () => router.replace('/(tabs)'),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error storing user data:', error);
      // Fallback navigation
      router.replace('/(tabs)');
    }
  };

  const handleAuthError = (error: string) => {
    Alert.alert('Authentication Error', error);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <SocialAuthForm
            mode={authMode}
            onModeChange={setAuthMode}
            onAuthSuccess={handleAuthSuccess}
            onAuthError={handleAuthError}
          />
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
  scrollContent: {
    flexGrow: 1,
  },
}); 