import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import RelationshipMapper from '@/components/RelationshipMapper';
import { FamilyMember } from '@/types/FamilyMember';
import { getCurrentTree, storeFamilyTree } from '@/utils/storage';

export default function RelationshipsScreen() {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [focusMember, setFocusMember] = useState<FamilyMember | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  const loadFamilyData = async () => {
    try {
      const currentTree = await getCurrentTree();
      if (currentTree) {
        setFamilyMembers(currentTree.members);
        if (currentTree.members.length > 0 && !focusMember) {
          setFocusMember(currentTree.members[0]);
        }
      }
    } catch (error) {
      console.error('Error loading family data:', error);
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

  const handleRelationshipUpdate = async (memberId: string, relationships: any) => {
    try {
      const currentTree = await getCurrentTree();
      if (!currentTree) return;

      const updatedMembers = currentTree.members.map(member =>
        member.id === memberId
          ? { ...member, relationships, updatedAt: new Date().toISOString() }
          : member
      );

      const updatedTree = {
        ...currentTree,
        members: updatedMembers,
        updatedAt: new Date().toISOString(),
      };

      await storeFamilyTree(updatedTree);
      setFamilyMembers(updatedMembers);
      
      Alert.alert('Success', 'Relationship updated successfully!');
    } catch (error) {
      console.error('Error updating relationship:', error);
      Alert.alert('Error', 'Failed to update relationship. Please try again.');
    }
  };

  const handleFocusChange = (member: FamilyMember) => {
    setFocusMember(member);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading relationships...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (familyMembers.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Family Relationships</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="people" size={64} color="#D2691E" />
          <Text style={styles.emptyTitle}>No Family Members Yet</Text>
          <Text style={styles.emptyDescription}>
            Add family members to start mapping relationships and connections.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Family Relationships</Text>
        <Text style={styles.headerSubtitle}>
          Visualize and manage family connections
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Focus Member Selector */}
        <View style={styles.focusSelector}>
          <Text style={styles.focusLabel}>Focus on:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.memberButtons}>
              {familyMembers.map((member) => (
                <TouchableOpacity
                  key={member.id}
                  style={[
                    styles.memberButton,
                    focusMember?.id === member.id && styles.selectedMemberButton,
                  ]}
                  onPress={() => handleFocusChange(member)}
                >
                  <Text
                    style={[
                      styles.memberButtonText,
                      focusMember?.id === member.id && styles.selectedMemberButtonText,
                    ]}
                  >
                    {member.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Relationship Mapper */}
        <RelationshipMapper
          members={familyMembers}
          focusMember={focusMember}
          onRelationshipUpdate={handleRelationshipUpdate}
          style={styles.mapper}
        />

        {/* Relationship Statistics */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Family Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{familyMembers.length}</Text>
              <Text style={styles.statLabel}>Total Members</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {familyMembers.reduce((count, member) => 
                  count + member.relationships.children.length, 0
                )}
              </Text>
              <Text style={styles.statLabel}>Connections</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {new Set(familyMembers.flatMap(member => 
                  member.relationships.parents.map(parentId => {
                    const parent = familyMembers.find(m => m.id === parentId);
                    return parent ? Math.floor((new Date().getFullYear() - new Date(parent.dateOfBirth || '1900').getFullYear()) / 25) : 0;
                  })
                )).size}
              </Text>
              <Text style={styles.statLabel}>Generations</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {familyMembers.filter(member => 
                  member.relationships.spouses.length > 0
                ).length}
              </Text>
              <Text style={styles.statLabel}>Married</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.actionsTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => Alert.alert('Coming Soon', 'Export relationship chart feature coming soon!')}
            >
              <Ionicons name="download" size={20} color="#D2691E" />
              <Text style={styles.actionButtonText}>Export Chart</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => Alert.alert('Coming Soon', 'Relationship suggestions feature coming soon!')}
            >
              <Ionicons name="bulb" size={20} color="#D2691E" />
              <Text style={styles.actionButtonText}>Suggestions</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => Alert.alert('Coming Soon', 'Relationship validation feature coming soon!')}
            >
              <Ionicons name="checkmark-circle" size={20} color="#D2691E" />
              <Text style={styles.actionButtonText}>Validate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Playfair-Bold',
    color: '#92400E',
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#A16207',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#A16207',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: 'Playfair-Bold',
    color: '#92400E',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#A16207',
    textAlign: 'center',
    lineHeight: 22,
  },
  focusSelector: {
    marginTop: 20,
    marginBottom: 16,
  },
  focusLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#333333',
    marginBottom: 8,
  },
  memberButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  memberButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  selectedMemberButton: {
    borderColor: '#D2691E',
    backgroundColor: '#FFF8F0',
  },
  memberButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666666',
  },
  selectedMemberButtonText: {
    color: '#D2691E',
  },
  mapper: {
    marginBottom: 24,
    minHeight: 400,
  },
  statsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  statsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#D2691E',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    textAlign: 'center',
  },
  actionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  actionsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333333',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D2691E',
    backgroundColor: '#FFFFFF',
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#D2691E',
  },
}); 