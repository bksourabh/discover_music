# Discover Music - React Native App

A React Native application for iOS, Android, and Web that generates and plays random piano notes from the full 88-key piano range (A0 to C8).

## Features

- **User Authentication**: Login via Facebook, Google, and Apple Sign-In
- **Local Database**: SQLite database (native) / localStorage (web) for storing musical notes and sequences
- **Piano Note Generation**: Random notes from full 88-key piano (A0 27.5Hz to C8 4186Hz)
- **Audio Playback**: Play generated sequences using Web Audio API
- **Sequence Management**: 
  - Remembers last 3 generated sequences
  - Save favorite sequences to database
  - Load and replay recent sequences
  - Export sequences to CSV
- **Cross-Platform**: Works on iOS, Android, and Web browsers

## Prerequisites

- **Node.js** (>= 16)
- **React Native development environment**
- **iOS Development**:
  - macOS (required)
  - Xcode (from Mac App Store)
  - Xcode Command Line Tools: `xcode-select --install`
  - CocoaPods: `sudo gem install cocoapods`
- **Android Development**:
  - Android Studio
  - Android SDK

## Quick Start

### Web (Easiest - No Setup Required)

```bash
# Install dependencies
npm install

# Run in browser (demo mode - skips login)
npm run web:demo

# Or run full app
npm run web
```

### iOS

```bash
# Install dependencies
npm install

# Install iOS dependencies
cd ios && pod install && cd ..

# Run on iOS simulator
npm run ios
```

### Android

```bash
# Install dependencies
npm install

# Run on Android
npm run android
```

## Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. iOS Setup

```bash
# Install CocoaPods (if not already installed)
sudo gem install cocoapods

# Install iOS dependencies
cd ios && pod install && cd ..
```

### 3. Configure Authentication (Optional)

The app works without authentication in demo mode, but for full functionality:

**Google Sign-In:**
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create a new project or select existing one
- Enable Google Sign-In API
- Create OAuth 2.0 credentials (Web client ID)
- Update `src/services/auth.ts` with your Web Client ID

