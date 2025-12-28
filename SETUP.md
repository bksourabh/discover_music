# Setup Instructions

## Initial Setup

This project was created as a React Native app structure. To complete the setup:

1. **Initialize React Native project structure** (if not already done):
   ```bash
   npx react-native init DiscoverMusic --template react-native-template-typescript
   ```
   Then copy the `src/` folder and configuration files from this project.

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **iOS Setup**:
   ```bash
   cd ios
   pod install
   cd ..
   ```

## Authentication Configuration

### Google Sign-In

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Sign-In API
4. Create OAuth 2.0 credentials (Web client ID)
5. Update `src/services/auth.ts`:
   ```typescript
   GoogleSignin.configure({
     webClientId: 'YOUR_WEB_CLIENT_ID_HERE',
   });
   ```

### Facebook Login

1. Create a Facebook App at [Facebook Developers](https://developers.facebook.com/)
2. Add Facebook Login product
3. Configure OAuth Redirect URIs
4. Update iOS `Info.plist` with Facebook App ID
5. Update Android `strings.xml` with Facebook App ID

### Apple Sign-In (iOS only)

1. Enable "Sign in with Apple" capability in Xcode
2. Install additional package:
   ```bash
   npm install @invertase/react-native-apple-authentication
   ```
3. Update `src/services/auth.ts` to implement Apple Sign-In

## Database

The app uses SQLite via `react-native-sqlite-storage`. The database is automatically initialized when the app starts.

## Audio Playback

The app uses Web Audio API via `react-native-webview` to generate tones programmatically. The current implementation uses sine wave oscillators.

For production:
- Consider using pre-recorded piano sample files
- Or implement a native audio generation module
- Or use a library like `react-native-audio-recorder-player`

## Running the App

```bash
# Start Metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Project Structure

- `src/components/` - Reusable components (AudioPlayer, LoginScreen)
- `src/screens/` - Screen components (MainScreen)
- `src/services/` - Business logic (auth.ts)
- `src/utils/` - Utility functions (database, pianoNotes, audioPlayer)

