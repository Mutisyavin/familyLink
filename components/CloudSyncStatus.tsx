import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { firebaseService, CloudSyncStatus } from '@/utils/firebaseService';
import { getCurrentTree } from '@/utils/storage';

interface CloudSyncStatusProps {
  style?: any;
  showDetails?: boolean;
}

export default function CloudSyncStatusComponent({ 
  style, 
  showDetails = false 
}: CloudSyncStatusProps) {
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>(firebaseService.getSyncStatus());
  const [isManualSyncing, setIsManualSyncing] = useState(false);

  useEffect(() => {
    const unsubscribe = firebaseService.onSyncStatusChange(setSyncStatus);
    return unsubscribe;
  }, []);

  const handleManualSync = async () => {
    if (!syncStatus.isOnline) {
      Alert.alert('Offline', 'Please sign in to sync your family tree to the cloud.');
      return;
    }

    setIsManualSyncing(true);
    try {
      const currentTree = await getCurrentTree();
      if (currentTree) {
        await firebaseService.syncFamilyTreeToCloud(currentTree);
        Alert.alert('Success', 'Family tree synced to cloud successfully!');
      } else {
        Alert.alert('Error', 'No family tree found to sync.');
      }
    } catch (error) {
      console.error('Manual sync error:', error);
      Alert.alert('Sync Error', 'Failed to sync family tree. Please try again.');
    } finally {
      setIsManualSyncing(false);
    }
  };

  const getStatusIcon = () => {
    if (syncStatus.syncInProgress || isManualSyncing) {
      return <ActivityIndicator size="small" color="#D2691E" />;
    }
    
    if (!syncStatus.isOnline) {
      return <Ionicons name="cloud-offline" size={16} color="#EF4444" />;
    }
    
    if (syncStatus.pendingChanges > 0) {
      return <Ionicons name="cloud-upload" size={16} color="#F59E0B" />;
    }
    
    return <Ionicons name="cloud-done" size={16} color="#10B981" />;
  };

  const getStatusText = () => {
    if (syncStatus.syncInProgress || isManualSyncing) {
      return 'Syncing...';
    }
    
    if (!syncStatus.isOnline) {
      return 'Offline';
    }
    
    if (syncStatus.pendingChanges > 0) {
      return `${syncStatus.pendingChanges} pending`;
    }
    
    return 'Synced';
  };

  const getStatusColor = () => {
    if (!syncStatus.isOnline) return '#EF4444';
    if (syncStatus.pendingChanges > 0) return '#F59E0B';
    return '#10B981';
  };

  const formatLastSync = () => {
    if (!syncStatus.lastSync) return 'Never';
    
    const now = new Date();
    const lastSync = syncStatus.lastSync;
    const diffMs = now.getTime() - lastSync.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (!showDetails) {
    // Compact status indicator
    return (
      <TouchableOpacity 
        style={[styles.compactContainer, style]} 
        onPress={handleManualSync}
        disabled={syncStatus.syncInProgress || isManualSyncing}
      >
        {getStatusIcon()}
        <Text style={[styles.compactText, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
      </TouchableOpacity>
    );
  }

  // Detailed status view
  return (
    <View style={[styles.detailedContainer, style]}>
      <View style={styles.statusHeader}>
        <View style={styles.statusInfo}>
          {getStatusIcon()}
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>
        
        <TouchableOpacity
          style={[
            styles.syncButton,
            (syncStatus.syncInProgress || isManualSyncing) && styles.syncButtonDisabled
          ]}
          onPress={handleManualSync}
          disabled={syncStatus.syncInProgress || isManualSyncing || !syncStatus.isOnline}
        >
          {syncStatus.syncInProgress || isManualSyncing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="refresh" size={16} color="#FFFFFF" />
          )}
          <Text style={styles.syncButtonText}>Sync</Text>
        </TouchableOpacity>
      </View>

      {syncStatus.isOnline && (
        <View style={styles.statusDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Last sync:</Text>
            <Text style={styles.detailValue}>{formatLastSync()}</Text>
          </View>
          
          {syncStatus.pendingChanges > 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Pending changes:</Text>
              <Text style={[styles.detailValue, styles.pendingText]}>
                {syncStatus.pendingChanges}
              </Text>
            </View>
          )}
        </View>
      )}

      {!syncStatus.isOnline && (
        <View style={styles.offlineMessage}>
          <Ionicons name="information-circle" size={16} color="#8B4513" />
          <Text style={styles.offlineText}>
            Sign in to sync your family tree across devices
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
  },
  compactText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  detailedContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  syncButton: {
    backgroundColor: '#D2691E',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  syncButtonDisabled: {
    opacity: 0.6,
  },
  syncButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  statusDetails: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  detailValue: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#333333',
  },
  pendingText: {
    color: '#F59E0B',
  },
  offlineMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF8F0',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  offlineText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#8B4513',
    flex: 1,
    lineHeight: 16,
  },
}); 