# Discover Music - React Native App

A React Native application for iOS and Android that generates and plays random piano notes from the full 88-key piano range (A0 to C8).

## Features

- **User Authentication**: Login via Facebook, Google, and Apple Sign-In
- **Local Database**: SQLite database for storing musical notes and sequences
- **Piano Note Generation**: Random notes from full 88-key piano (A0 27.5Hz to C8 4186Hz)
- **Audio Playback**: Play generated sequences using Web Audio API
- **Sequence Management**: 
  - Remembers last 3 generated sequences
  - Save favorite sequences to database
  - Load and replay recent sequences

## Prerequisites

- Node.js (>= 16)
- React Native development environment set up
- iOS: Xcode and CocoaPods
- Android: Android Studio and Android SDK

## Installation

1. Install dependencies:
```bash
npm install
```

2. For iOS, install pods:
```bash
cd ios && pod install && cd ..
```

3. Configure authentication:

   **Google Sign-In:**
   - Update `src/services/auth.ts` with your Google OAuth client ID
   - Configure Google Sign-In in your Google Cloud Console
   - Follow [@react-native-community/google-signin setup guide](https://github.com/react-native-google-signin/google-signin)

   **Facebook Login:**
   - Set up Facebook App in Facebook Developers Console
   - Configure Facebook SDK in your project
   - Follow [react-native-fbsdk-next setup guide](https://github.com/thebergamo/react-native-fbsdk-next)

   **Apple Sign-In (iOS only):**
   - Requires Apple Developer account
   - Configure Sign in with Apple capability in Xcode
   - Install `@invertase/react-native-apple-authentication` for full implementation

4. Run the app:

```bash
# iOS
npm run ios

# Android
npm run android

# Web (Demo mode - skips login)
npm run web:demo

# Web (Full app)
npm run web
```

## Project Structure

```
src/
  components/          # Reusable components
    AudioPlayer.tsx    # Web Audio API player for generating tones
    LoginScreen.tsx    # Authentication screen
  screens/            # Screen components
    MainScreen.tsx    # Main app screen with note generation
  services/           # Business logic services
    auth.ts           # Authentication service
  utils/              # Utility functions
    audioPlayer.ts    # Audio playback utilities
    database.ts       # SQLite database operations
    pianoNotes.ts     # Piano note generation and calculations
```

## Audio Implementation Note

The app uses Web Audio API via `react-native-webview` to generate piano tones programmatically. For production use, consider:

1. **Pre-recorded Piano Samples**: Use actual piano sample files (.mp3/.wav) for more realistic sound
2. **Tone Generation Library**: Use libraries like `react-native-audio-recorder-player` for better audio generation
3. **Web Audio API**: Current implementation uses WebView with injected JavaScript for tone generation

The `react-native-sound` library is included in dependencies but requires actual audio files. The current implementation uses Web Audio API for programmatic tone generation.

## Database Schema

- **recent_sequences**: Stores last 3 generated sequences (auto-managed)
- **saved_sequences**: Stores user-saved favorite sequences

## Configuration

### iOS

1. Update `ios/DiscoverMusic/Info.plist` with necessary permissions and URL schemes
2. Configure Sign in with Apple capability in Xcode
3. Update bundle identifier as needed

### Android

1. Update `android/app/build.gradle` with proper package name
2. Update `android/app/src/main/AndroidManifest.xml` with permissions
3. Configure Google Sign-In OAuth client ID in `android/app/build.gradle`

## License

MIT

