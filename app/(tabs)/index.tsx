import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Plus, TreePine } from 'lucide-react-native';
import { router } from 'expo-router';
import FamilyTreeView from '@/components/FamilyTreeView';
import CloudSyncStatus from '@/components/CloudSyncStatus';
import { FamilyMember, TreeNode, TreeConnection } from '@/types/FamilyMember';
import { StorageService } from '@/utils/storage';
import { TreeLayoutService } from '@/utils/treeLayout';

export default function HomeScreen() {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [treeNodes, setTreeNodes] = useState<TreeNode[]>([]);
  const [treeConnections, setTreeConnections] = useState<TreeConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFamilyData = async () => {
    try {
      const members = await StorageService.loadFamilyMembers();
      setFamilyMembers(members);
      
      if (members.length > 0) {
        const { nodes, connections } = TreeLayoutService.generateTreeLayout(members);
        setTreeNodes(nodes);
        setTreeConnections(connections);
      } else {
        setTreeNodes([]);
        setTreeConnections([]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load family data');
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadFamilyData();
    }, [])
  );

  const handleNodePress = (nodeId: string) => {
    const member = familyMembers.find(m => m.id === nodeId);
    if (member) {
      // Navigate to member details (could be implemented later)
      Alert.alert(
        member.name,
        `Born: ${member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString() : 'Unknown'}\n${member.biography ? member.biography : 'No biography available'}`
      );
    }
  };

  const handleAddFirstMember = () => {
    router.push('/add');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your family tree...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.titleContainer}>
            <TreePine size={28} color="#92400E" />
            <Text style={styles.title}>LegacyLink</Text>
          </View>
          <CloudSyncStatus />
        </View>
        <Text style={styles.subtitle}>Your family's digital legacy</Text>
      </View>

      <View style={styles.content}>
        {familyMembers.length === 0 ? (
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>Welcome to LegacyLink</Text>
            <Text style={styles.welcomeDescription}>
              Begin your family's digital journey by adding your first family member. 
              Each photo and story becomes part of your lasting legacy.
            </Text>
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleAddFirstMember}
            >
              <Plus size={20} color="#FFFFFF" />
              <Text style={styles.startButtonText}>Add First Family Member</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FamilyTreeView
            nodes={treeNodes}
            connections={treeConnections}
            onNodePress={handleNodePress}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBEB',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#FEF3C7',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#92400E',
    fontFamily: 'Playfair-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#A16207',
    marginTop: 4,
    fontFamily: 'Inter-Regular',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#A16207',
    fontFamily: 'Inter-Regular',
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#92400E',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Playfair-Bold',
  },
  welcomeDescription: {
    fontSize: 18,
    color: '#A16207',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 32,
    fontFamily: 'Inter-Regular',
  },
  startButton: {
    backgroundColor: '#92400E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 24,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
});