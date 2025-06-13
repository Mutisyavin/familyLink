import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Video, ResizeMode } from 'expo-av';

interface MediaItem {
  id: string;
  type: 'photo' | 'video' | 'document';
  uri: string;
  name: string;
  size?: number;
  mimeType?: string;
  thumbnail?: string;
  createdAt: string;
  description?: string;
}

interface MediaGalleryProps {
  memberId: string;
  mediaItems: MediaItem[];
  onMediaUpdate: (mediaItems: MediaItem[]) => void;
  style?: any;
  maxItems?: number;
  allowedTypes?: ('photo' | 'video' | 'document')[];
}

const { width: screenWidth } = Dimensions.get('window');
const ITEM_SIZE = (screenWidth - 60) / 3; // 3 items per row with padding

export default function MediaGallery({
  memberId,
  mediaItems,
  onMediaUpdate,
  style,
  maxItems = 20,
  allowedTypes = ['photo', 'video', 'document'],
}: MediaGalleryProps) {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Camera and photo library permissions are needed to add media.'
      );
    }
  };

  const addPhoto = async (fromCamera: boolean = false) => {
    try {
      setIsUploading(true);
      
      const result = fromCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const newMedia: MediaItem = {
          id: Date.now().toString(),
          type: 'photo',
          uri: asset.uri,
          name: `Photo_${Date.now()}.jpg`,
          size: asset.fileSize,
          mimeType: 'image/jpeg',
          createdAt: new Date().toISOString(),
        };

        const updatedMedia = [...mediaItems, newMedia];
        onMediaUpdate(updatedMedia);
        setShowAddMenu(false);
      }
    } catch (error) {
      console.error('Error adding photo:', error);
      Alert.alert('Error', 'Failed to add photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const addVideo = async () => {
    try {
      setIsUploading(true);
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const newMedia: MediaItem = {
          id: Date.now().toString(),
          type: 'video',
          uri: asset.uri,
          name: `Video_${Date.now()}.mp4`,
          size: asset.fileSize,
          mimeType: 'video/mp4',
          thumbnail: asset.uri, // For now, use the same URI
          createdAt: new Date().toISOString(),
        };

        const updatedMedia = [...mediaItems, newMedia];
        onMediaUpdate(updatedMedia);
        setShowAddMenu(false);
      }
    } catch (error) {
      console.error('Error adding video:', error);
      Alert.alert('Error', 'Failed to add video. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const addDocument = async () => {
    try {
      setIsUploading(true);
      
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const newMedia: MediaItem = {
          id: Date.now().toString(),
          type: 'document',
          uri: asset.uri,
          name: asset.name,
          size: asset.size,
          mimeType: asset.mimeType || 'application/octet-stream',
          createdAt: new Date().toISOString(),
        };

        const updatedMedia = [...mediaItems, newMedia];
        onMediaUpdate(updatedMedia);
        setShowAddMenu(false);
      }
    } catch (error) {
      console.error('Error adding document:', error);
      Alert.alert('Error', 'Failed to add document. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeMedia = (mediaId: string) => {
    Alert.alert(
      'Remove Media',
      'Are you sure you want to remove this media item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const updatedMedia = mediaItems.filter(item => item.id !== mediaId);
            onMediaUpdate(updatedMedia);
            setSelectedMedia(null);
          },
        },
      ]
    );
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getMediaIcon = (type: string, mimeType?: string) => {
    switch (type) {
      case 'photo':
        return 'image';
      case 'video':
        return 'videocam';
      case 'document':
        if (mimeType?.includes('pdf')) return 'document-text';
        if (mimeType?.includes('word')) return 'document';
        return 'document-outline';
      default:
        return 'attach';
    }
  };

  const renderMediaItem = (item: MediaItem) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.mediaItem}
        onPress={() => setSelectedMedia(item)}
      >
        {item.type === 'photo' ? (
          <Image source={{ uri: item.uri }} style={styles.mediaImage} />
        ) : item.type === 'video' ? (
          <View style={styles.videoContainer}>
            <Image 
              source={{ uri: item.thumbnail || item.uri }} 
              style={styles.mediaImage} 
            />
            <View style={styles.videoOverlay}>
              <Ionicons name="play-circle" size={32} color="#FFFFFF" />
            </View>
          </View>
        ) : (
          <View style={styles.documentContainer}>
            <Ionicons 
              name={getMediaIcon(item.type, item.mimeType) as any} 
              size={32} 
              color="#D2691E" 
            />
            <Text style={styles.documentName} numberOfLines={2}>
              {item.name}
            </Text>
          </View>
        )}
        
        <View style={styles.mediaInfo}>
          <Text style={styles.mediaName} numberOfLines={1}>
            {item.name}
          </Text>
          {item.size && (
            <Text style={styles.mediaSize}>
              {formatFileSize(item.size)}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderAddButton = () => {
    if (mediaItems.length >= maxItems) return null;

    return (
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowAddMenu(true)}
        disabled={isUploading}
      >
        {isUploading ? (
          <ActivityIndicator color="#D2691E" />
        ) : (
          <Ionicons name="add" size={32} color="#D2691E" />
        )}
        <Text style={styles.addButtonText}>
          {isUploading ? 'Uploading...' : 'Add Media'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderMediaViewer = () => {
    if (!selectedMedia) return null;

    return (
      <Modal
        visible={!!selectedMedia}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedMedia(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedMedia.name}</Text>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => removeMedia(selectedMedia.id)}
                >
                  <Ionicons name="trash" size={20} color="#EF4444" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setSelectedMedia(null)}
                >
                  <Ionicons name="close" size={20} color="#666666" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.modalBody}>
              {selectedMedia.type === 'photo' && (
                <Image 
                  source={{ uri: selectedMedia.uri }} 
                  style={styles.fullImage}
                  resizeMode="contain"
                />
              )}
              
              {selectedMedia.type === 'video' && (
                <Video
                  source={{ uri: selectedMedia.uri }}
                  style={styles.fullVideo}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                  shouldPlay={false}
                />
              )}
              
              {selectedMedia.type === 'document' && (
                <View style={styles.documentPreview}>
                  <Ionicons 
                    name={getMediaIcon(selectedMedia.type, selectedMedia.mimeType) as any} 
                    size={64} 
                    color="#D2691E" 
                  />
                  <Text style={styles.documentPreviewName}>
                    {selectedMedia.name}
                  </Text>
                  <Text style={styles.documentPreviewType}>
                    {selectedMedia.mimeType}
                  </Text>
                  {selectedMedia.size && (
                    <Text style={styles.documentPreviewSize}>
                      {formatFileSize(selectedMedia.size)}
                    </Text>
                  )}
                </View>
              )}

              <View style={styles.mediaDetails}>
                <Text style={styles.detailLabel}>Added:</Text>
                <Text style={styles.detailValue}>
                  {new Date(selectedMedia.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const renderAddMenu = () => {
    return (
      <Modal
        visible={showAddMenu}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddMenu(false)}
      >
        <View style={styles.menuOverlay}>
          <View style={styles.menuContent}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Add Media</Text>
              <TouchableOpacity onPress={() => setShowAddMenu(false)}>
                <Ionicons name="close" size={24} color="#666666" />
              </TouchableOpacity>
            </View>

            <View style={styles.menuOptions}>
              {allowedTypes.includes('photo') && (
                <>
                  <TouchableOpacity
                    style={styles.menuOption}
                    onPress={() => addPhoto(true)}
                  >
                    <Ionicons name="camera" size={24} color="#D2691E" />
                    <Text style={styles.menuOptionText}>Take Photo</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.menuOption}
                    onPress={() => addPhoto(false)}
                  >
                    <Ionicons name="image" size={24} color="#D2691E" />
                    <Text style={styles.menuOptionText}>Choose Photo</Text>
                  </TouchableOpacity>
                </>
              )}

              {allowedTypes.includes('video') && (
                <TouchableOpacity
                  style={styles.menuOption}
                  onPress={addVideo}
                >
                  <Ionicons name="videocam" size={24} color="#D2691E" />
                  <Text style={styles.menuOptionText}>Add Video</Text>
                </TouchableOpacity>
              )}

              {allowedTypes.includes('document') && (
                <TouchableOpacity
                  style={styles.menuOption}
                  onPress={addDocument}
                >
                  <Ionicons name="document" size={24} color="#D2691E" />
                  <Text style={styles.menuOptionText}>Add Document</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>Media Gallery</Text>
        <Text style={styles.subtitle}>
          {mediaItems.length} of {maxItems} items
        </Text>
      </View>

      <ScrollView style={styles.gallery} showsVerticalScrollIndicator={false}>
        <View style={styles.mediaGrid}>
          {mediaItems.map(renderMediaItem)}
          {renderAddButton()}
        </View>
      </ScrollView>

      {renderMediaViewer()}
      {renderAddMenu()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333333',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  gallery: {
    maxHeight: 400,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 8,
  },
  mediaItem: {
    width: ITEM_SIZE,
    marginBottom: 16,
  },
  mediaImage: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  videoContainer: {
    position: 'relative',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
  },
  documentContainer: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: 8,
    backgroundColor: '#FFF8F0',
    borderWidth: 1,
    borderColor: '#D2691E',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  documentName: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#8B4513',
    textAlign: 'center',
    marginTop: 4,
  },
  mediaInfo: {
    marginTop: 4,
  },
  mediaName: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#333333',
  },
  mediaSize: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  addButton: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#D2691E',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8F0',
  },
  addButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#D2691E',
    marginTop: 4,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 20,
    maxHeight: '90%',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333333',
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
  },
  modalButton: {
    padding: 8,
  },
  modalBody: {
    flex: 1,
  },
  fullImage: {
    width: '100%',
    height: 300,
  },
  fullVideo: {
    width: '100%',
    height: 300,
  },
  documentPreview: {
    alignItems: 'center',
    padding: 32,
  },
  documentPreviewName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333333',
    marginTop: 16,
    textAlign: 'center',
  },
  documentPreviewType: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginTop: 4,
  },
  documentPreviewSize: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#999999',
    marginTop: 4,
  },
  mediaDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666666',
  },
  detailValue: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333333',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333333',
  },
  menuOptions: {
    padding: 20,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 16,
  },
  menuOptionText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#333333',
  },
}); 