#!/usr/bin/env python3
"""
Fix iOS project name from DiscoverMusicTemp to DiscoverMusic
Run this: python3 fix_ios.py
"""
import os
import shutil
import subprocess
import sys

ios_dir = "/Users/sourabhmazumder/repos/discover_music/ios"
os.chdir(ios_dir)

print("🔧 Fixing iOS project name...")
print()

# Step 1: Clean Pods
print("Step 1: Cleaning old Pods...")
if os.path.exists("Pods"):
    shutil.rmtree("Pods")
    print("✅ Removed Pods folder")
if os.path.exists("Podfile.lock"):
    os.remove("Podfile.lock")
    print("✅ Removed Podfile.lock")

# Step 2: Rename folders
print("\nStep 2: Renaming folders...")
if os.path.exists("DiscoverMusicTemp"):
    shutil.move("DiscoverMusicTemp", "DiscoverMusic")
    print("✅ Renamed DiscoverMusicTemp -> DiscoverMusic")
else:
    print("⚠️  DiscoverMusicTemp folder not found")

if os.path.exists("DiscoverMusicTemp.xcodeproj"):
    shutil.move("DiscoverMusicTemp.xcodeproj", "DiscoverMusic.xcodeproj")
    print("✅ Renamed .xcodeproj")
else:
    print("⚠️  .xcodeproj not found")

if os.path.exists("DiscoverMusicTemp.xcworkspace"):
    shutil.move("DiscoverMusicTemp.xcworkspace", "DiscoverMusic.xcworkspace")
    print("✅ Renamed .xcworkspace")

if os.path.exists("DiscoverMusicTempTests"):
    shutil.move("DiscoverMusicTempTests", "DiscoverMusicTests")
    print("✅ Renamed Tests folder")

# Step 3: Update file contents
print("\nStep 3: Updating file references...")
def replace_in_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        if 'DiscoverMusicTemp' in content:
            new_content = content.replace('DiscoverMusicTemp', 'DiscoverMusic')
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return True
    except Exception as e:
        print(f"⚠️  Error processing {filepath}: {e}")
    return False

# Update all relevant files
updated_count = 0
for root, dirs, files in os.walk(ios_dir):
    # Skip Pods directory if it exists
    if 'Pods' in root:
        continue
    for file in files:
        if file.endswith(('.pbxproj', '.plist', '.xcscheme', '.m', '.h', '.mm', '.swift')):
            filepath = os.path.join(root, file)
            if replace_in_file(filepath):
                updated_count += 1

print(f"✅ Updated {updated_count} files")

# Step 4: Rename scheme file
scheme_path = "DiscoverMusic.xcodeproj/xcshareddata/xcschemes/DiscoverMusicTemp.xcscheme"
new_scheme_path = "DiscoverMusic.xcodeproj/xcshareddata/xcschemes/DiscoverMusic.xcscheme"
if os.path.exists(scheme_path):
    shutil.move(scheme_path, new_scheme_path)
    replace_in_file(new_scheme_path)
    print("✅ Renamed and updated scheme file")

# Step 5: Install pods
print("\nStep 4: Installing CocoaPods...")
print("This may take a few minutes...")
try:
    result = subprocess.run(['pod', 'install'], capture_output=True, text=True)
    if result.returncode == 0:
        print("✅ CocoaPods installed successfully!")
    else:
        print("⚠️  Pod install output:")
        print(result.stdout)
        print(result.stderr)
except FileNotFoundError:
    print("❌ ERROR: CocoaPods not found!")
    print("Install it with: sudo gem install cocoapods")
    sys.exit(1)
except Exception as e:
    print(f"❌ Error running pod install: {e}")
    sys.exit(1)

print("\n" + "="*50)
print("✅✅✅ iOS PROJECT FIXED! ✅✅✅")
print("="*50)
print("\nNow run: npm run ios")
print("Or open: open ios/DiscoverMusic.xcworkspace")

