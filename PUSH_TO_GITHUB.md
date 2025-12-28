# Quick Guide: Push to GitHub

## Step-by-Step Instructions

### 1. Create a GitHub Repository

1. Go to https://github.com/new
2. Enter repository name: `discover_music` (or any name you prefer)
3. **IMPORTANT**: Leave all checkboxes UNCHECKED (no README, .gitignore, or license)
4. Click "Create repository"

### 2. Push Using the Script (Easiest Method)

Run this command in your terminal (replace `YOUR_USERNAME` with your GitHub username):

```bash
./push-to-github.sh https://github.com/YOUR_USERNAME/discover_music.git
```

### 3. Manual Method (Alternative)

If you prefer to do it manually, run these commands:

```bash
# Initialize git (if not already done)
git init

# Stage all files
git add .

# Make initial commit
git commit -m "Initial commit: React Native music discovery app with piano note generator"

# Add your GitHub repository as remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/discover_music.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

### 4. Verify

After pushing, visit your GitHub repository URL. You should see all your project files.

## What Gets Committed

The `.gitignore` file is configured to exclude:
- `node_modules/` - Dependencies (will be installed via `npm install`)
- `ios/Pods/` - CocoaPods dependencies
- `web-build/` - Web build artifacts
- Build files and temporary files
- Environment files (`.env`)

## Need Help?

If you encounter issues:
1. Make sure git is installed: `git --version`
2. Make sure you have GitHub account and are logged in
3. Check that the repository URL is correct
4. If you get authentication errors, you may need to set up SSH keys or use GitHub CLI

