# Running on iPhone Simulator - Step by Step

## Prerequisites Checklist

- [ ] macOS (required for iOS development)
- [ ] Xcode installed from Mac App Store
- [ ] Xcode Command Line Tools: `xcode-select --install`
- [ ] Node.js installed (you have v25.2.1 ✅)
- [ ] npm installed (you have v11.6.2 ✅)

## Step-by-Step Instructions

### Step 1: Install CocoaPods (if not already installed)

```bash
sudo gem install cocoapods
```

### Step 2: Run the Setup Script

```bash
cd /Users/sourabhmazumder/repos/discover_music
./setup-ios.sh
```

This script will:
- Install npm dependencies
- Create the iOS native project structure
- Install CocoaPods dependencies

### Step 3: Run the App

**Option A: Simple (Recommended)**

Just run:
```bash
npm run ios
```

This will:
- Start Metro bundler automatically
- Open iOS Simulator
- Build and launch the app

**Option B: Manual (Two Terminals)**

Terminal 1 - Start Metro bundler:
```bash
npm start
```

Terminal 2 - Run on iOS:
```bash
npm run ios
```

### Step 4: Select iPhone Simulator (if needed)

If you want to use a specific iPhone model:

```bash
# List available simulators
xcrun simctl list devices available

# Run on specific iPhone
npx react-native run-ios --simulator="iPhone 14 Pro"
```

Common iPhone simulators:
- `iPhone 15 Pro`
- `iPhone 14`
- `iPhone 13`
- `iPhone SE (3rd generation)`

## What to Expect

1. **First run** may take a few minutes to build
2. **Metro bundler** will start and show a QR code
3. **iOS Simulator** will open automatically
4. **App will build** and install on the simulator
5. **App launches** showing the login screen

## Troubleshooting

### Issue: "Command 'pod' not found"

**Solution:**
```bash
sudo gem install cocoapods
```

### Issue: "No iOS project found" or "ios/ folder missing"

**Solution:** Run the setup script:
```bash
./setup-ios.sh
```

### Issue: Build errors or "Pod install failed"

**Solution:**
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
npm run ios
```

### Issue: "Metro bundler not running"

**Solution:** Make sure Metro is running:
```bash
npm start
```

In another terminal:
```bash
npm run ios
```

### Issue: App crashes or white screen

**Solution:**
1. Check Metro bundler is running
2. Clear cache: `npm start -- --reset-cache`
3. Clean build in Xcode: Open `ios/DiscoverMusic.xcworkspace`, then Product → Clean Build Folder (Shift+Cmd+K)

### Issue: "Unable to resolve module"

**Solution:**
```bash
npm install
cd ios && pod install && cd ..
npm start -- --reset-cache
```

## Using Xcode (Alternative Method)

If you prefer using Xcode directly:

1. **Open the workspace** (not the .xcodeproj):
   ```bash
   open ios/DiscoverMusic.xcworkspace
   ```

2. **Select a simulator** from the device dropdown (top toolbar)

3. **Click Run** (▶️) or press `Cmd+R`

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm run ios` | Run on iOS simulator |
| `npm start` | Start Metro bundler |
| `npm run ios -- --simulator="iPhone 14"` | Run on specific device |
| `cd ios && pod install` | Install/update CocoaPods |
| `npm start -- --reset-cache` | Clear Metro cache |

## Next Steps

Once the app is running:
1. Test the note generation feature
2. Test database functionality (saving/loading sequences)
3. Configure authentication (see SETUP.md) for full functionality

For more help, see:
- `QUICK_START.md` - Quick reference
- `SETUP.md` - Full setup guide
- `README.md` - Complete documentation

