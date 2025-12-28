# Quick Fix for iOS Build Errors

The error shows the project is still using "DiscoverMusicTemp" and CocoaPods files are missing. Run these commands:

## Step 1: Run the fix script

```bash
cd /Users/sourabhmazumder/repos/discover_music
chmod +x fix-ios-complete.sh
./fix-ios-complete.sh
```

## Step 2: If the script doesn't work, run these commands manually:

```bash
cd /Users/sourabhmazumder/repos/discover_music/ios

# Clean old pods
rm -rf Pods Podfile.lock

# Rename folders
mv DiscoverMusicTemp DiscoverMusic
mv DiscoverMusicTemp.xcodeproj DiscoverMusic.xcodeproj
mv DiscoverMusicTempTests DiscoverMusicTests 2>/dev/null || true

# Update file contents (this may take a moment)
find . -type f \( -name "*.pbxproj" -o -name "*.plist" -o -name "*.xcscheme" -o -name "*.m" -o -name "*.h" -o -name "*.mm" \) -exec sed -i '' 's/DiscoverMusicTemp/DiscoverMusic/g' {} \;

# Install pods
pod install

cd ..
```

## Step 3: Run the app

**IMPORTANT:** Use the `.xcworkspace` file, not `.xcodeproj`:

```bash
npm run ios
```

Or open in Xcode:
```bash
open ios/DiscoverMusic.xcworkspace
```

The key issue is that CocoaPods needs to be installed AFTER renaming, so it creates the Pods folder with the correct "DiscoverMusic" name instead of "DiscoverMusicTemp".

