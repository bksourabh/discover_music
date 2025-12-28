#!/bin/bash
# Complete fix for iOS project - rename everything and reinstall pods

set -e

cd /Users/sourabhmazumder/repos/discover_music/ios

echo "🔧 Step 1: Cleaning old Pods..."
rm -rf Pods Podfile.lock

echo "🔧 Step 2: Renaming project folders and files..."

# Rename main project folder
if [ -d "DiscoverMusicTemp" ]; then
    mv DiscoverMusicTemp DiscoverMusic
    echo "✅ Renamed DiscoverMusicTemp folder to DiscoverMusic"
fi

# Rename Xcode project
if [ -d "DiscoverMusicTemp.xcodeproj" ]; then
    mv DiscoverMusicTemp.xcodeproj DiscoverMusic.xcodeproj
    echo "✅ Renamed .xcodeproj"
fi

# Rename workspace if it exists
if [ -d "DiscoverMusicTemp.xcworkspace" ]; then
    mv DiscoverMusicTemp.xcworkspace DiscoverMusic.xcworkspace
    echo "✅ Renamed .xcworkspace"
fi

# Rename Tests folder
if [ -d "DiscoverMusicTempTests" ]; then
    mv DiscoverMusicTempTests DiscoverMusicTests
    echo "✅ Renamed Tests folder"
fi

echo "🔧 Step 3: Updating file contents..."

# Update all references in files
find . -type f \( -name "*.pbxproj" -o -name "*.plist" -o -name "*.xcscheme" -o -name "*.m" -o -name "*.h" -o -name "*.mm" -o -name "*.swift" \) -exec sed -i '' 's/DiscoverMusicTemp/DiscoverMusic/g' {} \;

echo "✅ File contents updated"

echo "🔧 Step 4: Installing CocoaPods..."
pod install

echo ""
echo "✅ iOS project setup complete!"
echo ""
echo "Now run: npm run ios"
echo "Or use the workspace: open ios/DiscoverMusic.xcworkspace"

