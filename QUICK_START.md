# Quick Start Guide - Running on iPhone Simulator

## Quick Setup (Recommended)

1. **Run the setup script**:
   ```bash
   ./setup-ios.sh
   ```

This will automatically:
- Install npm dependencies
- Create the iOS project structure
- Install CocoaPods dependencies

## Manual Setup (Alternative)

If the script doesn't work, follow these steps:

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Initialize iOS project** (creates a temp project to copy iOS folder):
   ```bash
   TEMP_DIR=$(mktemp -d)
   cd "$TEMP_DIR"
   npx react-native init DiscoverMusicTemp --template react-native-template-typescript --skip-install
   cd -
   cp -r "$TEMP_DIR/DiscoverMusicTemp/ios" .
   rm -rf "$TEMP_DIR"
   ```

3. **Install CocoaPods** (if not installed):
   ```bash
   sudo gem install cocoapods
   ```

4. **Install iOS dependencies**:
   ```bash
   cd ios
   pod install
   cd ..
   ```

## Running on iPhone Simulator

### Method 1: Using npm scripts (Easiest)

1. **Start Metro bundler** (Terminal 1):
   ```bash
   npm start
   ```

2. **Run on iOS simulator** (Terminal 2):
   ```bash
   npm run ios
   ```

This will automatically:
- Open the iOS Simulator
- Build and install the app
- Launch the app

### Method 2: Specify iPhone model

To run on a specific iPhone model:

```bash
npx react-native run-ios --simulator="iPhone 14 Pro"
```

Available simulators:
```bash
xcrun simctl list devices available
```

### Method 3: Using Xcode

1. **Open the workspace**:
   ```bash
   open ios/DiscoverMusic.xcworkspace
   ```
   (Note: Open `.xcworkspace`, not `.xcodeproj`)

2. **Select a simulator** from the device dropdown in Xcode

3. **Click the Run button** (▶️) or press `Cmd+R`

## Troubleshooting

### "Command 'pod' not found"
Install CocoaPods:
```bash
sudo gem install cocoapods
```

### "No iOS project found"
Make sure you've run the setup script or manually created the `ios/` folder.

### Build errors
1. Clean the build in Xcode: Product → Clean Build Folder (Shift+Cmd+K)
2. Delete Pods and reinstall:
   ```bash
   cd ios
   rm -rf Pods Podfile.lock
   pod install
   cd ..
   ```

### Metro bundler issues
Clear cache and restart:
```bash
npm start -- --reset-cache
```

### App crashes or doesn't load
1. Make sure Metro bundler is running (`npm start`)
2. Check console logs in Xcode
3. Try rebuilding: `npm run ios`

## Next Steps

Once the app is running:
1. You'll see the login screen (authentication needs to be configured)
2. The app will work for testing note generation and database features
3. Configure authentication (Google, Facebook, Apple) for full functionality

For more details, see:
- `README.md` - Full documentation
- `SETUP.md` - Detailed setup instructions
- `RUN_IOS.md` - iOS-specific troubleshooting

