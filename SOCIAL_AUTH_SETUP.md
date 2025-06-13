# Social Authentication Setup Guide

This guide will help you set up social media authentication for LegacyLink.

## Current Implementation Status

**Demo Mode**: The current implementation is a simplified demo version that simulates social authentication flows. This was implemented to avoid dependency issues with `expo-auth-session` package.

### What's Working Now:
- ✅ Social authentication UI with Google, Facebook, Instagram, TikTok buttons
- ✅ Simulated authentication flows with mock user data
- ✅ Complete authentication form with email fallback
- ✅ User session management with AsyncStorage
- ✅ Seamless navigation after authentication

### For Production Implementation:

To implement real OAuth flows, you'll need to:

## Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# Google OAuth
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id-here
EXPO_PUBLIC_GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# Facebook OAuth
EXPO_PUBLIC_FACEBOOK_APP_ID=your-facebook-app-id-here
EXPO_PUBLIC_FACEBOOK_APP_SECRET=your-facebook-app-secret-here

# Instagram OAuth (uses Facebook's Graph API)
EXPO_PUBLIC_INSTAGRAM_CLIENT_ID=your-instagram-client-id-here
EXPO_PUBLIC_INSTAGRAM_CLIENT_SECRET=your-instagram-client-secret-here

# TikTok OAuth
EXPO_PUBLIC_TIKTOK_CLIENT_KEY=your-tiktok-client-key-here
EXPO_PUBLIC_TIKTOK_CLIENT_SECRET=your-tiktok-client-secret-here
```

## Setup Instructions

### 1. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure OAuth consent screen
6. Add redirect URI: `legacylink://auth`
7. Copy Client ID and Client Secret

### 2. Facebook OAuth Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Configure OAuth redirect URIs: `legacylink://auth`
5. Copy App ID and App Secret

### 3. Instagram OAuth Setup

1. Instagram uses Facebook's Graph API
2. In your Facebook app, add Instagram Basic Display product
3. Configure redirect URI: `legacylink://auth`
4. Copy Client ID and Client Secret

### 4. TikTok OAuth Setup

1. Go to [TikTok Developers](https://developers.tiktok.com/)
2. Create a new app
3. Add Login Kit
4. Configure redirect URI: `legacylink://auth`
5. Copy Client Key and Client Secret

## Implementation Options

### Option 1: Fix expo-auth-session (Recommended for Production)

1. **Reinstall expo-auth-session properly:**
   ```bash
   npm uninstall expo-auth-session
   npm install expo-auth-session@latest
   ```

2. **Update socialAuthService.ts** to use the full OAuth implementation (commented out in current version)

3. **Add back the expo-auth-session plugin** in app.json:
   ```json
   "plugins": [
     "expo-router", 
     "expo-font", 
     "expo-web-browser",
     [
       "expo-auth-session",
       {
         "schemes": ["legacylink"]
       }
     ]
   ]
   ```

### Option 2: Use Alternative Libraries

Consider using:
- **@react-native-google-signin/google-signin** for Google
- **react-native-fbsdk-next** for Facebook
- **Custom WebView implementation** for Instagram/TikTok

### Option 3: Web-based OAuth (Current Approach)

Use `expo-web-browser` to open OAuth URLs and handle redirects manually.

## Testing the Current Demo

1. **Start the development server:**
   ```bash
   npx expo start --tunnel
   ```

2. **Navigate to test page:**
   - Go to `/test-auth` in your app
   - Test all social login buttons
   - Verify mock authentication works

3. **Test the main auth flow:**
   - Go to welcome screen
   - Try "Get Started" or "Sign In"
   - Test social buttons in the authentication form

## Current Demo Features

- **Realistic UI**: Professional social login buttons with brand colors
- **Loading States**: Proper loading indicators during "authentication"
- **Mock Data**: Realistic user data returned from each provider
- **Error Handling**: Proper error states and user feedback
- **Session Management**: User data stored in AsyncStorage
- **Navigation**: Seamless flow after authentication

## Production Deployment

For production deployment:

1. Choose your OAuth implementation approach (see options above)
2. Set up OAuth apps with each provider
3. Configure environment variables
4. Test all social login flows thoroughly
5. Implement proper token refresh and session management
6. Add logout functionality
7. Handle edge cases and errors

## Troubleshooting

### Current Known Issues

1. **expo-auth-session Module Error**: Fixed by using simplified implementation
2. **Missing AuthRequest**: Package corruption resolved by removing dependency

### Common OAuth Issues

1. **Redirect URI Mismatch**: Ensure exact match in provider settings
2. **Invalid Client ID**: Double-check environment variables
3. **Scope Issues**: Verify requested scopes are approved
4. **Platform Restrictions**: Some providers have platform-specific limitations

## Security Notes

- Current demo uses mock data - never use in production
- Implement proper token validation in production
- Use HTTPS for all OAuth redirects
- Store tokens securely (consider using expo-secure-store)
- Implement token refresh mechanisms
- Monitor OAuth usage in provider dashboards

## Next Steps

1. **Choose production OAuth strategy** from the options above
2. **Set up OAuth provider apps** for your chosen platforms
3. **Implement real token exchange** and user data fetching
4. **Add proper error handling** for network issues
5. **Implement logout** and session cleanup
6. **Test thoroughly** on all target platforms 