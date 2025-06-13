# Social Authentication Setup Guide

This guide will help you set up social media authentication for LegacyLink.

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

## Redirect URI Configuration

The app is configured to use the scheme `legacylink://auth` for OAuth redirects.

Make sure to add this redirect URI to all your OAuth provider configurations:
- Google: `legacylink://auth`
- Facebook: `legacylink://auth`
- Instagram: `legacylink://auth`
- TikTok: `legacylink://auth`

## Testing

1. Install dependencies: `npm install`
2. Start the development server: `npx expo start`
3. Test social login buttons in the authentication screen
4. Verify redirect handling works correctly

## Production Deployment

For production deployment:

1. Update redirect URIs in OAuth providers to include production URLs
2. Ensure environment variables are properly set in your deployment environment
3. Test all social login flows in production environment

## Troubleshooting

### Common Issues

1. **Redirect URI Mismatch**: Ensure the redirect URI in your OAuth provider matches exactly
2. **Invalid Client ID**: Double-check your environment variables
3. **Scope Issues**: Verify the requested scopes are approved by the OAuth provider
4. **Platform Restrictions**: Some providers have platform-specific restrictions

### Debug Mode

The social authentication service includes console logging for debugging. Check the console for detailed error messages.

## Security Notes

- Never commit your `.env` file to version control
- Use different OAuth apps for development and production
- Regularly rotate your OAuth secrets
- Monitor OAuth usage in provider dashboards 