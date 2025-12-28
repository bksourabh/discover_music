# Running on iOS Simulator

## Prerequisites

1. **macOS** - Required for iOS development
2. **Xcode** - Install from Mac App Store (includes iOS Simulator)
3. **Xcode Command Line Tools**:
   ```bash
   xcode-select --install
   ```
4. **CocoaPods** - Install if not already installed:
   ```bash
   sudo gem install cocoapods
   ```

## Setup Steps

Since this project was created without the native iOS folder structure, you need to initialize it:

### Option 1: Initialize React Native Project (Recommended)

1. **Create a new React Native project** to get the iOS folder structure:
   ```bash
   cd ..
   npx react-native init DiscoverMusicTemp --template react-native-template-typescript
   ```

2. **Copy the iOS folder** to your project:
   ```bash
   cp -r DiscoverMusicTemp/ios discover_music/
   cp DiscoverMusicTemp/.watchmanconfig discover_music/ 2>/dev/null || true
   ```

3. **Remove the temporary project**:
   ```bash
   rm -rf DiscoverMusicTemp
   ```

4. **Install dependencies**:
   ```bash
   cd discover_music
   npm install
   ```

5. **Install iOS dependencies**:
   ```bash
   cd ios
   pod install
   cd ..
   ```

### Option 2: Use React Native CLI to Initialize (Alternative)

If the above doesn't work, you can use:

```bash
npx @react-native-community/cli init DiscoverMusicTemp --template react-native-template-typescript
# Then follow steps 2-5 from Option 1
```

## Running on iOS Simulator

1. **Start Metro Bundler** (in one terminal):
   ```bash
   npm start
   ```

2. **Open iOS Simulator**:
   ```bash
   open -a Simulator
   ```
   
   Or launch from Xcode: Xcode → Open Developer Tool → Simulator

3. **Run the app** (in another terminal):
   ```bash
   npm run ios
   ```
   
   Or specify a simulator:
   ```bash
   npx react-native run-ios --simulator="iPhone 14"
   ```

   Available simulators:
   ```bash
   xcrun simctl list devices available
   ```

## Troubleshooting

### If you get "No iOS project found"

Make sure you've copied the `ios/` folder from a React Native template project.

### If pods fail to install

1. Update CocoaPods:
   ```bash
   sudo gem install cocoapods
   pod repo update
   ```

2. Clean and reinstall:
   ```bash
   cd ios
   rm -rf Pods Podfile.lock
   pod install
   cd ..
   ```

### If build fails

1. Clean build folder in Xcode:
   - Open `ios/DiscoverMusic.xcworkspace` in Xcode
   - Product → Clean Build Folder (Shift+Cmd+K)

2. Clear Metro cache:
   ```bash
   npm start -- --reset-cache
   ```

3. Clear derived data:
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData
   ```

### Common Issues

- **"Command 'pod' not found"**: Install CocoaPods: `sudo gem install cocoapods`
- **"No bundle URL present"**: Make sure Metro bundler is running (`npm start`)
- **Build errors**: Open the project in Xcode and check for missing dependencies

## Alternative: Manual iOS Project Creation

If you prefer, you can also manually create the iOS project structure, but using the React Native CLI template is much easier and ensures proper configuration.

