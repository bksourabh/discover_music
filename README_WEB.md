# Running in Browser

This app can now run in a web browser using React Native Web!

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run in browser:**
   ```bash
   npm run web
   ```

This will:
- Start a webpack dev server
- Open your browser automatically at `http://localhost:3000`
- Hot reload on code changes

## Build for Production

To create a production build:

```bash
npm run web:build
```

The built files will be in the `web-build/` directory.

## Features Available in Browser

✅ **Piano Note Generation** - Full 88-key range  
✅ **Audio Playback** - Uses Web Audio API directly  
✅ **Local Storage** - Uses localStorage instead of SQLite  
✅ **Note Sequences** - Save and load sequences  
✅ **UI Components** - All React Native components work via react-native-web  

## Limitations in Browser

⚠️ **Authentication** - Facebook/Google/Apple Sign-In need web-specific setup  
⚠️ **Native Modules** - Some native modules won't work (SQLite uses localStorage fallback)  
⚠️ **Performance** - May be slower than native apps  

## Notes

- The app automatically detects if it's running on web vs native
- Database operations use localStorage on web, SQLite on native
- Audio playback uses Web Audio API directly on web (no WebView needed)
- All UI components work the same on web and native

## Troubleshooting

If you get module not found errors:
```bash
npm install
```

If webpack fails:
```bash
rm -rf node_modules package-lock.json
npm install
```

