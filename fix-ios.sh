#!/bin/bash
# Fix iOS project name from DiscoverMusicTemp to DiscoverMusic

set -e

cd "$(dirname "$0")/ios"

echo "🔧 Fixing iOS project name..."

# Rename folders
if [ -d "DiscoverMusicTemp" ]; then
    mv DiscoverMusicTemp DiscoverMusic
    echo "✅ Renamed DiscoverMusicTemp folder to DiscoverMusic"
fi

if [ -d "DiscoverMusicTemp.xcodeproj" ]; then
    mv DiscoverMusicTemp.xcodeproj DiscoverMusic.xcodeproj
    echo "✅ Renamed .xcodeproj"
fi

if [ -d "DiscoverMusicTemp.xcworkspace" ]; then
    mv DiscoverMusicTemp.xcworkspace DiscoverMusic.xcworkspace
    echo "✅ Renamed .xcworkspace"
fi

if [ -d "DiscoverMusicTempTests" ]; then
    mv DiscoverMusicTempTests DiscoverMusicTests
    echo "✅ Renamed Tests folder"
fi

# Update file contents
echo "📝 Updating file references..."

find . -name "*.pbxproj" -type f -exec sed -i '' 's/DiscoverMusicTemp/DiscoverMusic/g' {} \;
find . -name "*.plist" -type f -exec sed -i '' 's/DiscoverMusicTemp/DiscoverMusic/g' {} \;
find . -name "*.xcscheme" -type f -exec sed -i '' 's/DiscoverMusicTemp/DiscoverMusic/g' {} \;
find . -name "*.m" -type f -exec sed -i '' 's/DiscoverMusicTemp/DiscoverMusic/g' {} \;
find . -name "*.h" -type f -exec sed -i '' 's/DiscoverMusicTemp/DiscoverMusic/g' {} \;
find . -name "*.mm" -type f -exec sed -i '' 's/DiscoverMusicTemp/DiscoverMusic/g' {} \;

echo "✅ File contents updated"

# Install pods
echo "📦 Installing CocoaPods dependencies..."
pod install

echo ""
echo "✅ iOS project setup complete!"
echo "You can now run: npm run ios"

