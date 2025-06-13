import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

interface VoiceRecorderProps {
  existingVoiceUri?: string;
  onVoiceRecorded: (uri: string) => void;
  onVoiceRemoved: () => void;
  style?: any;
}

export default function VoiceRecorder({
  existingVoiceUri,
  onVoiceRecorded,
  onVoiceRemoved,
  style,
}: VoiceRecorderProps) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [playbackPosition, setPlaybackPosition] = useState(0);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (recording) {
        recording.stopAndUnloadAsync();
      }
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const requestPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant microphone permission to record voice notes.'
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  };

  const startRecording = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      setIsLoading(true);

      // Configure audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recordingOptions = {
        android: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      };

      const { recording: newRecording } = await Audio.Recording.createAsync(recordingOptions);
      setRecording(newRecording);
      setIsRecording(true);
      setRecordingDuration(0);

      // Update recording duration
      newRecording.setOnRecordingStatusUpdate((status) => {
        if (status.isRecording) {
          setRecordingDuration(Math.floor(status.durationMillis || 0));
        }
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsLoading(true);
      setIsRecording(false);

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri) {
        onVoiceRecorded(uri);
        Alert.alert('Success', 'Voice note recorded successfully!');
      }

      setRecording(null);
      setRecordingDuration(0);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to save recording. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const playSound = async () => {
    try {
      if (!existingVoiceUri) return;

      setIsLoading(true);

      // Stop any existing sound
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: existingVoiceUri },
        { shouldPlay: true }
      );

      setSound(newSound);
      setIsPlaying(true);

      // Update playback status
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setPlaybackDuration(status.durationMillis || 0);
          setPlaybackPosition(status.positionMillis || 0);
          
          if (status.didJustFinish) {
            setIsPlaying(false);
            setPlaybackPosition(0);
          }
        }
      });
    } catch (error) {
      console.error('Failed to play sound:', error);
      Alert.alert('Error', 'Failed to play voice note.');
    } finally {
      setIsLoading(false);
    }
  };

  const stopSound = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        setIsPlaying(false);
        setPlaybackPosition(0);
      }
    } catch (error) {
      console.error('Failed to stop sound:', error);
    }
  };

  const removeVoiceNote = () => {
    Alert.alert(
      'Remove Voice Note',
      'Are you sure you want to remove this voice note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            if (sound) {
              sound.unloadAsync();
              setSound(null);
            }
            setIsPlaying(false);
            setPlaybackPosition(0);
            setPlaybackDuration(0);
            onVoiceRemoved();
          },
        },
      ]
    );
  };

  const formatDuration = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Voice Note</Text>
      
      {existingVoiceUri ? (
        <View style={styles.playbackContainer}>
          <View style={styles.playbackInfo}>
            <Ionicons name="mic" size={20} color="#8B4513" />
            <Text style={styles.durationText}>
              {formatDuration(playbackPosition)} / {formatDuration(playbackDuration)}
            </Text>
          </View>
          
          <View style={styles.playbackControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={isPlaying ? stopSound : playSound}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons 
                  name={isPlaying ? "stop" : "play"} 
                  size={20} 
                  color="#FFFFFF" 
                />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.removeButton}
              onPress={removeVoiceNote}
            >
              <Ionicons name="trash" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.recordingContainer}>
          {isRecording ? (
            <View style={styles.recordingActive}>
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingText}>Recording...</Text>
              </View>
              <Text style={styles.durationText}>
                {formatDuration(recordingDuration)}
              </Text>
              <TouchableOpacity
                style={styles.stopButton}
                onPress={stopRecording}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="stop" size={24} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.recordButton}
              onPress={startRecording}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="mic" size={24} color="#FFFFFF" />
                  <Text style={styles.recordButtonText}>Record Voice Note</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#333333',
    marginBottom: 12,
  },
  recordingContainer: {
    alignItems: 'center',
  },
  recordButton: {
    backgroundColor: '#D2691E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    gap: 8,
  },
  recordButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  recordingActive: {
    alignItems: 'center',
    gap: 12,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  recordingText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#EF4444',
  },
  durationText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  stopButton: {
    backgroundColor: '#EF4444',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playbackContainer: {
    gap: 12,
  },
  playbackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playbackControls: {
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    backgroundColor: '#8B4513',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  removeButton: {
    backgroundColor: '#EF4444',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 