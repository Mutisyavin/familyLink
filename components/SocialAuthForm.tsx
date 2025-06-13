import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { socialAuthService, SocialAuthResult } from '@/utils/socialAuthService';

const { width } = Dimensions.get('window');

interface SocialAuthFormProps {
  onAuthSuccess: (user: any) => void;
  onAuthError: (error: string) => void;
  mode: 'signin' | 'signup';
  onModeChange: (mode: 'signin' | 'signup') => void;
}

export default function SocialAuthForm({
  onAuthSuccess,
  onAuthError,
  mode,
  onModeChange,
}: SocialAuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const socialProviders = [
    {
      id: 'google',
      name: 'Google',
      icon: 'logo-google',
      color: '#DB4437',
      backgroundColor: '#FFFFFF',
      textColor: '#333333',
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: 'logo-facebook',
      color: '#4267B2',
      backgroundColor: '#4267B2',
      textColor: '#FFFFFF',
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: 'logo-instagram',
      color: '#E4405F',
      backgroundColor: '#E4405F',
      textColor: '#FFFFFF',
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: 'musical-notes',
      color: '#000000',
      backgroundColor: '#000000',
      textColor: '#FFFFFF',
    },
  ];

  const handleSocialAuth = async (provider: 'google' | 'facebook' | 'instagram' | 'tiktok') => {
    setLoadingProvider(provider);
    
    try {
      const result: SocialAuthResult = await socialAuthService.signInWithProvider(provider);
      
      if (result.success && result.user) {
        onAuthSuccess({
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          profilePicture: result.user.profilePicture,
          provider: result.user.provider,
          authMethod: 'social',
        });
      } else {
        onAuthError(result.error || `${provider} authentication failed`);
      }
    } catch (error) {
      onAuthError(error instanceof Error ? error.message : `${provider} authentication failed`);
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (mode === 'signup') {
      if (!name) {
        Alert.alert('Error', 'Please enter your name');
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }
      if (password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters long');
        return;
      }
    }

    setIsLoading(true);

    try {
      // Simulate email authentication
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onAuthSuccess({
        id: 'email_' + Date.now(),
        name: name || email.split('@')[0],
        email: email,
        profilePicture: null,
        provider: 'email',
        authMethod: 'email',
      });
    } catch (error) {
      onAuthError(error instanceof Error ? error.message : 'Email authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const renderSocialButton = (provider: typeof socialProviders[0]) => (
    <TouchableOpacity
      key={provider.id}
      style={[
        styles.socialButton,
        {
          backgroundColor: provider.backgroundColor,
          borderColor: provider.color,
        },
      ]}
      onPress={() => handleSocialAuth(provider.id as any)}
      disabled={loadingProvider !== null}
    >
      {loadingProvider === provider.id ? (
        <ActivityIndicator color={provider.textColor} size="small" />
      ) : (
        <Ionicons name={provider.icon as any} size={20} color={provider.textColor} />
      )}
      <Text style={[styles.socialButtonText, { color: provider.textColor }]}>
        Continue with {provider.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
        </Text>
        <Text style={styles.subtitle}>
          {mode === 'signin' 
            ? 'Sign in to continue building your family tree' 
            : 'Join LegacyLink to start preserving your family stories'
          }
        </Text>
      </View>

      {/* Social Authentication Buttons */}
      <View style={styles.socialSection}>
        <Text style={styles.sectionTitle}>Quick Sign {mode === 'signin' ? 'In' : 'Up'}</Text>
        <View style={styles.socialGrid}>
          {socialProviders.map(renderSocialButton)}
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or continue with email</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Email Form */}
      <View style={styles.formSection}>
        {mode === 'signup' && (
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#666666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoComplete="name"
            />
          </View>
        )}

        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#666666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#666666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />
        </View>

        {mode === 'signup' && (
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#666666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoComplete="password"
            />
          </View>
        )}

        <TouchableOpacity
          style={[styles.emailButton, isLoading && styles.emailButtonDisabled]}
          onPress={handleEmailAuth}
          disabled={isLoading || loadingProvider !== null}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.emailButtonText}>
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Mode Switch */}
      <View style={styles.modeSwitch}>
        <Text style={styles.modeSwitchText}>
          {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
        </Text>
        <TouchableOpacity onPress={() => onModeChange(mode === 'signin' ? 'signup' : 'signin')}>
          <Text style={styles.modeSwitchLink}>
            {mode === 'signin' ? 'Sign Up' : 'Sign In'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Terms and Privacy */}
      {mode === 'signup' && (
        <View style={styles.termsSection}>
          <Text style={styles.termsText}>
            By creating an account, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </View>
      )}

      {/* Features Preview */}
      <View style={styles.featuresSection}>
        <Text style={styles.featuresTitle}>Why Choose LegacyLink?</Text>
        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <Ionicons name="camera" size={16} color="#D2691E" />
            <Text style={styles.featureText}>Photo-first family trees</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="mic" size={16} color="#D2691E" />
            <Text style={styles.featureText}>Voice story recording</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="shield-checkmark" size={16} color="#D2691E" />
            <Text style={styles.featureText}>Privacy-focused & secure</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="download" size={16} color="#D2691E" />
            <Text style={styles.featureText}>Export & share easily</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBEB',
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Playfair-Bold',
    color: '#8B4513',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  socialSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
  },
  socialGrid: {
    gap: 12,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  socialButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666666',
    paddingHorizontal: 16,
  },
  formSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333333',
    paddingVertical: 16,
  },
  emailButton: {
    backgroundColor: '#D2691E',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  emailButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  emailButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  modeSwitch: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  modeSwitchText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  modeSwitchLink: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#D2691E',
  },
  termsSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  termsText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: '#D2691E',
    fontFamily: 'Inter-SemiBold',
  },
  featuresSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#FEF3C7',
    marginHorizontal: 24,
    borderRadius: 12,
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#92400E',
    marginBottom: 12,
    textAlign: 'center',
  },
  featuresList: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#92400E',
  },
});