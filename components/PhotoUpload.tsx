import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Upload, X } from 'lucide-react-native';

interface PhotoUploadProps {
  onPhotoSelected: (uri: string) => void;
  currentPhoto?: string;
  onPhotoRemoved?: () => void;
}

export default function PhotoUpload({
  onPhotoSelected,
  currentPhoto,
  onPhotoRemoved,
}: PhotoUploadProps) {
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    try {
      setIsLoading(true);
      
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to upload family photos.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onPhotoSelected(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const takePhoto = async () => {
    try {
      setIsLoading(true);
      
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow camera access to take photos of family members.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onPhotoSelected(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const showImageOptions = () => {
    if (Platform.OS === 'web') {
      pickImage();
      return;
    }

    Alert.alert(
      'Add Photo',
      'Choose how you\'d like to add a photo',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Photo Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  if (currentPhoto) {
    return (
      <View style={styles.photoContainer}>
        <Image source={{ uri: currentPhoto }} style={styles.uploadedPhoto} />
        {onPhotoRemoved && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={onPhotoRemoved}
          >
            <X size={16} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.uploadContainer}
      onPress={showImageOptions}
      disabled={isLoading}
    >
      <View style={styles.uploadContent}>
        <View style={styles.iconContainer}>
          <Camera size={32} color="#92400E" />
        </View>
        <Text style={styles.uploadTitle}>Add Family Photo</Text>
        <Text style={styles.uploadSubtitle}>
          {Platform.OS === 'web' ? 'Click to browse' : 'Tap to take photo or choose from library'}
        </Text>
        <View style={styles.uploadButton}>
          <Upload size={16} color="#FFFFFF" />
          <Text style={styles.uploadButtonText}>Upload Photo</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  uploadContainer: {
    backgroundColor: '#FEF3C7',
    border: '2px dashed #92400E',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    minHeight: 200,
    justifyContent: 'center',
  },
  uploadContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: '#A16207',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  uploadButton: {
    backgroundColor: '#92400E',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  photoContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  uploadedPhoto: {
    width: 200,
    height: 200,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#F59E0B',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
});