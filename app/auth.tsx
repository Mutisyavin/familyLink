import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AuthForm from '@/components/AuthForm';
import { UserAccount } from '@/types/FamilyMember';
import { storeUserData, getUserData } from '@/utils/storage';

export default function AuthScreen() {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const params = useLocalSearchParams();

  useEffect(() => {
    // Check if user is already authenticated
    checkExistingAuth();
  }, []);

  const checkExistingAuth = async () => {
    try {
      const userData = await getUserData();
      if (userData) {
        // User is already authenticated, redirect to main app
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.log('No existing auth found');
    }
  };

  const handleAuthSuccess = async (user: UserAccount) => {
    try {
      // Store user data locally
      await storeUserData(user);
      
      // Check the mode from params to determine next step
      const mode = params.mode as string;
      
      if (mode === 'create') {
        // Navigate to create first family member (themselves)
        router.replace('/onboarding/create-founder');
      } else if (mode === 'join') {
        // Navigate to join tree flow
        router.replace('/onboarding/join-tree');
      } else {
        // Default navigation to main app
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  };

  const toggleAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'signup' : 'login');
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
        >
          <AuthForm
            mode={authMode}
            onToggleMode={toggleAuthMode}
            onAuthSuccess={handleAuthSuccess}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
}); 