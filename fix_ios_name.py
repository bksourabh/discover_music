#!/usr/bin/env python3
import os
import shutil
import re

ios_dir = "/Users/sourabhmazumder/repos/discover_music/ios"

# Rename folders
old_name = "DiscoverMusicTemp"
new_name = "DiscoverMusic"

os.chdir(ios_dir)

# Rename main project folder
if os.path.exists(old_name):
    shutil.move(old_name, new_name)
    print(f"Renamed {old_name} to {new_name}")

# Rename .xcodeproj
old_proj = f"{old_name}.xcodeproj"
new_proj = f"{new_name}.xcodeproj"
if os.path.exists(old_proj):
    shutil.move(old_proj, new_proj)
    print(f"Renamed {old_proj} to {new_proj}")

# Rename .xcworkspace
old_workspace = f"{old_name}.xcworkspace"
new_workspace = f"{new_name}.xcworkspace"
if os.path.exists(old_workspace):
    shutil.move(old_workspace, new_workspace)
    print(f"Renamed {old_workspace} to {new_workspace}")

# Rename Tests folder
old_tests = f"{old_name}Tests"
new_tests = f"{new_name}Tests"
if os.path.exists(old_tests):
    shutil.move(old_tests, new_tests)
    print(f"Renamed {old_tests} to {new_tests}")

# Update text in files
def replace_in_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        new_content = content.replace(old_name, new_name)
        if content != new_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return True
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
    return False

# Update all relevant files
for root, dirs, files in os.walk(ios_dir):
    for file in files:
        if file.endswith(('.pbxproj', '.plist', 'Podfile', '.xcscheme', '.m', '.h', '.mm')):
            filepath = os.path.join(root, file)
            if replace_in_file(filepath):
                print(f"Updated {filepath}")

print("✅ iOS project renamed successfully!")

