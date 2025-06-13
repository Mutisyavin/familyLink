import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { getUserData, getCurrentTree } from '@/utils/storage';

export default function IndexScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthAndRedirect();
  }, []);

  const checkAuthAndRedirect = async () => {
    try {
      const userData = await getUserData();
      
      if (!userData) {
        // No user data, show welcome screen
        router.replace('/welcome');
        return;
      }

      // User is authenticated, check if they have a family tree
      const currentTree = await getCurrentTree();
      
      if (!currentTree) {
        // User exists but no tree, redirect to create founder
        router.replace('/onboarding/create-founder');
        return;
      }

      // User has everything, go to main app
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error checking auth status:', error);
      // On error, default to welcome screen
      router.replace('/welcome');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#D2691E" />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
}); 