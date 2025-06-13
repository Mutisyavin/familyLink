import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import CloudSyncStatus from '@/components/CloudSyncStatus';
import { firebaseService, CollaborationInvite } from '@/utils/firebaseService';
import { getCurrentTree } from '@/utils/storage';

export default function SettingsScreen() {
  const [user, setUser] = useState(firebaseService.getCurrentUser());
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'viewer' | 'editor' | 'admin'>('editor');
  const [pendingInvites, setPendingInvites] = useState<CollaborationInvite[]>([]);
  const [autoSync, setAutoSync] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadPendingInvites();
  }, [user]);

  const loadPendingInvites = async () => {
    if (user?.email) {
      try {
        const invites = await firebaseService.getCollaborationInvites(user.email);
        setPendingInvites(invites);
      } catch (error) {
        console.error('Error loading invites:', error);
      }
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? Your data will remain on this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await firebaseService.signOut();
              setUser(null);
              Alert.alert('Success', 'You have been signed out.');
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) {
      Alert.alert('Error', 'Please enter an email address.');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be signed in to send invites.');
      return;
    }

    setIsLoading(true);
    try {
      const currentTree = await getCurrentTree();
      if (!currentTree) {
        Alert.alert('Error', 'No family tree found to share.');
        return;
      }

      await firebaseService.sendCollaborationInvite(
        currentTree.id,
        currentTree.title,
        inviteEmail.trim(),
        inviteRole
      );

      Alert.alert('Success', `Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
    } catch (error) {
      console.error('Error sending invite:', error);
      Alert.alert('Error', 'Failed to send invitation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteResponse = async (inviteId: string, response: 'accepted' | 'declined') => {
    try {
      await firebaseService.respondToCollaborationInvite(inviteId, response);
      
      Alert.alert(
        'Success',
        response === 'accepted' 
          ? 'You have joined the family tree!' 
          : 'Invitation declined.'
      );
      
      // Reload invites
      await loadPendingInvites();
    } catch (error) {
      console.error('Error responding to invite:', error);
      Alert.alert('Error', 'Failed to respond to invitation. Please try again.');
    }
  };

  const SettingSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    rightElement 
  }: { 
    icon: string; 
    title: string; 
    subtitle?: string; 
    onPress?: () => void;
    rightElement?: React.ReactNode;
  }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress} disabled={!onPress}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon as any} size={20} color="#D2691E" />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement || (onPress && <Ionicons name="chevron-forward" size={16} color="#999999" />)}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        <SettingSection title="Account">
          {user ? (
            <>
              <SettingItem
                icon="person-circle"
                title={user.displayName || 'User'}
                subtitle={user.email || ''}
              />
              <SettingItem
                icon="log-out"
                title="Sign Out"
                onPress={handleSignOut}
              />
            </>
          ) : (
            <SettingItem
              icon="log-in"
              title="Sign In"
              subtitle="Sync your family tree across devices"
              onPress={() => router.push('/auth')}
            />
          )}
        </SettingSection>

        {/* Cloud Sync Section */}
        <SettingSection title="Cloud Sync">
          <CloudSyncStatus showDetails={true} style={styles.syncStatus} />
          
          <SettingItem
            icon="sync"
            title="Auto Sync"
            subtitle="Automatically sync changes to the cloud"
            rightElement={
              <Switch
                value={autoSync}
                onValueChange={setAutoSync}
                trackColor={{ false: '#E0E0E0', true: '#D2691E' }}
                thumbColor="#FFFFFF"
              />
            }
          />
        </SettingSection>

        {/* Collaboration Section */}
        {user && (
          <SettingSection title="Collaboration">
            <View style={styles.inviteContainer}>
              <Text style={styles.inviteTitle}>Invite Family Members</Text>
              <Text style={styles.inviteSubtitle}>
                Share your family tree with relatives so they can contribute photos and stories.
              </Text>
              
              <View style={styles.inviteForm}>
                <TextInput
                  style={styles.inviteInput}
                  placeholder="Enter email address"
                  value={inviteEmail}
                  onChangeText={setInviteEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                
                <View style={styles.roleSelector}>
                  <Text style={styles.roleLabel}>Role:</Text>
                  <View style={styles.roleButtons}>
                    {(['viewer', 'editor', 'admin'] as const).map((role) => (
                      <TouchableOpacity
                        key={role}
                        style={[
                          styles.roleButton,
                          inviteRole === role && styles.selectedRoleButton,
                        ]}
                        onPress={() => setInviteRole(role)}
                      >
                        <Text
                          style={[
                            styles.roleButtonText,
                            inviteRole === role && styles.selectedRoleButtonText,
                          ]}
                        >
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                <TouchableOpacity
                  style={[styles.inviteButton, isLoading && styles.inviteButtonDisabled]}
                  onPress={handleSendInvite}
                  disabled={isLoading}
                >
                  <Ionicons name="mail" size={16} color="#FFFFFF" />
                  <Text style={styles.inviteButtonText}>
                    {isLoading ? 'Sending...' : 'Send Invitation'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Pending Invites */}
            {pendingInvites.length > 0 && (
              <View style={styles.pendingInvites}>
                <Text style={styles.pendingTitle}>Pending Invitations</Text>
                {pendingInvites.map((invite) => (
                  <View key={invite.id} style={styles.inviteCard}>
                    <View style={styles.inviteInfo}>
                      <Text style={styles.inviteTreeName}>{invite.treeName}</Text>
                      <Text style={styles.inviteFrom}>
                        From: {invite.inviterName} ({invite.inviterEmail})
                      </Text>
                      <Text style={styles.inviteRole}>Role: {invite.role}</Text>
                    </View>
                    <View style={styles.inviteActions}>
                      <TouchableOpacity
                        style={styles.acceptButton}
                        onPress={() => handleInviteResponse(invite.id, 'accepted')}
                      >
                        <Text style={styles.acceptButtonText}>Accept</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.declineButton}
                        onPress={() => handleInviteResponse(invite.id, 'declined')}
                      >
                        <Text style={styles.declineButtonText}>Decline</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </SettingSection>
        )}

        {/* App Info Section */}
        <SettingSection title="About">
          <SettingItem
            icon="information-circle"
            title="Version"
            subtitle="1.0.0 (Phase 2)"
          />
          <SettingItem
            icon="help-circle"
            title="Help & Support"
            onPress={() => Alert.alert('Help', 'Contact support at help@legacylink.app')}
          />
          <SettingItem
            icon="document-text"
            title="Privacy Policy"
            onPress={() => Alert.alert('Privacy', 'Privacy policy coming soon')}
          />
        </SettingSection>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#92400E',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#333333',
  },
  settingSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginTop: 2,
  },
  syncStatus: {
    marginBottom: 8,
  },
  inviteContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    marginBottom: 8,
  },
  inviteTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333333',
    marginBottom: 4,
  },
  inviteSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginBottom: 16,
    lineHeight: 20,
  },
  inviteForm: {
    gap: 12,
  },
  inviteInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    backgroundColor: '#FAFAFA',
  },
  roleSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  roleLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333333',
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
  },
  selectedRoleButton: {
    borderColor: '#D2691E',
    backgroundColor: '#FFF8F0',
  },
  roleButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666666',
  },
  selectedRoleButtonText: {
    color: '#D2691E',
  },
  inviteButton: {
    backgroundColor: '#D2691E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  inviteButtonDisabled: {
    opacity: 0.6,
  },
  inviteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  pendingInvites: {
    marginTop: 16,
  },
  pendingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333333',
    marginBottom: 12,
  },
  inviteCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    marginBottom: 8,
  },
  inviteInfo: {
    marginBottom: 12,
  },
  inviteTreeName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333333',
    marginBottom: 4,
  },
  inviteFrom: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginBottom: 2,
  },
  inviteRole: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#D2691E',
  },
  inviteActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#10B981',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  declineButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  declineButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
});