**Facebook Login:**
- Create a Facebook App at [Facebook Developers](https://developers.facebook.com/)
- Add Facebook Login product
- Configure OAuth Redirect URIs
- Update iOS `Info.plist` and Android `strings.xml` with Facebook App ID

**Apple Sign-In (iOS only):**
- Requires Apple Developer account
- Enable "Sign in with Apple" capability in Xcode
- Install: `npm install @invertase/react-native-apple-authentication`

## Running the App

### Web

```bash
# Development mode (with hot reload)
npm run web

# Demo mode (skips login, uses mock user)
npm run web:demo

# Production build
npm run web:build
```

**Web Features:**
- ✅ Piano Note Generation - Full 88-key range
- ✅ Audio Playback - Uses Web Audio API directly
- ✅ Local Storage - Uses localStorage instead of SQLite
- ✅ Note Sequences - Save and load sequences
- ✅ UI Components - All React Native components work via react-native-web

**Web Limitations:**
- ⚠️ Authentication - Facebook/Google/Apple Sign-In need web-specific setup
- ⚠️ Native Modules - Some native modules won't work (SQLite uses localStorage fallback)
- ⚠️ Performance - May be slower than native apps

### iOS

```bash
# Run on iOS simulator (automatically starts Metro bundler)
npm run ios

# Run on specific iPhone model
npx react-native run-ios --simulator="iPhone 14 Pro"

# List available simulators
xcrun simctl list devices available

# Using Xcode (alternative)
open ios/DiscoverMusicTemp.xcworkspace
# Then select simulator and click Run (▶️)
```

**Note:** The app automatically detects if it's running on web vs native and uses the appropriate database and audio implementations.

### Android

```bash
npm run android
```

## Deploying to GitHub Pages

The web version can be automatically deployed to GitHub Pages.

### Automatic Deployment

1. **Enable GitHub Pages in your repository:**
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**
   - Save the settings

2. **Push to main/master branch:**
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

3. **Monitor the deployment:**
   - Go to the **Actions** tab in your GitHub repository
   - You'll see a workflow run called "Deploy to GitHub Pages"
   - Wait for it to complete (usually 2-3 minutes)
   - Once complete, your site will be available at:
     `https://[your-username].github.io/[repository-name]/`

### Manual Deployment

```bash
# Build the web app
npm run web:build

# Deploy using gh-pages (optional)
npx gh-pages -d web-build
```

**Important Notes:**
- The webpack config automatically detects the repository name and sets the correct base path
- A `.nojekyll` file is automatically created to prevent Jekyll processing
- The deployment uses GitHub Actions, so no manual steps are needed after the initial setup

## MP3 Piano Notes Setup

The app can use pre-recorded MP3 piano samples for more realistic sound.

### Web Setup

The MP3 files are automatically served from the `piano-mp3/` folder when running the web version. **No additional setup needed for web!**

### Android Setup

1. Create the raw resources directory:
   ```bash
   mkdir -p android/app/src/main/res/raw
   ```

2. Copy all MP3 files:
   ```bash
   cp piano-mp3/*.mp3 android/app/src/main/res/raw/
   ```

3. Rebuild your Android app:
   ```bash
   npm run android
   ```

**Note:** Android file names must be lowercase and cannot contain spaces or special characters (except underscores and dots).

### iOS Setup

1. Open your iOS project in Xcode:
   ```bash
   open ios/DiscoverMusicTemp.xcworkspace
   ```

2. In Xcode, right-click on your project folder in the Project Navigator
3. Select "Add Files to [YourProjectName]..."
4. Navigate to the `piano-mp3` folder
5. Select all MP3 files (Cmd+A)
6. **Important**: Make sure to check:
   - ✅ "Copy items if needed"
   - ✅ "Create groups" (not "Create folder references")
   - ✅ Target membership is checked for your app target
7. Click "Add"

8. Rebuild the iOS app:
   ```bash
   npm run ios
   ```

### File Naming Convention

- Natural notes: `C4.mp3`, `D5.mp3`, etc.
- Sharps (converted to flats in filenames): `C#4` → `Db4.mp3`, `F#5` → `Gb5.mp3`
- Flats: `Bb3.mp3`, `Eb4.mp3`, etc.

The mapping is handled automatically by `src/utils/noteToMp3.ts`.

## Project Structure

```
src/
  components/          # Reusable components
    AudioPlayer.tsx    # Web Audio API player for generating tones
    Dropdown.tsx       # Dropdown component
    LoginScreen.tsx    # Authentication screen
    PianoKeyboard.tsx  # Piano keyboard component
    TimelineView.tsx   # Timeline visualization
  screens/            # Screen components
    MainScreen.tsx     # Main app screen with note generation
  services/           # Business logic services
    auth.ts           # Authentication service (native)
    auth.web.ts       # Authentication service (web)
  utils/              # Utility functions
    audioPlayer.ts    # Audio playback utilities (native)
    audioPlayer.web.ts # Audio playback utilities (web)
    database.ts       # SQLite database operations (native)
    database.web.ts   # localStorage operations (web)
    noteToMp3.ts      # MP3 file mapping
    pianoNotes.ts     # Piano note generation and calculations
```

## Database Schema

- **recent_sequences**: Stores last 3 generated sequences (auto-managed)
- **saved_sequences**: Stores user-saved favorite sequences

**Data Persistence:**
- **Native (iOS/Android)**: Uses SQLite database stored locally on the device
- **Web**: Uses browser localStorage

All data is stored client-side - there is no server-side database or API.

## Audio Implementation

The app uses Web Audio API to generate piano tones programmatically. For production use, consider:

1. **Pre-recorded Piano Samples**: Use actual piano sample files (.mp3/.wav) for more realistic sound
2. **Tone Generation Library**: Use libraries like `react-native-audio-recorder-player` for better audio generation
3. **Web Audio API**: Current implementation uses WebView with injected JavaScript for tone generation (native) or direct Web Audio API (web)

The `react-native-sound` library is included in dependencies but requires actual audio files. The current implementation uses Web Audio API for programmatic tone generation.

## Troubleshooting

### iOS Issues

**"Command 'pod' not found"**
```bash
sudo gem install cocoapods
```

**"No iOS project found"**
```bash
cd ios && pod install && cd ..
```

**Build errors or "Pod install failed"**
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
npm run ios
```

**App crashes or white screen**
1. Check Metro bundler is running: `npm start`
2. Clear cache: `npm start -- --reset-cache`
3. Clean build in Xcode: Open `ios/DiscoverMusicTemp.xcworkspace`, then Product → Clean Build Folder (Shift+Cmd+K)

**"Unable to resolve module"**
```bash
npm install
cd ios && pod install && cd ..
npm start -- --reset-cache
```

### Web Issues

**"Unload event listeners are deprecated" Warning**
- This is NOT an error in your code! It's a warning from browser extensions or webpack-dev-server
- You can safely ignore it - it's harmless and doesn't affect your app
- To eliminate the warning, temporarily disable browser extensions or use incognito/private mode

**Module not found errors**
```bash
npm install
```

**Webpack fails**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Assets not loading (GitHub Pages)**
- Verify the `publicPath` in `webpack.config.js` matches your repository name
- Check the browser console for 404 errors
- Ensure GitHub Pages is enabled in repository settings

### Android Issues

**"Error loading sound"**
- Verify files are in `android/app/src/main/res/raw/`
- Check file names are lowercase and match the expected format
- Rebuild the app after adding files

### General Issues

**Metro bundler not running**
```bash
npm start
```

**Clear Metro cache**
```bash
npm start -- --reset-cache
```

## Demo Mode

The app includes a demo mode that launches directly to the main screen without requiring authentication.

```bash
# Run demo mode
npm run web:demo

# Build demo for production
npm run web:demo:build
```

**What's Different in Demo Mode:**
- No Authentication Required - Uses a mock user automatically
- Full Functionality - All features work (note generation, audio playback, saving sequences)
- Local Storage - Uses localStorage for data persistence
- Same UI - Identical to the normal app, just without login

## Configuration

### iOS

1. Update `ios/DiscoverMusicTemp/Info.plist` with necessary permissions and URL schemes
2. Configure Sign in with Apple capability in Xcode
3. Update bundle identifier as needed

### Android

1. Update `android/app/build.gradle` with proper package name
2. Update `android/app/src/main/AndroidManifest.xml` with permissions
3. Configure Google Sign-In OAuth client ID in `android/app/build.gradle`

## License

MIT
