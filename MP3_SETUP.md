# MP3 Piano Notes Setup Guide

This guide explains how to set up the MP3 piano note files for different platforms.

## Web Setup

The MP3 files are automatically served from the `piano-mp3/` folder when running the web version. The webpack dev server is configured to serve files from this directory at `/piano-mp3/`.

**No additional setup needed for web!**

## Android Setup

For Android, MP3 files need to be placed in the Android resources folder:

1. Create the raw resources directory (if it doesn't exist):
   ```bash
   mkdir -p android/app/src/main/res/raw
   ```

2. Copy all MP3 files from `piano-mp3/` to `android/app/src/main/res/raw/`:
   ```bash
   cp piano-mp3/*.mp3 android/app/src/main/res/raw/
   ```

   **Important**: The files in `res/raw/` must NOT have the `.mp3` extension in their filenames when referenced in code (react-native-sound handles this), but they should still be `.mp3` files in the filesystem.

3. Rebuild your Android app:
   ```bash
   npm run android
   ```

**Note**: Android file naming restrictions:
- File names must be lowercase
- File names cannot contain spaces or special characters (except underscores and dots)
- If your MP3 files have uppercase letters or special characters, you may need to rename them to lowercase

## iOS Setup

For iOS, MP3 files need to be added to the Xcode project bundle:

### Option 1: Using Xcode (Recommended)

1. Open your iOS project in Xcode:
   ```bash
   open ios/DiscoverMusicTemp.xcworkspace
   ```

2. In Xcode, right-click on your project folder in the Project Navigator
3. Select "Add Files to [YourProjectName]..."
4. Navigate to the `piano-mp3` folder
5. Select all MP3 files (Cmd+A to select all)
6. **Important**: Make sure to check:
   - ✅ "Copy items if needed"
   - ✅ "Create groups" (not "Create folder references")
   - ✅ Target membership is checked for your app target
7. Click "Add"

### Option 2: Using React Native Asset Linking

Alternatively, you can use react-native's asset system. However, `react-native-sound` with `Sound.MAIN_BUNDLE` expects files to be in the bundle root.

You may need to modify the `loadSound` function in `src/utils/audioPlayer.ts` to use a different path format for iOS if the above doesn't work.

### Verify iOS Setup

After adding the files, rebuild the iOS app:
```bash
npm run ios
```

If you encounter issues, check that:
- Files are actually included in the app bundle (check Build Phases > Copy Bundle Resources)
- File names match exactly (case-sensitive on iOS)

## Troubleshooting

### Android: "Error loading sound"
- Verify files are in `android/app/src/main/res/raw/`
- Check file names are lowercase and match the expected format (e.g., `c4.mp3`, `db4.mp3`)
- Rebuild the app after adding files

### iOS: "Error loading sound"
- Verify files are included in the Xcode project
- Check that files are in "Copy Bundle Resources" build phase
- Ensure file names match exactly (case-sensitive)
- Try cleaning the build folder in Xcode (Product > Clean Build Folder)

### Web: Audio files not loading
- Check browser console for 404 errors
- Verify the webpack dev server is running and serving files from `piano-mp3/`
- Check that file paths in `audioPlayer.web.ts` match the served paths

## File Naming Convention

The MP3 files should be named using the following format:
- Natural notes: `C4.mp3`, `D5.mp3`, etc.
- Sharps (converted to flats in filenames): `C#4` → `Db4.mp3`, `F#5` → `Gb5.mp3`
- Flats: `Bb3.mp3`, `Eb4.mp3`, etc.

The mapping is handled automatically by `src/utils/noteToMp3.ts`.

