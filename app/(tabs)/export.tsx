import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ExportShare from '@/components/ExportShare';
import { FamilyMember } from '@/types/FamilyMember';

const { width } = Dimensions.get('window');

export default function ExportScreen() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const treeViewRef = useRef(null);

  useEffect(() => {
    loadFamilyMembers();
  }, []);

  const loadFamilyMembers = async () => {
    try {
      const storedMembers = await AsyncStorage.getItem('familyMembers');
      if (storedMembers) {
        setMembers(JSON.parse(storedMembers));
      }
    } catch (error) {
      console.error('Error loading family members:', error);
      Alert.alert('Error', 'Failed to load family data');
    } finally {
      setIsLoading(false);
    }
  };

  const exportOptions = [
    {
      id: 'pdf',
      title: 'PDF Family Tree',
      description: 'Generate a professional PDF document of your family tree',
      icon: 'document-text',
      color: '#DC2626',
      features: ['Multiple layouts', 'Custom paper sizes', 'Include photos & stories'],
    },
    {
      id: 'image',
      title: 'Family Tree Image',
      description: 'Create a high-quality image of your family tree',
      icon: 'image',
      color: '#059669',
      features: ['High resolution', 'Perfect for printing', 'Social media ready'],
    },
    {
      id: 'backup',
      title: 'Data Backup',
      description: 'Export complete family data for backup or transfer',
      icon: 'archive',
      color: '#7C3AED',
      features: ['Complete data export', 'JSON format', 'Easy to restore'],
    },
  ];

  const quickActions = [
    {
      id: 'share-link',
      title: 'Share Link',
      description: 'Generate a secure link to share your family tree',
      icon: 'link',
      color: '#2563EB',
    },
    {
      id: 'qr-code',
      title: 'QR Code',
      description: 'Create a QR code for easy mobile sharing',
      icon: 'qr-code',
      color: '#DC2626',
    },
    {
      id: 'collaborate',
      title: 'Invite Family',
      description: 'Invite family members to collaborate',
      icon: 'people',
      color: '#059669',
    },
  ];

  const handleQuickAction = (actionId: string) => {
    Alert.alert(
      'Coming Soon',
      `${actionId === 'share-link' ? 'Link sharing' : actionId === 'qr-code' ? 'QR code generation' : 'Family collaboration'} will be available in a future update.`,
      [{ text: 'OK' }]
    );
  };

  const renderExportOption = (option: typeof exportOptions[0]) => (
    <TouchableOpacity
      key={option.id}
      style={styles.exportCard}
      onPress={() => setShowExportModal(true)}
    >
      <View style={[styles.exportIcon, { backgroundColor: option.color }]}>
        <Ionicons name={option.icon as any} size={28} color="#FFFFFF" />
      </View>
      
      <View style={styles.exportContent}>
        <Text style={styles.exportTitle}>{option.title}</Text>
        <Text style={styles.exportDescription}>{option.description}</Text>
        
        <View style={styles.featureList}>
          {option.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={14} color="#10B981" />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      </View>
      
      <Ionicons name="chevron-forward" size={20} color="#999999" />
    </TouchableOpacity>
  );

  const renderQuickAction = (action: typeof quickActions[0]) => (
    <TouchableOpacity
      key={action.id}
      style={styles.quickActionCard}
      onPress={() => handleQuickAction(action.id)}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
        <Ionicons name={action.icon as any} size={20} color="#FFFFFF" />
      </View>
      <Text style={styles.quickActionTitle}>{action.title}</Text>
      <Text style={styles.quickActionDescription}>{action.description}</Text>
    </TouchableOpacity>
  );

  const renderStats = () => {
    const stats = [
      {
        label: 'Total Members',
        value: members.length,
        icon: 'people',
        color: '#D2691E',
      },
      {
        label: 'With Photos',
        value: members.filter(m => m.photoUri || m.mediaItems?.length).length,
        icon: 'camera',
        color: '#059669',
      },
      {
        label: 'Voice Stories',
        value: members.filter(m => m.voiceNoteUri).length,
        icon: 'mic',
        color: '#7C3AED',
      },
      {
        label: 'Living Members',
        value: members.filter(m => !m.dateOfDeath).length,
        icon: 'heart',
        color: '#DC2626',
      },
    ];

    return (
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Family Tree Overview</Text>
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: stat.color }]}>
                <Ionicons name={stat.icon as any} size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading family data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Export & Share</Text>
          <Text style={styles.headerSubtitle}>
            Share your family stories with the world
          </Text>
        </View>

        {/* Stats Overview */}
        {renderStats()}

        {/* Export Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Export Options</Text>
          <Text style={styles.sectionDescription}>
            Choose how you'd like to export your family tree
          </Text>
          
          <View style={styles.exportGrid}>
            {exportOptions.map(renderExportOption)}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Share</Text>
          <Text style={styles.sectionDescription}>
            Fast ways to share your family tree
          </Text>
          
          <View style={styles.quickActionsGrid}>
            {quickActions.map(renderQuickAction)}
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.section}>
          <View style={styles.tipsCard}>
            <Ionicons name="bulb" size={24} color="#F59E0B" />
            <Text style={styles.tipsTitle}>Export Tips</Text>
            <Text style={styles.tipsText}>
              • PDF exports work best with complete family information{'\n'}
              • Include photos for more engaging family documents{'\n'}
              • Create regular backups to protect your family data{'\n'}
              • Share links expire after 30 days for security
            </Text>
          </View>
        </View>

        {/* Call to Action */}
        {members.length === 0 && (
          <View style={styles.section}>
            <View style={styles.emptyStateCard}>
              <Ionicons name="family" size={48} color="#D2691E" />
              <Text style={styles.emptyStateTitle}>Start Building Your Family Tree</Text>
              <Text style={styles.emptyStateText}>
                Add family members to begin creating and sharing your family story.
              </Text>
              <TouchableOpacity style={styles.emptyStateButton}>
                <Text style={styles.emptyStateButtonText}>Add First Member</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Export Modal */}
      <ExportShare
        members={members}
        visible={showExportModal}
        onClose={() => setShowExportModal(false)}
        treeViewRef={treeViewRef}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBEB',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#666666',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Playfair-Bold',
    color: '#8B4513',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  section: {
    padding: 20,
    paddingTop: 10,
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
  statsContainer: {
    padding: 20,
    paddingTop: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 60) / 2,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666666',
    textAlign: 'center',
  },
  exportGrid: {
    gap: 16,
  },
  exportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  exportIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  exportContent: {
    flex: 1,
  },
  exportTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333333',
    marginBottom: 4,
  },
  exportDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginBottom: 8,
  },
  featureList: {
    gap: 4,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#10B981',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    minWidth: (width - 60) / 2,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333333',
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    textAlign: 'center',
  },
  tipsCard: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  tipsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#92400E',
    marginTop: 8,
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#92400E',
    lineHeight: 20,
  },
  emptyStateCard: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyStateButton: {
    backgroundColor: '#D2691E',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
}); 