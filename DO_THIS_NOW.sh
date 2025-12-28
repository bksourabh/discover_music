#!/bin/bash
# IMMEDIATE FIX - Run this to fix the DiscoverMusicTemp issue

cd /Users/sourabhmazumder/repos/discover_music/ios

echo "🧹 Step 1: Removing old Pods..."
rm -rf Pods Podfile.lock

echo "📦 Step 2: Renaming DiscoverMusicTemp to DiscoverMusic..."

# Rename the main folder
if [ -d "DiscoverMusicTemp" ]; then
    mv DiscoverMusicTemp DiscoverMusic
    echo "✅ Renamed folder"
fi

# Rename Xcode project
if [ -d "DiscoverMusicTemp.xcodeproj" ]; then
    mv DiscoverMusicTemp.xcodeproj DiscoverMusic.xcodeproj
    echo "✅ Renamed .xcodeproj"
fi

# Rename Tests
if [ -d "DiscoverMusicTempTests" ]; then
    mv DiscoverMusicTempTests DiscoverMusicTests
    echo "✅ Renamed Tests"
fi

echo "📝 Step 3: Updating all file references..."

# Update .pbxproj file
if [ -f "DiscoverMusic.xcodeproj/project.pbxproj" ]; then
    sed -i '' 's/DiscoverMusicTemp/DiscoverMusic/g' DiscoverMusic.xcodeproj/project.pbxproj
    echo "✅ Updated project.pbxproj"
fi

# Update scheme file
if [ -f "DiscoverMusic.xcodeproj/xcshareddata/xcschemes/DiscoverMusicTemp.xcscheme" ]; then
    mv DiscoverMusic.xcodeproj/xcshareddata/xcschemes/DiscoverMusicTemp.xcscheme DiscoverMusic.xcodeproj/xcshareddata/xcschemes/DiscoverMusic.xcscheme
    sed -i '' 's/DiscoverMusicTemp/DiscoverMusic/g' DiscoverMusic.xcodeproj/xcshareddata/xcschemes/DiscoverMusic.xcscheme
    echo "✅ Updated scheme"
fi

# Update all other files
find DiscoverMusic -type f \( -name "*.plist" -o -name "*.m" -o -name "*.h" -o -name "*.mm" \) -exec sed -i '' 's/DiscoverMusicTemp/DiscoverMusic/g' {} \;
find DiscoverMusicTests -type f \( -name "*.plist" -o -name "*.m" \) -exec sed -i '' 's/DiscoverMusicTemp/DiscoverMusic/g' {} \; 2>/dev/null || true

echo "✅ Updated all file references"

echo "📦 Step 4: Installing CocoaPods (this will create the workspace)..."
pod install

echo ""
echo "✅✅✅ DONE! ✅✅✅"
echo ""
echo "Now run: npm run ios"

