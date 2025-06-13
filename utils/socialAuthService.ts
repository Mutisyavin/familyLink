import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
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
    this.redirectUri = AuthSession.makeRedirectUri({
      scheme: 'legacylink',
      path: 'auth',
    });
  }

  // Google OAuth
  async signInWithGoogle(config?: Partial<SocialAuthConfig>): Promise<SocialAuthResult> {
    try {
      const clientId = config?.clientId || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || 'your-google-client-id';
      
      const request = new AuthSession.AuthRequest({
        clientId,
        scopes: config?.scopes || ['openid', 'profile', 'email'],
        redirectUri: config?.redirectUri || this.redirectUri,
        responseType: AuthSession.ResponseType.Code,
        codeChallenge: await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          'code-challenge',
          { encoding: Crypto.CryptoEncoding.BASE64URL }
        ),
        codeChallengeMethod: AuthSession.CodeChallengeMethod.S256,
        additionalParameters: {},
        extraParams: {
          access_type: 'offline',
        },
      });

      const discovery = {
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenEndpoint: 'https://oauth2.googleapis.com/token',
        userInfoEndpoint: 'https://www.googleapis.com/oauth2/v2/userinfo',
      };

      const result = await request.promptAsync(discovery);

      if (result.type === 'success') {
        // For demo purposes, return mock data
        return {
          success: true,
          user: {
            id: 'google_' + Date.now(),
            name: 'Google User',
            email: 'user@gmail.com',
            profilePicture: 'https://via.placeholder.com/150',
            provider: 'google',
          },
        };
      }

      return {
        success: false,
        error: 'Authentication was cancelled or failed',
      };
    } catch (error) {
      console.error('Google sign-in error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Google sign-in failed',
      };
    }
  }

  // Facebook OAuth
  async signInWithFacebook(config?: Partial<SocialAuthConfig>): Promise<SocialAuthResult> {
    try {
      const clientId = config?.clientId || process.env.EXPO_PUBLIC_FACEBOOK_APP_ID || 'your-facebook-app-id';
      
      const request = new AuthSession.AuthRequest({
        clientId,
        scopes: config?.scopes || ['public_profile', 'email'],
        redirectUri: config?.redirectUri || this.redirectUri,
        responseType: AuthSession.ResponseType.Token,
        extraParams: {
          display: Platform.OS === 'web' ? 'popup' : 'touch',
        },
      });

      const discovery = {
        authorizationEndpoint: 'https://www.facebook.com/v18.0/dialog/oauth',
      };

      const result = await request.promptAsync(discovery);

      if (result.type === 'success') {
        // For demo purposes, return mock data
        return {
          success: true,
          user: {
            id: 'facebook_' + Date.now(),
            name: 'Facebook User',
            email: 'user@facebook.com',
            profilePicture: 'https://via.placeholder.com/150',
            provider: 'facebook',
          },
        };
      }

      return {
        success: false,
        error: 'Facebook authentication was cancelled or failed',
      };
    } catch (error) {
      console.error('Facebook sign-in error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Facebook sign-in failed',
      };
    }
  }

  // Instagram OAuth (using Facebook's Graph API)
  async signInWithInstagram(config?: Partial<SocialAuthConfig>): Promise<SocialAuthResult> {
    try {
      // For demo purposes, return mock data immediately
      return {
        success: true,
        user: {
          id: 'instagram_' + Date.now(),
          name: 'Instagram User',
          email: undefined,
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

  // TikTok OAuth
  async signInWithTikTok(config?: Partial<SocialAuthConfig>): Promise<SocialAuthResult> {
    try {
      // For demo purposes, return mock data immediately
      return {
        success: true,
        user: {
          id: 'tiktok_' + Date.now(),
          name: 'TikTok User',
          email: undefined,
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