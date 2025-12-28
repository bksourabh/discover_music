#!/bin/bash

# Fix iOS project name

cd /Users/sourabhmazumder/repos/discover_music/ios

# Rename the project folder
if [ -d "DiscoverMusicTemp" ]; then
    mv DiscoverMusicTemp DiscoverMusic
    echo "Renamed DiscoverMusicTemp to DiscoverMusic"
fi

# Rename Xcode project files
if [ -d "DiscoverMusicTemp.xcodeproj" ]; then
    mv DiscoverMusicTemp.xcodeproj DiscoverMusic.xcodeproj
    echo "Renamed .xcodeproj"
fi

if [ -d "DiscoverMusicTemp.xcworkspace" ]; then
    mv DiscoverMusicTemp.xcworkspace DiscoverMusic.xcworkspace
    echo "Renamed .xcworkspace"
fi

# Update references in project files
find . -type f -name "*.pbxproj" -exec sed -i '' 's/DiscoverMusicTemp/DiscoverMusic/g' {} \;
find . -type f -name "*.plist" -exec sed -i '' 's/DiscoverMusicTemp/DiscoverMusic/g' {} \;
find . -type f -name "Podfile" -exec sed -i '' 's/DiscoverMusicTemp/DiscoverMusic/g' {} \;

echo "✅ iOS project renamed to DiscoverMusic"

