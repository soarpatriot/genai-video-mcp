# Quick Start Guide

## Step 1: Push to GitHub

```bash
# Add all files
git add .

# Commit
git commit -m "Initial commit: GenAI Video MCP Server"

# Add your GitHub repository (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/genai-video-mcp.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 2: Configure Claude Desktop

Add this to your Claude Desktop config file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

### Option A: Use directly from GitHub (easiest)

```json
{
  "mcpServers": {
    "genai-video": {
      "command": "npx",
      "args": ["-y", "github:YOUR_USERNAME/genai-video-mcp"],
      "env": {
        "VIDEO_API_BASE_URL": "http://localhost:3000",
        "VIDEO_API_BEARER_TOKEN": "your_bearer_token_here"
      }
    }
  }
}
```

### Option B: Use from local clone

```json
{
  "mcpServers": {
    "genai-video": {
      "command": "node",
      "args": ["/Users/I351771/source/genai-video-mcp/src/index.js"],
      "env": {
        "VIDEO_API_BASE_URL": "http://localhost:3000",
        "VIDEO_API_BEARER_TOKEN": "your_bearer_token_here"
      }
    }
  }
}
```

## Step 3: Restart Claude Desktop

Close and reopen Claude Desktop to load the MCP server.

## Step 4: Test It

In Claude Desktop, try:

```
Generate a video: A cinematic shot of a majestic lion in the savannah.
```

or

```
Generate a 16:9 video: A serene beach at sunset with waves crashing, avoid people and buildings.
```

## Troubleshooting

### Config file location not found?

**macOS**:
```bash
mkdir -p ~/Library/Application\ Support/Claude
touch ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Windows**:
```cmd
mkdir %APPDATA%\Claude
type nul > %APPDATA%\Claude\claude_desktop_config.json
```

### Token not working?

Make sure your bearer token:
- Has no extra spaces
- Is enclosed in quotes
- Has proper permissions for the video API

### Still not working?

1. Check Claude Desktop logs (in the app menu)
2. Try the local installation method instead of npx
3. Make sure the API endpoint is accessible
4. Verify your bearer token is valid

## What's Next?

- See [README.md](README.md) for detailed usage
- See [GITHUB_SETUP.md](GITHUB_SETUP.md) for advanced installation options
- Customize the code in `src/index.js` for your needs
