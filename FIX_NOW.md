# URGENT FIX - Run These Commands Now

The project is still named "DiscoverMusicTemp" which is causing all the errors. Run these commands **exactly as shown**:

## Copy and paste this entire block:

```bash
cd /Users/sourabhmazumder/repos/discover_music/ios && \
rm -rf Pods Podfile.lock && \
mv DiscoverMusicTemp DiscoverMusic && \
mv DiscoverMusicTemp.xcodeproj DiscoverMusic.xcodeproj && \
mv DiscoverMusicTempTests DiscoverMusicTests 2>/dev/null; \
find . -type f -name "*.pbxproj" -exec sed -i '' 's/DiscoverMusicTemp/DiscoverMusic/g' {} \; && \
find . -type f -name "*.plist" -exec sed -i '' 's/DiscoverMusicTemp/DiscoverMusic/g' {} \; && \
find . -type f -name "*.xcscheme" -exec sed -i '' 's/DiscoverMusicTemp/DiscoverMusic/g' {} \; && \
find . -type f \( -name "*.m" -o -name "*.h" -o -name "*.mm" \) -exec sed -i '' 's/DiscoverMusicTemp/DiscoverMusic/g' {} \; && \
if [ -f "DiscoverMusic.xcodeproj/xcshareddata/xcschemes/DiscoverMusicTemp.xcscheme" ]; then mv DiscoverMusic.xcodeproj/xcshareddata/xcschemes/DiscoverMusicTemp.xcscheme DiscoverMusic.xcodeproj/xcshareddata/xcschemes/DiscoverMusic.xcscheme; fi && \
pod install && \
cd .. && \
echo "✅ DONE! Now run: npm run ios"
```

## Or run step by step:

```bash
# Go to ios folder
cd /Users/sourabhmazumder/repos/discover_music/ios

# Remove old Pods
rm -rf Pods Podfile.lock

# Rename folders
mv DiscoverMusicTemp DiscoverMusic
mv DiscoverMusicTemp.xcodeproj DiscoverMusic.xcodeproj
mv DiscoverMusicTempTests DiscoverMusicTests

# Update all file contents
find . -type f -name "*.pbxproj" -exec sed -i '' 's/DiscoverMusicTemp/DiscoverMusic/g' {} \;
find . -type f -name "*.plist" -exec sed -i '' 's/DiscoverMusicTemp/DiscoverMusic/g' {} \;
find . -type f -name "*.xcscheme" -exec sed -i '' 's/DiscoverMusicTemp/DiscoverMusic/g' {} \;
find . -type f \( -name "*.m" -o -name "*.h" -o -name "*.mm" \) -exec sed -i '' 's/DiscoverMusicTemp/DiscoverMusic/g' {} \;

# Rename scheme file
if [ -f "DiscoverMusic.xcodeproj/xcshareddata/xcschemes/DiscoverMusicTemp.xcscheme" ]; then
    mv DiscoverMusic.xcodeproj/xcshareddata/xcschemes/DiscoverMusicTemp.xcscheme DiscoverMusic.xcodeproj/xcshareddata/xcschemes/DiscoverMusic.xcscheme
fi

# Install pods
pod install

# Go back
cd ..

# Run the app
npm run ios
```

The key issue is that **everything is still named "DiscoverMusicTemp"** and needs to be renamed to "DiscoverMusic" before CocoaPods can work properly.

