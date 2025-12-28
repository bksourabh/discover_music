#!/bin/bash

# Setup script for iOS development
# This script initializes the iOS native project structure

set -e

echo "🚀 Setting up iOS project structure..."

# Check if iOS folder already exists
if [ -d "ios" ]; then
    echo "⚠️  iOS folder already exists. Skipping initialization."
    echo "If you want to reinitialize, delete the ios folder first."
    exit 0
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Get app name from package.json or use default
APP_NAME=$(node -p "require('./package.json').name" 2>/dev/null || echo "DiscoverMusic")
APP_NAME="${APP_NAME//-/_}"  # Replace hyphens with underscores for iOS
APP_NAME="DiscoverMusic"  # Use consistent name

echo "📦 Installing npm dependencies..."
npm install

echo "🔨 Initializing iOS project structure..."
echo "Creating temporary React Native project to copy iOS structure..."

# Create a temporary React Native project to copy iOS folder
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"

echo "Running: npx @react-native-community/cli init $APP_NAME --template react-native-template-typescript --skip-install"
npx @react-native-community/cli init "$APP_NAME" --template react-native-template-typescript --skip-install

cd -

echo "📂 Copying iOS folder..."
if [ -d "$TEMP_DIR/$APP_NAME/ios" ]; then
    cp -r "$TEMP_DIR/$APP_NAME/ios" .
    
    # Update project name in Info.plist if needed
    if [ -f "ios/$APP_NAME/Info.plist" ]; then
        # The Info.plist should have the correct bundle identifier
        echo "✅ iOS project structure copied"
    fi
else
    echo "❌ Error: Could not find iOS folder in template project"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Copy .watchmanconfig if it exists
if [ -f "$TEMP_DIR/$APP_NAME/.watchmanconfig" ]; then
    cp "$TEMP_DIR/$APP_NAME/.watchmanconfig" . 2>/dev/null || true
fi

# Clean up temp directory
rm -rf "$TEMP_DIR"

# Check if CocoaPods is installed
if ! command -v pod &> /dev/null; then
    echo "⚠️  CocoaPods not found. Installing..."
    echo "Please run: sudo gem install cocoapods"
    echo "Then run this script again."
    exit 1
fi

echo "📱 Installing CocoaPods dependencies..."
cd ios
pod install
cd ..

echo ""
echo "✅ iOS setup complete!"
echo ""
echo "📱 To run on iOS simulator:"
echo "  1. Terminal 1: npm start"
echo "  2. Terminal 2: npm run ios"
echo ""
echo "Or run: npm run ios (which will start Metro automatically)"

