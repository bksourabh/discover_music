# Fix iOS Project Name

The iOS folder has been created but needs to be renamed. Run these commands in your terminal:

## Quick Fix Commands

Copy and paste these commands one by one:

```bash
cd /Users/sourabhmazumder/repos/discover_music/ios

# Rename the main project folder
mv DiscoverMusicTemp DiscoverMusic

# Rename Xcode project files
mv DiscoverMusicTemp.xcodeproj DiscoverMusic.xcodeproj
mv DiscoverMusicTemp.xcworkspace DiscoverMusic.xcworkspace 2>/dev/null || true

# Rename Tests folder
mv DiscoverMusicTempTests DiscoverMusicTests 2>/dev/null || true

# Update references in Podfile
sed -i '' 's/DiscoverMusicTemp/DiscoverMusic/g' Podfile

# Update references in .pbxproj file
find . -name "*.pbxproj" -exec sed -i '' 's/DiscoverMusicTemp/DiscoverMusic/g' {} \;

# Update references in .plist files
find . -name "*.plist" -exec sed -i '' 's/DiscoverMusicTemp/DiscoverMusic/g' {} \;

# Update references in .xcscheme file
find . -name "*.xcscheme" -exec sed -i '' 's/DiscoverMusicTemp/DiscoverMusic/g' {} \;

# Install CocoaPods
pod install

cd ..
```

## Or Use Python Script

Alternatively, run the Python script:

```bash
python3 fix_ios_name.py
cd ios && pod install && cd ..
```

After this, you should be able to run:

```bash
npm run ios
```

