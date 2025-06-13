import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

// Complete the auth session for web
WebBrowser.maybeCompleteAuthSession();

export interface SocialAuthResult {
  success: boolean;
  user?: {
    id: string;
    name: string;
    email?: string;
    profilePicture?: string;
    provider: 'google' | 'facebook' | 'instagram' | 'tiktok';
  };
  error?: string;
}

export interface SocialAuthConfig {
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  scopes: string[];
}

class SocialAuthService {
  private redirectUri: string;

  constructor() {
    this.redirectUri = 'legacylink://auth';
  }

  // Google OAuth - Simplified demo version
  async signInWithGoogle(config?: Partial<SocialAuthConfig>): Promise<SocialAuthResult> {
    try {
      // For demo purposes, simulate the OAuth flow
      console.log('Starting Google OAuth flow...');
      
      // In a real implementation, this would open a web browser for OAuth
      // For now, we'll simulate a successful authentication
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return {
        success: true,
        user: {
          id: 'google_' + Date.now(),
          name: 'John Doe',
          email: 'john.doe@gmail.com',
          profilePicture: 'https://via.placeholder.com/150',
          provider: 'google',
        },
      };
    } catch (error) {
      console.error('Google sign-in error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Google sign-in failed',
      };
    }
  }

  // Facebook OAuth - Simplified demo version
  async signInWithFacebook(config?: Partial<SocialAuthConfig>): Promise<SocialAuthResult> {
    try {
      console.log('Starting Facebook OAuth flow...');
      
      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return {
        success: true,
        user: {
          id: 'facebook_' + Date.now(),
          name: 'Jane Smith',
          email: 'jane.smith@facebook.com',
          profilePicture: 'https://via.placeholder.com/150',
          provider: 'facebook',
        },
      };
    } catch (error) {
      console.error('Facebook sign-in error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Facebook sign-in failed',
      };
    }
  }

  // Instagram OAuth - Simplified demo version
  async signInWithInstagram(config?: Partial<SocialAuthConfig>): Promise<SocialAuthResult> {
    try {
      console.log('Starting Instagram OAuth flow...');
      
      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return {
        success: true,
        user: {
          id: 'instagram_' + Date.now(),
          name: 'Alex Johnson',
          email: undefined, // Instagram doesn't always provide email
          profilePicture: 'https://via.placeholder.com/150',
          provider: 'instagram',
        },
      };
    } catch (error) {
      console.error('Instagram sign-in error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Instagram sign-in failed',
      };
    }
  }

  // TikTok OAuth - Simplified demo version
  async signInWithTikTok(config?: Partial<SocialAuthConfig>): Promise<SocialAuthResult> {
    try {
      console.log('Starting TikTok OAuth flow...');
      
      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return {
        success: true,
        user: {
          id: 'tiktok_' + Date.now(),
          name: 'Sam Wilson',
          email: undefined, // TikTok doesn't provide email
          profilePicture: 'https://via.placeholder.com/150',
          provider: 'tiktok',
        },
      };
    } catch (error) {
      console.error('TikTok sign-in error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'TikTok sign-in failed',
      };
    }
  }

  // Generic social sign-in method
  async signInWithProvider(
    provider: 'google' | 'facebook' | 'instagram' | 'tiktok',
    config?: Partial<SocialAuthConfig>
  ): Promise<SocialAuthResult> {
    switch (provider) {
      case 'google':
        return this.signInWithGoogle(config);
      case 'facebook':
        return this.signInWithFacebook(config);
      case 'instagram':
        return this.signInWithInstagram(config);
      case 'tiktok':
        return this.signInWithTikTok(config);
      default:
        return {
          success: false,
          error: 'Unsupported authentication provider',
        };
    }
  }

  // Sign out (clear local session)
  async signOut(): Promise<void> {
    try {
      // Clear any stored tokens or session data
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  // Get redirect URI for configuration
  getRedirectUri(): string {
    return this.redirectUri;
  }
}

export const socialAuthService = new SocialAuthService();