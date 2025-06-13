import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FamilyMember } from '@/types/FamilyMember';
import { exportService, ExportOptions, ShareOptions } from '@/utils/exportService';

interface ExportShareProps {
  members: FamilyMember[];
  visible: boolean;
  onClose: () => void;
  treeViewRef?: any;
}

export default function ExportShare({
  members,
  visible,
  onClose,
  treeViewRef,
}: ExportShareProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    includePhotos: true,
    includeVoiceNotes: false,
    includeMediaGallery: false,
    layout: 'tree',
    orientation: 'portrait',
    paperSize: 'A4',
  });

  const [activeTab, setActiveTab] = useState<'export' | 'share' | 'backup'>('export');

  const exportFormats = [
    { id: 'pdf', label: 'PDF Document', icon: 'document-text', description: 'Professional family tree document' },
    { id: 'image', label: 'Image', icon: 'image', description: 'High-quality family tree image' },
    { id: 'json', label: 'Data Backup', icon: 'archive', description: 'Complete family data backup' },
  ];

  const layouts = [
    { id: 'tree', label: 'Family Tree', icon: 'git-branch', description: 'Traditional tree structure' },
    { id: 'list', label: 'Member List', icon: 'list', description: 'Alphabetical member listing' },
    { id: 'timeline', label: 'Timeline', icon: 'time', description: 'Chronological birth order' },
  ];

  const paperSizes = [
    { id: 'A4', label: 'A4', description: '210 × 297 mm' },
    { id: 'Letter', label: 'Letter', description: '8.5 × 11 in' },
    { id: 'Legal', label: 'Legal', description: '8.5 × 14 in' },
  ];

  const handleExport = async () => {
    if (members.length === 0) {
      Alert.alert('No Data', 'Please add family members before exporting.');
      return;
    }

    setIsExporting(true);
    
    try {
      let fileUri: string;
      let shareTitle: string;

      switch (exportOptions.format) {
        case 'pdf':
          fileUri = await exportService.generateFamilyTreePDF(members, exportOptions);
          shareTitle = 'Family Tree PDF';
          break;
        case 'image':
          if (treeViewRef) {
            fileUri = await exportService.captureTreeAsImage(treeViewRef);
            shareTitle = 'Family Tree Image';
          } else {
            throw new Error('Tree view not available for image capture');
          }
          break;
        case 'json':
          fileUri = await exportService.exportFamilyData(members, exportOptions);
          shareTitle = 'Family Tree Backup';
          break;
        default:
          throw new Error('Invalid export format');
      }

      // Share the exported file
      await exportService.shareFile(fileUri, {
        title: shareTitle,
        message: `Family tree exported from LegacyLink`,
      });

      Alert.alert(
        'Export Successful',
        `Your family tree has been exported as ${exportOptions.format.toUpperCase()} and is ready to share!`,
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert(
        'Export Failed',
        error instanceof Error ? error.message : 'An unexpected error occurred during export.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleQuickShare = async (type: 'link' | 'qr' | 'social') => {
    Alert.alert(
      'Coming Soon',
      `${type === 'link' ? 'Link sharing' : type === 'qr' ? 'QR code generation' : 'Social media sharing'} will be available in a future update.`,
      [{ text: 'OK' }]
    );
  };

  const handleBackupRestore = async (action: 'backup' | 'restore') => {
    if (action === 'backup') {
      setIsExporting(true);
      try {
        const fileUri = await exportService.exportFamilyData(members, {
          ...exportOptions,
          format: 'json',
        });
        
        await exportService.shareFile(fileUri, {
          title: 'Family Tree Backup',
          message: 'Complete family tree data backup',
        });
        
        Alert.alert(
          'Backup Created',
          'Your family tree backup has been created and is ready to save or share.',
          [{ text: 'OK' }]
        );
      } catch (error) {
        Alert.alert('Backup Failed', 'Unable to create backup. Please try again.');
      } finally {
        setIsExporting(false);
      }
    } else {
      Alert.alert(
        'Restore Data',
        'Data restoration from backup files will be available in a future update.',
        [{ text: 'OK' }]
      );
    }
  };

  const renderExportTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Export Format Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Export Format</Text>
        <View style={styles.optionGrid}>
          {exportFormats.map(format => (
            <TouchableOpacity
              key={format.id}
              style={[
                styles.optionCard,
                exportOptions.format === format.id && styles.selectedOptionCard,
              ]}
              onPress={() => setExportOptions(prev => ({ ...prev, format: format.id as any }))}
            >
              <Ionicons 
                name={format.icon as any} 
                size={24} 
                color={exportOptions.format === format.id ? '#FFFFFF' : '#D2691E'} 
              />
              <Text style={[
                styles.optionLabel,
                exportOptions.format === format.id && styles.selectedOptionLabel,
              ]}>
                {format.label}
              </Text>
              <Text style={[
                styles.optionDescription,
                exportOptions.format === format.id && styles.selectedOptionDescription,
              ]}>
                {format.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Layout Selection (for PDF/Image) */}
      {(exportOptions.format === 'pdf' || exportOptions.format === 'image') && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Layout Style</Text>
          <View style={styles.optionGrid}>
            {layouts.map(layout => (
              <TouchableOpacity
                key={layout.id}
                style={[
                  styles.optionCard,
                  exportOptions.layout === layout.id && styles.selectedOptionCard,
                ]}
                onPress={() => setExportOptions(prev => ({ ...prev, layout: layout.id as any }))}
              >
                <Ionicons 
                  name={layout.icon as any} 
                  size={24} 
                  color={exportOptions.layout === layout.id ? '#FFFFFF' : '#D2691E'} 
                />
                <Text style={[
                  styles.optionLabel,
                  exportOptions.layout === layout.id && styles.selectedOptionLabel,
                ]}>
                  {layout.label}
                </Text>
                <Text style={[
                  styles.optionDescription,
                  exportOptions.layout === layout.id && styles.selectedOptionDescription,
                ]}>
                  {layout.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* PDF Options */}
      {exportOptions.format === 'pdf' && (
        <>
          {/* Paper Size */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Paper Size</Text>
            <View style={styles.segmentedControl}>
              {paperSizes.map(size => (
                <TouchableOpacity
                  key={size.id}
                  style={[
                    styles.segmentButton,
                    exportOptions.paperSize === size.id && styles.selectedSegmentButton,
                  ]}
                  onPress={() => setExportOptions(prev => ({ ...prev, paperSize: size.id as any }))}
                >
                  <Text style={[
                    styles.segmentText,
                    exportOptions.paperSize === size.id && styles.selectedSegmentText,
                  ]}>
                    {size.label}
                  </Text>
                  <Text style={[
                    styles.segmentDescription,
                    exportOptions.paperSize === size.id && styles.selectedSegmentDescription,
                  ]}>
                    {size.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Orientation */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Orientation</Text>
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  exportOptions.orientation === 'portrait' && styles.selectedSegmentButton,
                ]}
                onPress={() => setExportOptions(prev => ({ ...prev, orientation: 'portrait' }))}
              >
                <Ionicons 
                  name="phone-portrait" 
                  size={20} 
                  color={exportOptions.orientation === 'portrait' ? '#FFFFFF' : '#D2691E'} 
                />
                <Text style={[
                  styles.segmentText,
                  exportOptions.orientation === 'portrait' && styles.selectedSegmentText,
                ]}>
                  Portrait
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  exportOptions.orientation === 'landscape' && styles.selectedSegmentButton,
                ]}
                onPress={() => setExportOptions(prev => ({ ...prev, orientation: 'landscape' }))}
              >
                <Ionicons 
                  name="phone-landscape" 
                  size={20} 
                  color={exportOptions.orientation === 'landscape' ? '#FFFFFF' : '#D2691E'} 
                />
                <Text style={[
                  styles.segmentText,
                  exportOptions.orientation === 'landscape' && styles.selectedSegmentText,
                ]}>
                  Landscape
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}

      {/* Include Options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Include in Export</Text>
        <View style={styles.toggleOptions}>
          <View style={styles.toggleOption}>
            <View style={styles.toggleInfo}>
              <Ionicons name="camera" size={20} color="#D2691E" />
              <Text style={styles.toggleLabel}>Photos</Text>
            </View>
            <Switch
              value={exportOptions.includePhotos}
              onValueChange={(value) => setExportOptions(prev => ({ ...prev, includePhotos: value }))}
              trackColor={{ false: '#E0E0E0', true: '#D2691E' }}
              thumbColor={exportOptions.includePhotos ? '#FFFFFF' : '#F4F3F4'}
            />
          </View>
          
          <View style={styles.toggleOption}>
            <View style={styles.toggleInfo}>
              <Ionicons name="mic" size={20} color="#D2691E" />
              <Text style={styles.toggleLabel}>Voice Notes</Text>
            </View>
            <Switch
              value={exportOptions.includeVoiceNotes}
              onValueChange={(value) => setExportOptions(prev => ({ ...prev, includeVoiceNotes: value }))}
              trackColor={{ false: '#E0E0E0', true: '#D2691E' }}
              thumbColor={exportOptions.includeVoiceNotes ? '#FFFFFF' : '#F4F3F4'}
            />
          </View>
          
          <View style={styles.toggleOption}>
            <View style={styles.toggleInfo}>
              <Ionicons name="images" size={20} color="#D2691E" />
              <Text style={styles.toggleLabel}>Media Gallery</Text>
            </View>
            <Switch
              value={exportOptions.includeMediaGallery}
              onValueChange={(value) => setExportOptions(prev => ({ ...prev, includeMediaGallery: value }))}
              trackColor={{ false: '#E0E0E0', true: '#D2691E' }}
              thumbColor={exportOptions.includeMediaGallery ? '#FFFFFF' : '#F4F3F4'}
            />
          </View>
        </View>
      </View>

      {/* Export Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Export Preview</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{members.length}</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {members.filter(m => m.photoUri || m.mediaItems?.length).length}
            </Text>
            <Text style={styles.statLabel}>With Photos</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {members.filter(m => m.voiceNoteUri).length}
            </Text>
            <Text style={styles.statLabel}>Voice Stories</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderShareTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Share Options</Text>
        
        <TouchableOpacity 
          style={styles.shareOption}
          onPress={() => handleQuickShare('link')}
        >
          <View style={styles.shareIcon}>
            <Ionicons name="link" size={24} color="#D2691E" />
          </View>
          <View style={styles.shareInfo}>
            <Text style={styles.shareTitle}>Share Link</Text>
            <Text style={styles.shareDescription}>Generate a secure link to share your family tree</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999999" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.shareOption}
          onPress={() => handleQuickShare('qr')}
        >
          <View style={styles.shareIcon}>
            <Ionicons name="qr-code" size={24} color="#D2691E" />
          </View>
          <View style={styles.shareInfo}>
            <Text style={styles.shareTitle}>QR Code</Text>
            <Text style={styles.shareDescription}>Create a QR code for easy mobile sharing</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999999" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.shareOption}
          onPress={() => handleQuickShare('social')}
        >
          <View style={styles.shareIcon}>
            <Ionicons name="share-social" size={24} color="#D2691E" />
          </View>
          <View style={styles.shareInfo}>
            <Text style={styles.shareTitle}>Social Media</Text>
            <Text style={styles.shareDescription}>Share on Facebook, Instagram, or Twitter</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999999" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Collaboration</Text>
        
        <View style={styles.infoCard}>
          <Ionicons name="people" size={32} color="#D2691E" />
          <Text style={styles.infoTitle}>Invite Family Members</Text>
          <Text style={styles.infoDescription}>
            Collaborate with family members to build your tree together. 
            Send invitations and manage permissions.
          </Text>
          <TouchableOpacity style={styles.infoButton}>
            <Text style={styles.infoButtonText}>Coming Soon</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderBackupTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        
        <TouchableOpacity 
          style={styles.backupOption}
          onPress={() => handleBackupRestore('backup')}
        >
          <View style={styles.backupIcon}>
            <Ionicons name="cloud-upload" size={24} color="#10B981" />
          </View>
          <View style={styles.backupInfo}>
            <Text style={styles.backupTitle}>Create Backup</Text>
            <Text style={styles.backupDescription}>
              Export complete family data as JSON backup file
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999999" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.backupOption}
          onPress={() => handleBackupRestore('restore')}
        >
          <View style={styles.backupIcon}>
            <Ionicons name="cloud-download" size={24} color="#3B82F6" />
          </View>
          <View style={styles.backupInfo}>
            <Text style={styles.backupTitle}>Restore from Backup</Text>
            <Text style={styles.backupDescription}>
              Import family data from backup file
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999999" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Backup Information</Text>
        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark" size={32} color="#10B981" />
          <Text style={styles.infoTitle}>Secure & Private</Text>
          <Text style={styles.infoDescription}>
            Your family data is stored locally on your device. Backups are created 
            in standard JSON format for maximum compatibility and security.
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Export & Share</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666666" />
            </TouchableOpacity>
          </View>

          {/* Tab Navigation */}
          <View style={styles.tabNavigation}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'export' && styles.activeTabButton]}
              onPress={() => setActiveTab('export')}
            >
              <Ionicons 
                name="download" 
                size={16} 
                color={activeTab === 'export' ? '#FFFFFF' : '#D2691E'} 
              />
              <Text style={[
                styles.tabButtonText,
                activeTab === 'export' && styles.activeTabButtonText,
              ]}>
                Export
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'share' && styles.activeTabButton]}
              onPress={() => setActiveTab('share')}
            >
              <Ionicons 
                name="share" 
                size={16} 
                color={activeTab === 'share' ? '#FFFFFF' : '#D2691E'} 
              />
              <Text style={[
                styles.tabButtonText,
                activeTab === 'share' && styles.activeTabButtonText,
              ]}>
                Share
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'backup' && styles.activeTabButton]}
              onPress={() => setActiveTab('backup')}
            >
              <Ionicons 
                name="archive" 
                size={16} 
                color={activeTab === 'backup' ? '#FFFFFF' : '#D2691E'} 
              />
              <Text style={[
                styles.tabButtonText,
                activeTab === 'backup' && styles.activeTabButtonText,
              ]}>
                Backup
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          <View style={styles.content}>
            {activeTab === 'export' && renderExportTab()}
            {activeTab === 'share' && renderShareTab()}
            {activeTab === 'backup' && renderBackupTab()}
          </View>

          {/* Action Button */}
          {activeTab === 'export' && (
            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={[styles.exportButton, isExporting && styles.exportButtonDisabled]}
                onPress={handleExport}
                disabled={isExporting}
              >
                {isExporting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Ionicons name="download" size={20} color="#FFFFFF" />
                )}
                <Text style={styles.exportButtonText}>
                  {isExporting ? 'Exporting...' : `Export ${exportOptions.format.toUpperCase()}`}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#333333',
  },
  closeButton: {
    padding: 4,
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    margin: 20,
    borderRadius: 8,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 6,
  },
  activeTabButton: {
    backgroundColor: '#D2691E',
  },
  tabButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#D2691E',
  },
  activeTabButtonText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333333',
    marginBottom: 12,
  },
  optionGrid: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  selectedOptionCard: {
    borderColor: '#D2691E',
    backgroundColor: '#D2691E',
  },
  optionLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333333',
    marginTop: 8,
    textAlign: 'center',
  },
  selectedOptionLabel: {
    color: '#FFFFFF',
  },
  optionDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginTop: 4,
    textAlign: 'center',
  },
  selectedOptionDescription: {
    color: '#FFFFFF',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  selectedSegmentButton: {
    backgroundColor: '#D2691E',
  },
  segmentText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#D2691E',
  },
  selectedSegmentText: {
    color: '#FFFFFF',
  },
  segmentDescription: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#999999',
    marginTop: 2,
  },
  selectedSegmentDescription: {
    color: '#FFFFFF',
  },
  toggleOptions: {
    gap: 16,
  },
  toggleOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderRadius: 8,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333333',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#D2691E',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666666',
    marginTop: 4,
  },
  shareOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  shareIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  shareInfo: {
    flex: 1,
  },
  shareTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333333',
    marginBottom: 4,
  },
  shareDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  infoCard: {
    backgroundColor: '#F9F9F9',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    textAlign: 'center',
  },
  infoTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333333',
    marginTop: 12,
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  infoButton: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  infoButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666666',
  },
  backupOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  backupIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  backupInfo: {
    flex: 1,
  },
  backupTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333333',
    marginBottom: 4,
  },
  backupDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  actionContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D2691E',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  exportButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  exportButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});