# Demo Mode - Skip Login Screen

This app includes a demo mode that launches directly to the main screen without requiring authentication.

## Run Demo Mode

```bash
npm run web:demo
```

This will:
- Start webpack dev server on port 3001
- Open browser automatically
- Show MainScreen directly with a mock user
- Skip the login screen entirely

## What's Different in Demo Mode

- **No Authentication Required** - Uses a mock user automatically
- **Full Functionality** - All features work (note generation, audio playback, saving sequences)
- **Local Storage** - Uses localStorage for data persistence
- **Same UI** - Identical to the normal app, just without login

## Build Demo for Production

```bash
npm run web:demo:build
```

## Files

- `App.demo.tsx` - Demo version of App component (skips login)
- `index.web.demo.js` - Web entry point for demo mode
- `webpack.demo.config.js` - Webpack config for demo mode

## Use Cases

- **Development** - Test features without setting up authentication
- **Demos** - Show the app functionality quickly
- **Testing** - Test note generation and audio features
- **Prototyping** - Rapid iteration without auth setup

## Notes

- Demo mode uses a mock user: "Demo User" (demo@example.com)
- All database operations work (using localStorage on web)
- Audio playback works the same way
- You can still test saving and loading sequences

