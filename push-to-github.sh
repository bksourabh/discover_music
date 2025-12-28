#!/bin/bash

# Script to push project to GitHub
# Usage: ./push-to-github.sh [repository-url]

set -e

REPO_URL=$1

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Setting up GitHub repository...${NC}"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install git first."
    exit 1
fi

# Initialize git if not already initialized
if [ ! -d .git ]; then
    echo -e "${YELLOW}📦 Initializing git repository...${NC}"
    git init
else
    echo -e "${GREEN}✓ Git repository already initialized${NC}"
fi

# Check if there are any changes to commit
if git diff --quiet && git diff --cached --quiet; then
    echo -e "${YELLOW}⚠️  No changes to commit. Checking if already committed...${NC}"
    if git rev-parse --verify HEAD > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Repository already has commits${NC}"
    else
        echo -e "${YELLOW}📝 Making initial commit...${NC}"
        git add .
        git commit -m "Initial commit: React Native music discovery app with piano note generator"
    fi
else
    echo -e "${YELLOW}📝 Staging and committing changes...${NC}"
    git add .
    git commit -m "Initial commit: React Native music discovery app with piano note generator"
fi

# Handle remote repository
if [ -z "$REPO_URL" ]; then
    echo ""
    echo -e "${YELLOW}📋 Next steps:${NC}"
    echo -e "1. Create a new repository on GitHub (https://github.com/new)"
    echo -e "2. Copy the repository URL (e.g., https://github.com/username/discover_music.git)"
    echo -e "3. Run this script again with the URL:"
    echo -e "   ${GREEN}./push-to-github.sh https://github.com/username/discover_music.git${NC}"
    echo ""
    echo -e "Or manually run:"
    echo -e "   ${GREEN}git remote add origin <repository-url>${NC}"
    echo -e "   ${GREEN}git branch -M main${NC}"
    echo -e "   ${GREEN}git push -u origin main${NC}"
    exit 0
fi

# Check if remote already exists
if git remote | grep -q "^origin$"; then
    echo -e "${YELLOW}⚠️  Remote 'origin' already exists. Updating URL...${NC}"
    git remote set-url origin "$REPO_URL"
else
    echo -e "${YELLOW}🔗 Adding remote repository...${NC}"
    git remote add origin "$REPO_URL"
fi

# Rename branch to main if needed
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${YELLOW}🌿 Renaming branch to 'main'...${NC}"
    git branch -M main
fi

# Push to GitHub
echo -e "${YELLOW}📤 Pushing to GitHub...${NC}"
git push -u origin main

echo ""
echo -e "${GREEN}✅ Successfully pushed to GitHub!${NC}"
echo -e "Repository URL: ${BLUE}$REPO_URL${NC}"

