#!/bin/bash

# Script to push GenAI Video MCP to GitHub
# Usage: ./push-to-github.sh YOUR_GITHUB_USERNAME

set -e

if [ -z "$1" ]; then
    echo "Error: GitHub username required"
    echo "Usage: ./push-to-github.sh YOUR_GITHUB_USERNAME"
    exit 1
fi

GITHUB_USERNAME=$1
REPO_NAME="genai-video-mcp"

echo "================================================"
echo "Pushing to GitHub"
echo "User: $GITHUB_USERNAME"
echo "Repo: $REPO_NAME"
echo "================================================"
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "Initializing git repository..."
    git init
fi

# Add all files
echo "Adding files to git..."
git add .

# Commit
echo "Creating commit..."
git commit -m "Initial commit: GenAI Video MCP Server" || echo "No changes to commit"

# Add remote (remove if exists)
echo "Setting up remote..."
git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

# Rename branch to main if needed
echo "Setting main branch..."
git branch -M main

# Push to GitHub
echo "Pushing to GitHub..."
echo ""
echo "NOTE: You may be prompted for your GitHub credentials"
echo ""
git push -u origin main

echo ""
echo "================================================"
echo "✓ Successfully pushed to GitHub!"
echo "================================================"
echo ""
echo "Your repository: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo ""
echo "Next steps:"
echo "1. Go to https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo "2. Verify your code is there"
echo "3. Follow QUICK_START.md to configure Claude Desktop"
echo ""
echo "Quick config for Claude Desktop:"
echo ""
echo "{"
echo "  \"mcpServers\": {"
echo "    \"genai-video\": {"
echo "      \"command\": \"npx\","
echo "      \"args\": [\"-y\", \"github:$GITHUB_USERNAME/$REPO_NAME\"],"
echo "      \"env\": {"
echo "        \"VIDEO_API_BASE_URL\": \"http://localhost:3000\","
echo "        \"VIDEO_API_BEARER_TOKEN\": \"your_bearer_token_here\""
echo "      }"
echo "    }"
echo "  }"
echo "}"
