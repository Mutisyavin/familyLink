import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { User, Calendar, MapPin, Briefcase, Trash2 } from 'lucide-react-native';
import { FamilyMember } from '@/types/FamilyMember';
import { StorageService } from '@/utils/storage';

export default function MembersScreen() {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMembers = async () => {
    try {
      const members = await StorageService.loadFamilyMembers();
      setFamilyMembers(members);
    } catch (error) {
      Alert.alert('Error', 'Failed to load family members');
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMembers();
    }, [])
  );

  const handleDeleteMember = (member: FamilyMember) => {
    Alert.alert(
      'Delete Family Member',
      `Are you sure you want to remove ${member.name} from your family tree? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.deleteFamilyMember(member.id);
              setFamilyMembers(prev => prev.filter(m => m.id !== member.id));
              Alert.alert('Success', `${member.name} has been removed from your family tree.`);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete family member');
            }
          },
        },
      ]
    );
  };

  const renderMemberCard = ({ item }: { item: FamilyMember }) => (
    <View style={styles.memberCard}>
      <View style={styles.memberHeader}>
        <View style={styles.photoContainer}>
          {item.photoUri ? (
            <Image source={{ uri: item.photoUri }} style={styles.memberPhoto} />
          ) : (
            <View style={styles.placeholderPhoto}>
              <User size={32} color="#A16207" />
            </View>
          )}
        </View>
        
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{item.name}</Text>
          {item.dateOfBirth && (
            <View style={styles.infoRow}>
              <Calendar size={14} color="#A16207" />
              <Text style={styles.infoText}>
                {new Date(item.dateOfBirth).toLocaleDateString()}
              </Text>
            </View>
          )}
          {item.birthPlace && (
            <View style={styles.infoRow}>
              <MapPin size={14} color="#A16207" />
              <Text style={styles.infoText}>{item.birthPlace}</Text>
            </View>
          )}
          {item.occupation && (
            <View style={styles.infoRow}>
              <Briefcase size={14} color="#A16207" />
              <Text style={styles.infoText}>{item.occupation}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteMember(item)}
        >
          <Trash2 size={20} color="#DC2626" />
        </TouchableOpacity>
      </View>

      {item.biography && (
        <View style={styles.biographyContainer}>
          <Text style={styles.biographyText} numberOfLines={3}>
            {item.biography}
          </Text>
        </View>
      )}

      {Object.values(item.socialMedia).some(Boolean) && (
        <View style={styles.socialMediaContainer}>
          <Text style={styles.socialMediaTitle}>Social Media:</Text>
          <View style={styles.socialMediaList}>
            {Object.entries(item.socialMedia).map(([platform, handle]) => 
              handle ? (
                <Text key={platform} style={styles.socialMediaItem}>
                  {platform}: {handle}
                </Text>
              ) : null
            )}
          </View>
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading family members...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Family Members</Text>
        <Text style={styles.subtitle}>
          {familyMembers.length} member{familyMembers.length !== 1 ? 's' : ''} in your tree
        </Text>
      </View>

      {familyMembers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <User size={48} color="#A16207" />
          </View>
          <Text style={styles.emptyTitle}>No Family Members Yet</Text>
          <Text style={styles.emptyDescription}>
            Start building your family tree by adding your first family member from the Add tab.
          </Text>
        </View>
      ) : (
        <FlatList
          data={familyMembers}
          renderItem={renderMemberCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  listContainer: {
    padding: 20,
  },
  memberCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  photoContainer: {
    marginRight: 16,
  },
  memberPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  placeholderPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
    fontFamily: 'Inter-SemiBold',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#A16207',
    fontFamily: 'Inter-Regular',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  biographyContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#FEF3C7',
  },
  biographyText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
  },
  socialMediaContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#FEF3C7',
  },
  socialMediaTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#92400E',
    marginBottom: 4,
    fontFamily: 'Inter-Medium',
  },
  socialMediaList: {
    gap: 2,
  },
  socialMediaItem: {
    fontSize: 12,
    color: '#A16207',
    fontFamily: 'Inter-Regular',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#92400E',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Playfair-Bold',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#A16207',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Inter-Regular',
  },
});