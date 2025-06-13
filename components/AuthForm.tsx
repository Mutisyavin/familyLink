import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AuthFormProps {
  mode: 'login' | 'signup';
  onToggleMode: () => void;
  onAuthSuccess: (user: any) => void;
}

export default function AuthForm({ mode, onToggleMode, onAuthSuccess }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (mode === 'signup' && !displayName) {
      Alert.alert('Error', 'Please enter your display name');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement Firebase Auth
      // For now, simulate authentication
      const mockUser = {
        id: Date.now().toString(),
        email,
        displayName: mode === 'signup' ? displayName : email.split('@')[0],
        trees: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setTimeout(() => {
        setLoading(false);
        onAuthSuccess(mockUser);
      }, 1000);
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Authentication failed. Please try again.');
    }
  };

  const handleSocialAuth = async (provider: string) => {
    setLoading(true);
    try {
      // TODO: Implement social authentication
      Alert.alert('Coming Soon', `${provider} authentication will be available soon!`);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', `${provider} authentication failed`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </Text>
        <Text style={styles.subtitle}>
          {mode === 'login' 
            ? 'Sign in to access your family tree' 
            : 'Start building your family legacy'
          }
        </Text>
      </View>

      <View style={styles.form}>
        {mode === 'signup' && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Display Name</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Enter your full name"
              autoCapitalize="words"
            />
          </View>
        )}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={handleEmailAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialButtons}>
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => handleSocialAuth('Google')}
            disabled={loading}
          >
            <Ionicons name="logo-google" size={24} color="#DB4437" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => handleSocialAuth('Facebook')}
            disabled={loading}
          >
            <Ionicons name="logo-facebook" size={24} color="#4267B2" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => handleSocialAuth('Instagram')}
            disabled={loading}
          >
            <Ionicons name="logo-instagram" size={24} color="#E4405F" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => handleSocialAuth('TikTok')}
            disabled={loading}
          >
            <Ionicons name="musical-notes" size={24} color="#000000" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.toggleButton} onPress={onToggleMode}>
          <Text style={styles.toggleText}>
            {mode === 'login' 
              ? "Don't have an account? Sign up" 
              : "Already have an account? Sign in"
            }
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Playfair-Bold',
    color: '#8B4513',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    backgroundColor: '#FAFAFA',
  },
  primaryButton: {
    backgroundColor: '#D2691E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  toggleButton: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingVertical: 16,
  },
  toggleText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#D2691E',
  },
}); 