# GitHub Setup and Installation Guide

This guide covers how to host this MCP server on GitHub and install it directly from the GitHub repository.

## Part 1: Hosting on GitHub

### Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and log in
2. Click the "+" icon in the top right and select "New repository"
3. Fill in the details:
   - Repository name: `genai-video-mcp`
   - Description: "MCP server for AI video generation"
   - Choose Public or Private
   - Do NOT initialize with README (we already have one)
4. Click "Create repository"

### Step 2: Push Your Code to GitHub

Run these commands in your project directory:

```bash
# Make sure you're in the project directory
cd /Users/I351771/source/genai-video-mcp

# Add all files to git
git add .

# Create initial commit
git commit -m "Initial commit: GenAI Video MCP Server"

# Add your GitHub repository as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/genai-video-mcp.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Verify Your Repository

1. Refresh your GitHub repository page
2. You should see all your files uploaded
3. The README.md should be displayed on the repository homepage

---

## Part 2: Installing from GitHub

There are three methods to use the MCP server from GitHub:

### Method 1: Direct Installation via npx (Recommended for Public Repos)

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "genai-video": {
      "command": "npx",
      "args": [
        "-y",
        "github:YOUR_USERNAME/genai-video-mcp"
      ],
      "env": {
        "VIDEO_API_BASE_URL": "http://localhost:3000",
        "VIDEO_API_BEARER_TOKEN": "your_bearer_token_here"
      }
    }
  }
}
```

**Pros:**
- No local installation needed
- Always uses latest version from GitHub
- Easy to update

**Cons:**
- Requires internet connection
- First run may be slower (downloads and builds)

---

### Method 2: Clone and Install Locally

1. **Clone the repository:**

```bash
# Clone to your preferred location
cd ~/projects
git clone https://github.com/YOUR_USERNAME/genai-video-mcp.git
cd genai-video-mcp

# Install dependencies and build
npm install
npm run build
```

2. **Add to Claude Desktop config:**

```json
{
  "mcpServers": {
    "genai-video": {
      "command": "node",
      "args": [
        "/Users/YOUR_USERNAME/projects/genai-video-mcp/dist/index.js"
      ],
      "env": {
        "VIDEO_API_BASE_URL": "http://localhost:3000",
        "VIDEO_API_BEARER_TOKEN": "your_bearer_token_here"
      }
    }
  }
}
```

**Pros:**
- Works offline after initial setup
- Faster startup
- Can modify code locally

**Cons:**
- Takes up local disk space
- Need to manually update (`git pull && npm install && npm run build`)

---

### Method 3: Install as Global NPM Package from GitHub

```bash
# Install globally from GitHub
npm install -g github:YOUR_USERNAME/genai-video-mcp

# Or if you want a specific branch/tag
npm install -g github:YOUR_USERNAME/genai-video-mcp#main
```

Then in Claude Desktop config:

```json
{
  "mcpServers": {
    "genai-video": {
      "command": "genai-video-mcp",
      "env": {
        "VIDEO_API_BASE_URL": "http://localhost:3000",
        "VIDEO_API_BEARER_TOKEN": "your_bearer_token_here"
      }
    }
  }
}
```

**Pros:**
- Easy to use with simple command
- Available system-wide
- Fast startup

**Cons:**
- Need to reinstall for updates
- May conflict with other global packages

---

## Part 3: Publishing to NPM (Optional)

If you want to make it even easier for others to install:

### Step 1: Create NPM Account

1. Go to [npmjs.com](https://www.npmjs.com) and create an account
2. Verify your email

### Step 2: Update package.json

Make sure your `package.json` has a unique name:

```json
{
  "name": "@YOUR_USERNAME/genai-video-mcp",
  "version": "1.0.0",
  ...
}
```

### Step 3: Publish

```bash
# Login to NPM
npm login

# Publish (use --access public for scoped packages)
npm publish --access public
```

### Step 4: Install from NPM

Others can now install with:

```bash
npm install -g @YOUR_USERNAME/genai-video-mcp
```

And use in Claude Desktop config:

```json
{
  "mcpServers": {
    "genai-video": {
      "command": "genai-video-mcp",
      "env": {
        "VIDEO_API_BASE_URL": "http://localhost:3000",
        "VIDEO_API_BEARER_TOKEN": "your_bearer_token_here"
      }
    }
  }
}
```

---

## Part 4: Keeping It Updated

### For GitHub-based Installation (Method 1):

Updates happen automatically on next Claude Desktop restart.

### For Local Clone (Method 2):

```bash
cd ~/projects/genai-video-mcp
git pull
npm install
npm run build
```

Then restart Claude Desktop.

### For Global NPM Install (Method 3):

```bash
npm update -g github:YOUR_USERNAME/genai-video-mcp
# or if published to NPM:
npm update -g @YOUR_USERNAME/genai-video-mcp
```

---

## Part 5: Private Repositories

If your repository is private, you'll need authentication:

### Option 1: Use SSH

```json
{
  "mcpServers": {
    "genai-video": {
      "command": "npx",
      "args": [
        "-y",
        "git+ssh://git@github.com:YOUR_USERNAME/genai-video-mcp.git"
      ],
      "env": {
        "VIDEO_API_BASE_URL": "http://localhost:3000",
        "VIDEO_API_BEARER_TOKEN": "your_bearer_token_here"
      }
    }
  }
}
```

### Option 2: Clone Locally

For private repos, it's often easier to clone locally (Method 2) since you can authenticate once during clone.

---

## Troubleshooting

### "Cannot find module" errors

- Make sure `npm install` and `npm run build` completed successfully
- Check that the path in your config matches your actual installation location

### "Permission denied" errors

- For global installs, you may need `sudo` (not recommended) or fix npm permissions
- Better: use local clone method or npx method

### Authentication issues with private repos

- Set up SSH keys with GitHub
- Or use personal access tokens: `git clone https://YOUR_TOKEN@github.com/YOUR_USERNAME/genai-video-mcp.git`

### Changes not reflected

- Restart Claude Desktop after any configuration changes
- For local installations, make sure to rebuild after pulling updates

---

## Recommended Approach

**For personal use:** Method 2 (Clone and Install Locally)
- Full control, fast startup, works offline

**For sharing with others:** Method 1 (npx with GitHub)
- Easy for users, no installation needed

**For wide distribution:** Publish to NPM
- Most professional, easiest for end users
