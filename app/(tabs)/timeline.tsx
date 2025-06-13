import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import TimelineView from '@/components/TimelineView';
import { FamilyMember } from '@/types/FamilyMember';
import { getCurrentTree } from '@/utils/storage';

export default function TimelineScreen() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFamilyMembers();
  }, []);

  const loadFamilyMembers = async () => {
    try {
      const currentTree = await getCurrentTree();
      if (currentTree) {
        setMembers(currentTree.members);
      }
    } catch (error) {
      console.error('Error loading family members:', error);
      Alert.alert('Error', 'Failed to load family timeline.');
    } finally {
      setLoading(false);
    }
  };

  const handleEventPress = (event: any) => {
    Alert.alert(
      event.title,
      `${event.description}\n\nDate: ${event.date.toLocaleDateString()}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <TimelineView 
        members={members} 
        onEventPress={handleEventPress}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
}); 